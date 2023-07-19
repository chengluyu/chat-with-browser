"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z, ZodError } from "zod";
import classNames from "classnames";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { Noto_Sans_Mono } from "next/font/google";
import PageHeader from "@/components/PageHeader";
import { generateErrorMessage } from "zod-error";
import {
  ClipboardCopyIcon,
  MagnifyingGlassIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";

const bodySchema = z.object({
  metadata: z.object({
    identifiers: z.string().nullable().optional(),
    title: z.string(),
    authors: z.union([z.string(), z.array(z.string())]),
    source: z.string().nullable().optional(),
    abstract: z.string(),
  }),
  sections: z.array(z.string()),
});

const notoSansMono = Noto_Sans_Mono({ subsets: ["latin"] });

type Extraction = z.output<typeof bodySchema>;

export default function HomePage() {
  const { handleSubmit, register } = useForm<{ url: string }>();
  const [content, setContent] = useState<Extraction | null>(null);
  const [isPending, setIsPending] = useState(false);
  const editorRef = useRef<EditorView | null>(null);
  const contentMainRef = useRef<HTMLDivElement | null>(null);
  const [summaryContent, setSummaryContent] = useState<string>("");
  const copyWithMetadata = useCallback(async () => {
    navigator.clipboard.writeText(
      `# ${content?.metadata.title}\n\n` +
        `## Abstract\n\n` +
        `${content?.metadata.abstract}\n\n` +
        `${content?.sections.join("\n\n")}\n\n`
    );
  }, [content]);
  const summarize = useCallback(async () => {
    const response = await fetch("/reader/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        markdownContent:
          `# ${content?.metadata.title}\n\n` +
          `## Abstract\n\n` +
          `${content?.metadata.abstract}\n\n` +
          `${content?.sections.join("\n\n")}\n\n`,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();

    let messageBuffer = "";
    for (let done = false; !done; ) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      messageBuffer = messageBuffer + decoder.decode(value);
      setSummaryContent(messageBuffer);
    }
  }, [content]);
  useEffect(() => {
    if (editorRef.current === null && contentMainRef.current !== null) {
      editorRef.current = new EditorView({
        extensions: [basicSetup, markdown(), EditorView.lineWrapping],
        parent: contentMainRef.current,
      });
    }
  }, []);
  return (
    <>
      <PageHeader />
      <form
        className="flex-shrink-0 px-2 h-12 flex flex-row items-center gap-2 border-b-2 border-stone-400"
        onSubmit={handleSubmit(async (data) => {
          setIsPending(true);
          try {
            const response = await fetch("/readers", {
              method: "POST",
              body: JSON.stringify(data),
            });
            const text = await response.json();
            const parsed = bodySchema.parse(text);
            setContent(parsed);
            editorRef.current?.setState(
              EditorState.create({
                doc: parsed.sections.join("\n\n"),
                extensions: [basicSetup, markdown(), EditorView.lineWrapping],
              })
            );
          } catch (e) {
            if (e instanceof ZodError) {
              alert(generateErrorMessage(e.issues));
            } else {
              alert(e instanceof Error ? e.message : String(e));
            }
          } finally {
            setIsPending(false);
          }
        })}
      >
        <div className="font-medium">Enter a URL:</div>
        <input
          className="flex-1 px-2 h-8 border border-stone-400 bg-transparent"
          type="url"
          {...register("url")}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <button
          className="flex-shrink-0 flex flex-row items-center gap-1 px-2 h-8 bg-blue-600 text-white disabled:bg-stone-600"
          type="submit"
          disabled={isPending}
        >
          <MagnifyingGlassIcon />
          <span>Read the URL</span>
        </button>
      </form>
      <div className="flex flex-1 min-h-0 flex-row">
        <aside
          className="flex flex-col px-3.5 py-2 flex-shrink-0 border-r-2 border-stone-400 gap-2"
          style={{ width: "320px" }}
        >
          <header className="flex-shrink-0 border-b border-dashed border-stone-600">
            <div className="font-bold text-lg">Metadata</div>
          </header>
          <main className="flex-1 gap-2 min-h-0 overflow-y-auto flex flex-col">
            <MetadataField
              label="Identifiers"
              value={content?.metadata.identifiers}
              multiline
            />
            <MetadataField
              label="Title"
              value={content?.metadata.title}
              multiline
            />
            <MetadataField
              label="Authors"
              value={
                Array.isArray(content?.metadata.authors)
                  ? content?.metadata.authors.join(", ")
                  : content?.metadata.authors
              }
              multiline
            />
            <MetadataField
              label="Source"
              value={content?.metadata.source}
              multiline
            />
            <MetadataField
              label="Abstract"
              value={content?.metadata.abstract}
              multiline
            />
          </main>
        </aside>
        <main className="px-3.5 py-2 flex-1 min-w-0 flex flex-col gap-2">
          <header className="flex-shrink-0 pb-1 flex flex-row items-center border-b border-dashed border-stone-600">
            <div className="font-bold text-lg">Content</div>
            <div className="ml-auto flex flex-row items-center gap-2">
              <button
                className="flex-shrink-0 flex flex-row items-center gap-1 px-1 py-0.5 bg-green-600 text-white disabled:bg-green-800"
                type="button"
                disabled={isPending}
                onClick={summarize}
              >
                <PaperPlaneIcon />
                <span>Summarize</span>
              </button>
              <button
                className="flex-shrink-0 flex flex-row items-center gap-1 px-1 py-0.5 bg-stone-600 text-white disabled:bg-stone-600"
                type="button"
                disabled={isPending}
                onClick={copyWithMetadata}
              >
                <ClipboardCopyIcon />
                <span>Copy with metadata</span>
              </button>
            </div>
          </header>
          <main
            ref={contentMainRef}
            className={classNames(
              "flex-1 min-h-0 overflow-y-auto",
              notoSansMono.className
            )}
          />
        </main>
        <aside
          className="flex flex-col px-3.5 py-2 flex-shrink-0 border-l-2 border-stone-400 gap-2"
          style={{ width: "320px" }}
        >
          <header className="flex-shrink-0 border-b border-dashed border-stone-600">
            <div className="font-bold text-lg">Summary</div>
          </header>
          <main className="flex-1 gap-2 min-h-0 overflow-y-auto flex flex-col">
            <div>{summaryContent}</div>
          </main>
        </aside>
      </div>
    </>
  );
}

function MetadataField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string | null;
  multiline?: boolean;
}) {
  return (
    <div
      className={classNames("flex", multiline ? "flex-col" : "gap-1 flex-row")}
    >
      <div className="font-bold">{label}</div>
      <div className="flex-1">
        {!value ? (
          <span className="text-stone-600">None</span>
        ) : (
          <span>{value}</span>
        )}
      </div>
    </div>
  );
}
