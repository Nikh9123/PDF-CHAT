import { Pinecone, PineconeClient } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";
import { text } from "stream/consumers";

export async function getMatchesFromEmbeddings(
	embeddings: number[],
	fileKey: string
) {
	const client = new Pinecone({
		environment: process.env.PINECONE_ENVIRONMENT!, //pinecone environment
		apiKey: process.env.PINECONE_APIKEY!, //pinecone api key
	});

	const pineconeIndex = await client.Index("chatpdf");
	console.log("index ", pineconeIndex);
	try {
		const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
		const queryResult = await namespace.query({
			topK: 5,
			vector: embeddings,
			includeMetadata: true,
		});
		console.log("queryResult ", queryResult);
		return queryResult.matches || [];
	} catch (error) {
		console.log("error querying embeddings", error);

		throw error;
	}
}

export async function getContext(query: string, fileKey: string) {
	const queryEmbeddings = await getEmbeddings(query);
	const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

	const qualifyDocs = matches.filter(
		(match) => match.score && match.score > 0.7
	);

	type Metadata = {
		text: string;
		pageNumbers: number;
	};

	//it is extracting the text from the metadata of the qualifyDocs
	let docs = qualifyDocs.map((match) => (match.metadata as Metadata).text);

	//5 vectors of the qualifyDocs
	return docs.join("\n").substring(0, 3000);
}
