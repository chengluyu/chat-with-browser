import classNames from "classnames";
import { Noto_Sans_Mono as NotoSansMono } from "next/font/google";

const notoSansMono = NotoSansMono({ subsets: ["latin"] });

export type ConversionEntryAction = "archive" | "delete";

export type ConversionEntry =
  | {
      fileName: string;
      content: null;
      source: string;
      status: "pending";
    }
  | {
      fileName: string;
      content: string;
      source: string;
      status: "converting" | "done";
    };

export type ConversionResultProps = {
  entry: ConversionEntry;
  size?: "sm" | "md" | "lg";
  actions?: ConversionEntryAction[];
  onAction?: (action: ConversionEntryAction, entry: ConversionEntry) => void;
};

export default function ConversionResult({
  entry,
  size = "md",
  actions = [],
  onAction,
}: ConversionResultProps) {
  return (
    <div
      key={entry.fileName}
      className={classNames(
        "flex flex-col border",
        {
          "bg-amber-100 border-amber-600": entry.status === "converting",
          "bg-neutral-100 border-sky-600": entry.status === "pending",
          "bg-stone-100 border-stone-600": entry.status === "done",
        },
        { "h-64": size === "md", "h-48": size === "sm", "h-96": size === "lg" }
      )}
    >
      <header
        className={classNames(
          "px-2 py-0.5 flex-shrink-0 flex items-center justify-between",
          {
            "bg-amber-600 text-amber-50": entry.status === "converting",
            "bg-sky-600 text-sky-50": entry.status === "pending",
            "bg-stone-600 text-stone-50": entry.status === "done",
          }
        )}
      >
        <div className="font-bold">
          {entry.fileName}{" "}
          {entry.status === "done" ? null : `(${entry.status})`}
        </div>
      </header>
      <main className="px-3.5 py-2 flex-1 overflow-y-auto">
        <pre
          className={classNames(
            "text-sm whitespace-pre-wrap",
            notoSansMono.className,
            { "select-none": entry.status === "pending" }
          )}
        >
          {entry.status === "pending" ? entry.source : entry.content}
        </pre>
      </main>
      {actions.length === 0 ? null : (
        <footer
          className={classNames(
            "px-1 py-1 flex-shrink-0 flex items-center gap-1 border-t",
            {
              "bg-amber-200 border-amber-600": entry.status === "converting",
              "bg-sky-100 border-sky-600": entry.status === "pending",
              "bg-stone-200 border-stone-600": entry.status === "done",
            }
          )}
        >
          {actions.map((action) => (
            <ConversionEntryActionButton
              key={action}
              entry={entry}
              action={action}
              onAction={onAction}
            />
          ))}
        </footer>
      )}
    </div>
  );
}

export type ConversionEntryActionButtonProps = {
  entry: ConversionEntry;
  action: ConversionEntryAction;
  onAction?: (action: ConversionEntryAction, entry: ConversionEntry) => void;
};

function ConversionEntryActionButton({
  entry,
  action,
  onAction,
}: ConversionEntryActionButtonProps) {
  switch (entry.status) {
    case "pending": {
      switch (action) {
        case "delete":
          return (
            <button
              key={action}
              className="flex-shrink-0 px-2 py-0.5 bg-rose-600 text-white disabled:bg-red-600s"
              type="button"
              onClick={onAction?.bind(null, "delete", entry)}
            >
              Cancel
            </button>
          );
        default:
          return null;
      }
    }
    case "converting": {
      return null;
    }
    case "done": {
      switch (action) {
        case "archive":
          return (
            <button
              key={action}
              className="flex-shrink-0 px-2 py-0.5 bg-stone-600 text-white disabled:bg-stone-600s"
              type="button"
              onClick={onAction?.bind(null, "archive", entry)}
            >
              Archive
            </button>
          );
        case "delete":
          return (
            <button
              key={action}
              className="flex-shrink-0 px-2 py-0.5 bg-rose-600 text-white disabled:bg-red-600s"
              type="button"
              onClick={onAction?.bind(null, "delete", entry)}
            >
              Delete
            </button>
          );
        default:
          return null;
      }
    }
    default:
      return null;
  }
}
