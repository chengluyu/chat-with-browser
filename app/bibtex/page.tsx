"use client";

import React, { useState } from "react";
import { ChatGPTMessage } from "@/utils/ChatGPTMessage";
import ConversionResult, { ConversionEntry } from "./ConversionEntry";
import { useLocalStorage } from "usehooks-ts";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const [entries, setEntries] = useLocalStorage<ConversionEntry[]>(
    "entries",
    []
  );
  const [archive, setArchive] = useLocalStorage<ConversionEntry[]>(
    "archive",
    []
  );
  const [copySuccess, setCopySuccess] = useState<string>("");
  const [pendingTask, setPendingTask] = useState<ConversionEntry | null>(null);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const result = await sendMessage(file.name, { role: "user", content });
      if (result) {
        setEntries((output) => [
          ...output,
          { fileName: file.name, content: result, pending: false },
        ]);
      }
    };
    reader.readAsText(file);
  };

  const onCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(
        entries.map((x) => x.content).join("\n\n")
      );
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      setCopySuccess("Failed to copy text.");
    }
  };

  const sendMessage = async (fileName: string, message: ChatGPTMessage) => {
    console.log("Sending message to edge function.");

    setPendingTask({ fileName, content: "", pending: true });

    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [message],
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return null;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    let lastMessage = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      lastMessage = lastMessage + chunkValue;

      setPendingTask({ fileName, content: lastMessage, pending: true });
    }

    setPendingTask(null);
    return lastMessage;
  };

  return (
    <>
      <PageHeader />
      <div className="flex-shrink-0 px-2 h-12 flex flex-row items-center gap-2 border-b-2 border-stone-400">
        <div className="font-medium">Upload an RIS file:</div>
        <input
          className="border border-stone-400"
          type="file"
          onChange={onFileChange}
          disabled={pendingTask !== null}
        />
        {copySuccess && <div className="mb-2">{copySuccess}</div>}
      </div>
      <main className="flex-1 min-h-0 flex flex-row">
        <section className="flex-1 min-w-0 flex flex-col gap-2 px-3.5 pt-1 pb-2 border-r-2 border-stone-400">
          <header className="h-10 flex-shrink-0 flex items-center justify-between border-b border-dashed border-stone-600">
            <h2 className="text-lg font-bold">Results ({entries.length})</h2>
            <button
              className="flex-shrink-0 px-2 h-8 bg-blue-600 text-white disabled:bg-stone-600s"
              type="button"
              onClick={onCopyClick}
            >
              Copy ALL in the workbench
            </button>
          </header>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
            {pendingTask === null ? null : (
              <ConversionResult entry={pendingTask} size="lg" />
            )}
            {entries.map((o) => (
              <ConversionResult
                key={o.fileName}
                entry={o}
                showArchiveButton
                onArchive={(x) => {
                  setEntries(entries.filter((e) => e.fileName !== x.fileName));
                  setArchive([...archive, x]);
                }}
                size="md"
              />
            ))}
          </div>
        </section>
        <section className="flex-1 min-w-0 flex flex-col gap-2 px-3.5 pt-1 pb-2">
          <header className="h-10 flex-shrink-0 flex items-center justify-between border-b border-dashed border-stone-600">
            <h2 className="text-lg font-bold">
              Archive ({archive.length})
            </h2>
            {/* <button
              className="flex-shrink-0 px-2 h-8 bg-blue-600 text-white disabled:bg-stone-600s"
              type="button"
              onClick={onCopyClick}
            >
              Copy ALL in the workbench
            </button> */}
          </header>
          <main className="flex-1 min-h-0 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              {archive.map((o) => (
                <ConversionResult key={o.fileName} entry={o} size="sm" />
              ))}
            </div>
          </main>
        </section>
      </main>
    </>
  );
}
