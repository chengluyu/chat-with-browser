import { type ChatGPTMessage } from "@/utils/ChatGPTMessage";
import { OpenAIStream, OpenAIStreamPayload } from "@/utils/OpenAIStream";
import { NextResponse } from "next/server";

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const runtime = 'edge';

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();

  const messages: ChatGPTMessage[] = [
    {
      role: "system",
      content: [
        "You are a professional academic assistant.",
        "The user will give you a reference in RIS format or nbib format.",
        "You should convert ALL fields in the citation data to a BibTeX entry.",
        "Also name the BibTeX entry with the first author's last name, the year",
        "of the publication, and the first meaningful word of the title.",
        "Make sure the BibTeX entry is lowercase.",
      ].join(" "),
    },
  ];
  messages.push(...body?.messages);

  const payload: OpenAIStreamPayload = {
    model: body.model ?? "gpt-3.5-turbo",
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    temperature: 0.5,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);

  return new NextResponse(stream);
}
