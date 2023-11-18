import { Pinecone, PineconeClient } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

//create pinconde client instance because we need to use it in multiple places
let pinecone: PineconeClient | null = null;

export const getPineconeClient = async () => {
	if (!pinecone) {
    pinecone = new PineconeClient() ;
    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    }) 
  }
  return pinecone;
};

type PDFPage = {
  pageContent : string;
  pageNumber : number;
  metadata : {
    loc:{pageNumber:number}
  }
}

export async function loadS3intoPinecone(fileKey: string) {
	//1. obtain the pdf -> download and read from pdf
	console.log("downloading file into our file system");
	const file_name = await downloadFromS3(fileKey);

  console.log("file_name", file_name);
	//2. split and segment the pdf into chunks using langchain(pdfLoader)
	if (!file_name) {
		throw new Error("Could not download file from s3");
	}

	const loader = new PDFLoader(file_name);
	const pages = (await loader.load()) as PDFPage[];
	return pages;
}
