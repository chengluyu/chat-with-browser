"use client";

import PageHeader from "@/components/PageHeader";
import { EditorView, basicSetup } from "codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import markdown from "./markdown";
import { useLocalStorage } from "usehooks-ts";

export type ProofreadRecord = {
  sourceText: string;
  suggestionHTML: string;
  time: string;
};

export default function Page() {
  const editorRef = useRef<EditorView | null>(null);
  const contentMainRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [records, setRecords] = useLocalStorage<ProofreadRecord[]>(
    "proofread",
    []
  );
  useEffect(() => {
    if (editorRef.current === null && contentMainRef.current !== null) {
      editorRef.current = new EditorView({
        extensions: [basicSetup, EditorView.lineWrapping],
        parent: contentMainRef.current,
      });
    }
  }, []);
  const proofread = useCallback(async () => {
    if (editorRef.current === null) {
      return;
    }
    const sourceText = editorRef.current.state.doc.toString();
    const response = await fetch("/grammar/proofread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        markdownContent: sourceText,
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
      setCurrent(messageBuffer);
    }

    const suggestionHTML = await markdown(messageBuffer);

    setRecords((records) => [
      {
        sourceText,
        suggestionHTML,
        time: new Date().toISOString(),
      },
      ...records,
    ]);
    setCurrent(null);
  }, []);
  return (
    <>
      <PageHeader />
      <main className="flex-1 min-h-0 flex flex-row">
        <section className="flex-1 min-w-0 flex flex-col gap-2 px-3.5 pt-1 pb-2 border-r-2 border-stone-400">
          <header className="h-10 flex-shrink-0 flex items-center justify-between border-b border-dashed border-stone-600">
            <h2 className="text-lg font-bold">Document</h2>
            <div className="flex items-center gap-2">
              <button
                className="flex-shrink-0 px-2 h-8 bg-blue-600 text-white disabled:bg-stone-600s"
                type="button"
                onClick={proofread}
              >
                Check
              </button>
            </div>
          </header>
          <main className="flex-1 min-h-0 w-full" ref={contentMainRef}></main>
        </section>
        <section className="flex-1 min-w-0 flex flex-col gap-2 px-3.5 pt-1 pb-2">
          <header className="h-10 flex-shrink-0 flex items-center justify-between border-b border-dashed border-stone-600">
            <h2 className="text-lg font-bold">Suggestions</h2>
          </header>
          <main className="flex-1 min-h-0 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {current === null ? null : (
                <article className="flex flex-col gap-1 px-2 py-1 bg-amber-100">
                  <header className="pb-1 font-bold border-b border-amber-600 border-dashed">
                    Processing...
                  </header>
                  <main>{current}</main>
                </article>
              )}
              {records.map((record) => (
                <article
                  key={record.time}
                  className="flex flex-col gap-1 px-2 py-1 bg-lime-100"
                >
                  <header className="pb-1 font-bold border-b border-lime-600 border-dashed">
                    Record ({record.time.toLocaleString()})
                  </header>
                  <main
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: record.suggestionHTML }}
                  ></main>
                </article>
              ))}
            </div>
          </main>
        </section>
      </main>
    </>
  );
}
