import PageHeader from "@/components/PageHeader";
import { ChatGPTMessage } from "@/utils/ChatMessage";
import classNames from "classnames";
import { PlusIcon } from "@heroicons/react/20/solid";
import CurrentChat from "./CurrentChat";

export default function Page() {
  return (
    <>
      <PageHeader />
      <div className="flex flex-1 min-h-0 flex-row">
        <aside
          className="flex flex-col px-3.5 py-2 flex-shrink-0 border-r-2 border-stone-400 gap-2"
          style={{ width: "320px" }}
        >
          <header className="flex-shrink-0 pt-0 pb-2 flex flex-row items-center border-b border-dashed border-stone-600">
            <div className="font-bold text-lg">Conversations</div>
            <button
              className="ml-auto flex-shrink-0 flex items-center px-1 py-0.5 border-2 border-green-600 text-stone-800 disabled:bg-stone-600s"
              type="submit"
            >
              <span className="font-medium">New</span>
              <PlusIcon className="ml-1 w-5 h-5" />
            </button>
          </header>
          <main className="flex-1 gap-2 min-h-0 overflow-y-auto flex flex-col">
            <div className="flex flex-col gap-2">
              <ConversationEntryGroup title="Today" />
              <ConversationEntryGroup title="Yesterday" />
              <ConversationEntryGroup title="Monday, 12 July" />
            </div>
          </main>
        </aside>
        <main className="px-3.5 py-2 flex-1 min-w-0 flex flex-col gap-2">
          <CurrentChat />
        </main>
      </div>
    </>
  );
}

function ConversationEntry() {
  return <article className="p-2 bg-stone-100">Conversation 1</article>;
}

type ConversationEntryGroupProps = { title: string };

function ConversationEntryGroup({ title }: ConversationEntryGroupProps) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-bold text-stone-700">{title}</h3>
      <ConversationEntry />
      <ConversationEntry />
      <ConversationEntry />
      <ConversationEntry />
    </section>
  );
}
