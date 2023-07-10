import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { read, loadMore } from "../../readers/index.mjs";
import puppeteer from "puppeteer";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const runtime = 'nodejs';

const bodySchema = z.object({
  url: z.string().url(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { url } = bodySchema.parse(await request.json());
  const browser = await puppeteer.launch({ headless: "new" });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    const context = {};
    const results = [];
    results.push(await read(page, context));
    while (await loadMore(page, context)) {
      results.push(await read(page, context));
    }
    await page.close();
    const responseBody = JSON.stringify({ results });
    return new NextResponse(responseBody);
  } catch (error) {
    const responseBody = JSON.stringify({
      message: error instanceof Error ? error.message : String(error),
    });
    return new NextResponse(responseBody, { status: 500 });
  } finally {
    await browser.close();
  }
}
