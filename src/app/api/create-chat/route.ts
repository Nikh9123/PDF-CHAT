// /api/create-chat

import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
	try {
		const body = await req.json();

		const { file_key, file_name } = body;
		console.log("file_name and file_key of uloaded file ", file_key, file_name);
		return NextResponse.json(
			{ message: "file uploaded successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.log("❌ Error in /api/create-chat ", error);
		return NextResponse.json(
			{ error: "internal server error" },
			{ status: 500 }
		);
	}
}
