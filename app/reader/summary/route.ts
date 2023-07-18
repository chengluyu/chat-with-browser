import { OpenAIStream } from "@/utils/OpenAIStream";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { ChatCompletionRequestMessage } from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const runtime = "nodejs";

const systemMessage: ChatCompletionRequestMessage = {
  role: "system",
  content: ["The user will give you a academic article to summarize."].join(
    "\n"
  ),
};

const requestBodySchema = z.object({
  markdownContent: z.string(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = requestBodySchema.parse(await request.json());
  const stream = await OpenAIStream({
    model: "gpt-3.5-turbo-16k",
    messages: [systemMessage, { role: "user", content: body.markdownContent }],
    stream: true,
  });
  return new NextResponse(stream);
}
