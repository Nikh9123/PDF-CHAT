import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge"; // edge will provide a faster response time using vercel's edge network

const config = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function POST(req: Request) {
	try {
		const { messages } = await req.json();

		const response = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages,
			stream: true, // stream will return a response as soon as it's available
		});

		// OpenAIStream is a utility function will return us a response as soon as it's available
		const stream = OpenAIStream(response);
		return new StreamingTextResponse(stream);
	} catch (error) {}
}
