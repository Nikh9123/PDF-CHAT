// /api/create-chat

import { loadS3intoPinecone } from "@/lib/pinecone";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
	try {
		const body = await req.json();

		const { file_key, file_name } = body;
		console.log("file_name and file_key of uloaded file ", file_key, file_name);
		
    //loadS3intoPinecone(file_key) will take the file_key and load the file into pinecone
    const pages = await loadS3intoPinecone(file_key);
    console.log("pages 🔫", pages);
    return NextResponse.json(
      { pages },
		);
	} catch (error) {
		console.log("❌ Error in /api/create-chat ", error);
		return NextResponse.json(
			{ error: "internal server error" },
			{ status: 500 }
		);
	}
}
