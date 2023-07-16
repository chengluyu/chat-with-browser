"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import PageHeader from "@/components/PageHeader";

export default function Page() {
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
              >
                Check
              </button>
            </div>
          </header>
          <main className="flex-1 min-h-0 overflow-y-auto">
            <p>Hello</p>
          </main>
        </section>
        <section className="flex-1 min-w-0 flex flex-col gap-2 px-3.5 pt-1 pb-2">
          <header className="h-10 flex-shrink-0 flex items-center justify-between border-b border-dashed border-stone-600">
            <h2 className="text-lg font-bold">Suggestions</h2>
          </header>
          <main className="flex-1 min-h-0 overflow-y-auto">
            <p>Hello</p>
          </main>
        </section>
      </main>
    </>
  );
}
