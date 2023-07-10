"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import classNames from "classnames";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { Noto_Sans_Mono } from "next/font/google";
import Link from "next/link";

const bodySchema = z.object({
  metadata: z.object({
    identifiers: z.string(),
    title: z.string(),
    authors: z.string(),
    source: z.string().optional(),
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
      <header className="flex-shrink-0 px-2 h-10 flex flex-row items-center border-b gap-8 border-stone-400">
        <div className="font-bold text-xl">Chat with Browser</div>
        <nav className="flex flex-row items-center gap-4">
          <Link className="font-bold text-lg text-stone-600" href="/chat">Chat</Link>
          <div className="font-bold text-lg text-red-600">Reader Test</div>
        </nav>
      </header>
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
            alert(e instanceof Error ? e.message : String(e));
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
          className="flex-shrink-0 px-2 h-8 bg-blue-600 text-white disabled:bg-stone-600s"
          type="submit"
          disabled={isPending}
        >
          Read the URL
        </button>
        <button
          className="flex-shrink-0 px-2 h-8 bg-stone-600 text-white disabled:bg-stone-600s"
          type="button"
          disabled={isPending}
        >
          Download as Markdown
        </button>
      </form>
      <div className="flex flex-1 min-h-0 flex-row">
        <aside
          className="flex flex-col px-3.5 py-2 flex-shrink-0 border-r-2 border-stone-400 gap-2"
          style={{ width: "480px" }}
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
              value={content?.metadata.authors}
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
          <header className="flex-shrink-0 border-b border-dashed border-stone-600">
            <div className="font-bold text-lg">Content</div>
          </header>
          <main
            ref={contentMainRef}
            className={classNames(
              "flex-1 min-h-0 overflow-y-auto",
              notoSansMono.className
            )}
          >
            {/* {content ? (
              <pre className="font-mono whitespace-pre-wrap">
                {content?.sections?.join("\n\n")}
              </pre>
            ) : (
              <div className="text-stone-500">None</div>
            )} */}
          </main>
        </main>
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
