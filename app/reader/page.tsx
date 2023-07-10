"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const bodySchema = z.object({
  results: z.array(z.unknown()),
});

export default function HomePage() {
  const { handleSubmit, register } = useForm<{ url: string }>();
  const [content, setContent] = useState<string>("");
  return (
    <>
      <form
        className="flex-shrink-0 px-2 h-12 flex flex-row items-center gap-2 border-b border-stone-400"
        onSubmit={handleSubmit(async (data) => {
          const response = await fetch("/readers", {
            method: "POST",
            body: JSON.stringify(data),
          });
          const text = await response.json();
          const body = bodySchema.parse(text);
          setContent(JSON.stringify(body, null, 2));
        })}
      >
        <div className="font-bold text-lg">URL</div>
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
          className="flex-shrink-0 px-2 py-1 bg-blue-600 text-white rounded"
          type="submit"
        >
          Go
        </button>
      </form>
      <div className="flex flex-1 min-h-0 flex-row">
        <aside
          className="p-4 flex-shrink-0 border-r border-stone-400"
          style={{ width: "320px" }}
        >
          <header className="h-12">
            <div className="font-bold text-lg">Metadata</div>
          </header>
          <main></main>
        </aside>
        <main className="p-4 flex-1 min-h-0 flex flex-col">
          <header className="h-12 flex-shrink-0">
            <div className="font-bold text-lg">Content</div>
          </header>
          <main className="flex-1 min-h-0 overflow-y-auto">
            <pre className="font-mono whitespace-pre-wrap">{content}</pre>
          </main>
        </main>
      </div>
    </>
  );
}
