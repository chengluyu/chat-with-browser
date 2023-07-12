import { OpenAIStream, OpenAIStreamPayload } from "@/utils/OpenAIStream";
import { NextRequest, NextResponse } from "next/server";
import functions from "./functions";
import z from "zod";
import { ChatCompletionRequestMessage } from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const runtime = "nodejs";

const systemMessage: ChatCompletionRequestMessage = {
  role: "system",
  content: [
    "You are a helpful assistant with the Internet access.",
    "You can search with Google and navigate to any URL.",
    "If you do not know the answer, you can use the search function.",
    "If you want to read a webpage, you can use the navigate function.",
  ].join("\n"),
};

const chatRequestMessage = z.object({
  role: z.enum(["system", "user", "assistant", "function"]),
  content: z.string().optional(),
  name: z.string().optional(),
  function_call: z
    .object({
      name: z.string().optional(),
      arguments: z.string().optional(),
    })
    .optional(),
});

const requestBodySchema = z.object({
  messages: z.array(chatRequestMessage),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = requestBodySchema.parse(await request.json());
  const stream = await OpenAIStream({
    model: "gpt-4-0613",
    messages: [systemMessage, ...body.messages],
    functions,
    stream: true,
  });
  return new NextResponse(stream);
}
