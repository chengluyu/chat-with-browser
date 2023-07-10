import classNames from "classnames";
import { Noto_Sans_Mono as NotoSansMono } from "next/font/google";

const notoSansMono = NotoSansMono({ subsets: ["latin"] });

export type ConversionEntry = {
  fileName: string;
  content: string;
  pending: boolean;
};

export type ConversionResultProps = {
  entry: ConversionEntry;
  showArchiveButton?: boolean;
  onArchive?: (entry: ConversionEntry) => void;
  size?: "sm" | "md" | "lg";
};

export default function ConversionResult({
  entry,
  showArchiveButton = false,
  onArchive,
  size = "md",
}: ConversionResultProps) {
  return (
    <div
      key={entry.fileName}
      className={classNames(
        "flex flex-col border",
        entry.pending
          ? "bg-amber-100 border-amber-600"
          : "bg-stone-100 border-stone-600",
        { "h-64": size === "md", "h-48": size === "sm", "h-96": size === "lg" }
      )}
    >
      <header
        className={classNames(
          "px-2 py-0.5 flex-shrink-0 flex items-center justify-between",
          entry.pending
            ? "bg-amber-600 text-amber-50"
            : "bg-stone-600 text-stone-50"
        )}
      >
        <div className="text-lg font-bold">
          {entry.fileName} {entry.pending ? "(pending)" : null}
        </div>
        {entry.pending || !showArchiveButton ? null : (
          <button
            onClick={onArchive ? onArchive.bind(null, entry) : undefined}
            className="px-1 py-0.5 bg-gray-400 text-white rounded mb-2"
          >
            Archive
          </button>
        )}
      </header>
      <main className="px-3.5 py-2 flex-1 overflow-y-auto">
        <pre
          className={classNames(
            "text-sm whitespace-pre-wrap",
            notoSansMono.className,
            { "select-none": entry.pending }
          )}
        >
          {entry.content}
        </pre>
      </main>
    </div>
  );
}
