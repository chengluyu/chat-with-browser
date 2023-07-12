import PageHeader from "@/components/PageHeader";
import { promises as fs } from "fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

export default async function HomePage() {
  const readMeHtml = await parseReadMe();
  return (
    <>
      <PageHeader />
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div
          className="p-4 prose"
          dangerouslySetInnerHTML={{ __html: readMeHtml }}
        ></div>
      </main>
    </>
  );
}

async function parseReadMe(): Promise<string> {
  const readme = await fs.readFile("README.md", "utf-8");
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify);
  const result = await processor.process(readme);
  return result.toString();
}
