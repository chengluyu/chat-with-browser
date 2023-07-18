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
  content: [
    "The user will send you text which will be used for thesis.",
    "The text is in Markdown format.",
    "Please check the grammatical and syntactic errors and list them.",
  ].join(" "),
};

const requestBodySchema = z.object({
  markdownContent: z.string(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = requestBodySchema.parse(await request.json());
  const stream = await OpenAIStream({
    model: "gpt-4",
    messages: [systemMessage, { role: "user", content: body.markdownContent }],
    stream: true,
  });
  return new NextResponse(stream);
}
