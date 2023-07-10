"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import classNames from "classnames";
import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import "./page.css";

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
      <form
        className="flex-shrink-0 px-2 h-12 flex flex-row items-center gap-2 border-b border-stone-400"
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
        <div className="font-bold text-lg">Reader Test</div>
        <div>URL:</div>
        <input
          className="flex-1 h-8 border border-stone-400 bg-transparent rounded"
          type="url"
          {...register("url")}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <button
          className="flex-shrink-0 px-2 py-1 bg-blue-600 text-white rounded disabled:bg-stone-600s"
          type="submit"
          disabled={isPending}
        >
          Go
        </button>
      </form>
      <div className="flex flex-1 min-h-0 flex-row">
        <aside
          className="flex flex-col p-4 flex-shrink-0 border-r border-stone-400 gap-2"
          style={{ width: "320px" }}
        >
          <header className="flex-shrink-0">
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
        <main className="p-4 flex-1 min-w-0 flex flex-col gap-2">
          <header className="flex-shrink-0">
            <div className="font-bold text-lg">Content</div>
          </header>
          <main ref={contentMainRef} className="flex-1 min-h-0 overflow-y-auto">
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