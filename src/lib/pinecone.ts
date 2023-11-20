import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

//create pinconde client instance because we need to use it in multiple places

export const getPineconeClient = async () => {
	return new Pinecone({
		apiKey: process.env.PINECONE_APIKEY!,
		environment: process.env.PINECONE_ENVIRONMENT!,
	})
};

type PDFPage = {
	pageContent: string;
	pageNumber: number;
	metadata: {
		loc: { pageNumber: number; fileKey: string };
	};
};

export async function loadS3intoPinecone(fileKey: string) {
	//1. obtain the pdf -> download and read from pdf
	console.log("downloading file into our file system");
	const file_name = await downloadFromS3(fileKey);

	console.log("file_name", file_name);
	if (!file_name) {
		throw new Error("Could not download file from s3");
	}

	//divide the pdf into pages
	const loader = new PDFLoader(file_name);
	console.log("loading the pdf into our system...🟡", loader);
	const pages = (await loader.load()) as PDFPage[];

	//*2. split and segment the pdf into chunks using langchain(pdfLoader)
	//pages = Array(13)
  //pages.map((page) => prepareDocument(page)) is same as pages.map(prepareDocument)
	const documents = await Promise.all(pages.map(prepareDocument)
	);
	//document = Array(1000) after splitting

	//*3. vectories amd embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocuments))

  //*4. upload the vectors to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = client.Index('chatpdf');

  console.log("vectors", vectors);
  console.log("inserting the vectors into pinecone...🟡");

  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

	console.log("inserting vectors into pinecone");
  await namespace.upsert(vectors);

	console.log("inserted vectors into pinecone...🟢");
  return documents[0];

}

async function embedDocuments(doc: Document) {
	try {
		const embeddings = await getEmbeddings(doc.pageContent);
		const hash = md5(doc.pageContent);
		return {
			id: hash,
			values: embeddings,
			metadata: {
				text: doc.metadata.text,
				pageNumber: doc.metadata.pageNumber,
			},
		} as PineconeRecord;
	} catch (error) {
		console.log("❌ Error in embedDocuments in pinecode.ts :  ", error);
		throw error;
	}
}

//split the page into chunks of text
export const truncateStringByBytes = (str: string, bytes: number) => {
	const enc = new TextEncoder();

	//decode the string and slice it by bytes
	return new TextDecoder().decode(enc.encode(str).slice(0, bytes));
};

//*2. split the pages more further and prepare the document for search
async function prepareDocument(page: PDFPage) {
	let { pageContent, pageNumber, metadata } = page;
	//replace all new lines with spaces
	pageContent = pageContent.replace(/\n/g, "");

	const splitter = new RecursiveCharacterTextSplitter();
	const docs = await splitter.splitDocuments([
		new Document({
			pageContent,
			metadata: {
				pageNumber: metadata.loc.pageNumber,
				text: truncateStringByBytes(pageContent, 36000),
			},
		}),
	]);
	return docs;
}
