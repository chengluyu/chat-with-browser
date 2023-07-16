"use client";

import React, { useCallback, useEffect, useState } from "react";
import ConversionResult, { ConversionEntry } from "./ConversionEntry";
import { useLocalStorage } from "usehooks-ts";
import PageHeader from "@/components/PageHeader";

function readFile(file: File): Promise<ConversionEntry> {
  return new Promise<ConversionEntry>((resolve, reject) => {
    const reader = new FileReader();
    let hasRead = false;
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        resolve({
          fileName: file.name,
          source: content,
          content: null,
          status: "pending",
        });
      } else {
        reject(new Error(`Cannot read content of file ${file.name}`));
      }
    };
    reader.readAsText(file);
    setTimeout(() => {
      if (hasRead) {
        return;
      } else {
        reject(new Error(`Failed to read file ${file.name}: timed out`));
      }
    }, 1000);
  });
}

function readFiles(files: File[]): Promise<ConversionEntry[]> {
  return Promise.all(files.map(readFile));
}

export default function Page() {
  const [entries, setEntries] = useLocalStorage<ConversionEntry[]>(
    "entries",
    []
  );
  const [archive, setArchive] = useLocalStorage<ConversionEntry[]>(
    "archive",
    []
  );
  const [pendingEntries, setPendingEntries] = useLocalStorage<
    ConversionEntry[]
  >("pending", []);
  const [ongoingTask, setOngoingTask] = useState<ConversionEntry | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>("");
  const [isReadingFiles, setIsReadingFiles] = useState<boolean>(false);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsReadingFiles(true);
    const entries = await readFiles(Array.from(event.target.files ?? []));
    setPendingEntries(entries);
    setIsReadingFiles(false);
  };

  const run = useCallback(
    async (head: ConversionEntry, tail: ConversionEntry[]) => {
      setOngoingTask({ ...head, content: "", status: "converting" });
      try {
        const response = await fetch("/bibtex/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: head.source }],
          }),
        });

        if (!response.ok) {
          setOngoingTask(null);
          throw new Error(response.statusText);
        }

        // This data is a ReadableStream
        const data = response.body;
        if (!data) {
          throw new Error("The data is not a ReadableStream");
        }

        const reader = data.getReader();
        const decoder = new TextDecoder();

        let lastMessage = "";
        for (let done = false; !done; ) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          lastMessage = lastMessage + decoder.decode(value);
          setOngoingTask({
            ...head,
            content: lastMessage,
            status: "converting",
          });
        }

        setPendingEntries(tail);
        setEntries((entries) => [
          { ...head, content: lastMessage, status: "done" },
          ...entries,
        ]);
      } catch (error) {
      } finally {
        setOngoingTask(null);
      }
    },
    []
  );

  useEffect(() => {
    if (ongoingTask !== null) {
      return;
    }
    if (pendingEntries.length === 0) {
      return;
    }
    const [head, ...tail] = pendingEntries;
    run(head, tail);
  }, [pendingEntries]);

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

  return (
    <>
      <PageHeader />
      <div className="flex-shrink-0 px-2 h-12 flex flex-row items-center gap-2 border-b-2 border-stone-400">
        <div className="font-medium">Upload an RIS file:</div>
        <input
          className="border border-stone-400"
          type="file"
          onChange={onFileChange}
          disabled={isReadingFiles}
          multiple
        />
        {copySuccess && <div className="mb-2">{copySuccess}</div>}
      </div>
      <main className="flex-1 min-h-0 flex flex-row">
        <section className="flex-1 min-w-0 flex flex-col gap-2 px-3.5 pt-1 pb-2 border-r-2 border-stone-400">
          <header className="h-10 flex-shrink-0 flex items-center justify-between border-b border-dashed border-stone-600">
            <h2 className="text-lg font-bold">Results ({entries.length})</h2>
            <div className="flex items-center gap-2">
              <button
                className="flex-shrink-0 px-2 h-8 bg-stone-600 text-white disabled:bg-stone-600s"
                type="button"
                onClick={onCopyClick}
              >
                Archive all
              </button>
              <button
                className="flex-shrink-0 px-2 h-8 bg-blue-600 text-white disabled:bg-stone-600s"
                type="button"
                onClick={onCopyClick}
              >
                Copy all
              </button>
            </div>
          </header>
          <main className="flex-1 min-h-0 overflow-y-auto">
            <div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
              {ongoingTask === null ? null : (
                <ConversionResult entry={ongoingTask} size="lg" />
              )}
              {pendingEntries.map((o) =>
                o.fileName === ongoingTask?.fileName ? null : (
                  <ConversionResult
                    key={o.fileName}
                    entry={o}
                    size="sm"
                    actions={["delete"]}
                    onAction={(action, entry) => {
                      if (action === "delete") {
                        setEntries(
                          pendingEntries.filter(
                            (e) => e.fileName !== entry.fileName
                          )
                        );
                      }
                    }}
                  />
                )
              )}
              {entries.map((o) => (
                <ConversionResult
                  key={o.fileName}
                  entry={o}
                  actions={["archive", "delete"]}
                  onAction={(action, entry) => {
                    if (action === "archive") {
                      setEntries(
                        entries.filter((e) => e.fileName !== entry.fileName)
                      );
                      setArchive([...archive, entry]);
                    } else if (action === "delete") {
                      setEntries(
                        entries.filter((e) => e.fileName !== entry.fileName)
                      );
                    }
                  }}
                  size="md"
                />
              ))}
            </div>
          </main>
        </section>
        <section className="flex-1 min-w-0 flex flex-col gap-2 px-3.5 pt-1 pb-2">
          <header className="h-10 flex-shrink-0 flex items-center justify-between border-b border-dashed border-stone-600">
            <h2 className="text-lg font-bold">Archive ({archive.length})</h2>
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
