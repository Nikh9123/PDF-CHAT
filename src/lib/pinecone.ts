import { Pinecone, PineconeClient } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
	Document,
	RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";

//create pinconde client instance because we need to use it in multiple places
let pinecone: PineconeClient | null = null;

export const getPineconeClient = async () => {
	if (!pinecone) {
		pinecone = new PineconeClient();
		await pinecone.init({
			environment: process.env.PINECONE_ENVIRONMENT!,
			apiKey: process.env.PINECONE_API_KEY!,
		});
	}
	return pinecone;
};

type PDFPage = {
	pageContent: string;
	pageNumber: number;
	metadata: {
		loc: { pageNumber: number };
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
	const pages = (await loader.load()) as PDFPage[];

	//2. split and segment the pdf into chunks using langchain(pdfLoader)
	//pages = Array(13)
  const document = await Promise.all(
		pages.map((page) => prepareDocument(page))
	);
  //document = Array(1000) after splitting

  //*3. vectories amd embed individual documents

}


// async function embedDocuments(documents: Document[]) {

// }




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
