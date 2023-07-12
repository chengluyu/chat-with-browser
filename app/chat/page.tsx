import PageHeader from "@/components/PageHeader";
import { ChatGPTMessage } from "@/utils/ChatGPTMessage";
import classNames from "classnames";

export default function Page() {
  return (
    <>
      <PageHeader />
      <div className="flex flex-1 min-h-0 flex-row">
        <aside
          className="flex flex-col px-3.5 py-2 flex-shrink-0 border-r-2 border-stone-400 gap-2"
          style={{ width: "320px" }}
        >
          <header className="flex-shrink-0 border-b border-dashed border-stone-600">
            <div className="font-bold text-lg">Conversations</div>
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
          <header className="flex-shrink-0 border-b border-dashed border-stone-600">
            <div className="font-bold text-lg">Chat</div>
          </header>
          <main className={classNames("flex-1 min-h-0 overflow-y-auto")}>
            <div className="flex flex-col gap-4 first:mt-2">
              <ChatPromptMessage content="This is the beginning of the conversation." />
              <ChatMessageBubble
                message={{
                  role: "assistant",
                  content: "Hi! How can I help you today?",
                  model: "fabricated",
                }}
              />
              <ChatMessageBubble
                message={{
                  role: "user",
                  content: "Hi! How can I help you today?",
                }}
              />
            </div>
          </main>
          <footer className="flex-shrink-0 border-t border-dashed pt-4 border-stone-600">
            <form action="none">
              <textarea className="w-full" name="" id="" cols={30} rows={5} />
            </form>
          </footer>
        </main>
      </div>
    </>
  );
}

type ChatMessageBubbleProps = { message: ChatGPTMessage };

function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  return (
    <div
      className={classNames(
        "px-4 py-3.5 w-3/4 bg-stone-100 flex flex-col gap-1",
        {
          "self-start": message.role === "assistant",
          "self-end": message.role === "user",
          "self-center": message.role === "system",
        }
      )}
    >
      <div className="text-sm font-bold text-stone-700">
        {message.role === "assistant" && "Assistant"}
        {message.role === "user" && "You"}
        {message.role === "system" && "System"}
      </div>
      <div>Hi! How can I help you today?</div>
    </div>
  );
}

type ChatPromptMessageProps = { content: string };

function ChatPromptMessage({ content }: ChatPromptMessageProps) {
  return (
    <div className="w-3/4 self-center text-center text-sm font-medium text-stone-600">
      {content}
    </div>
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
