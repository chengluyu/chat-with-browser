"use client";

import { ChatGPTMessage } from "@/utils/ChatMessage";
import classNames from "classnames";
import ChatInput from "./ChatInput";
import { useCallback, useEffect, useRef, useState } from "react";

export default function CurrentChat() {
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatGPTMessage[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const sendMessage = useCallback(async ({ content }: { content: string }) => {
    // Add the user's message to the list of messages.
    setMessages((messages) => [...messages, { role: "user", content }]);

    const response = await fetch("/chat/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, { role: "user", content }],
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
      setPendingMessage(messageBuffer);
    }
    // Append the response to the messages.
    setMessages((messages) => [
      ...messages,
      { role: "assistant", content: messageBuffer },
    ]);
    setPendingMessage(null);
  }, []);
  useEffect(() => {
    if (messageContainerRef.current === null || pendingMessage === null) {
      return;
    }
    // Check if the message container is scrolled to the bottom.
    if (
      messageContainerRef.current.scrollHeight -
        messageContainerRef.current.scrollTop -
        messageContainerRef.current.clientHeight >
      1
    ) {
      // Scroll the message container element to the bottom.
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [pendingMessage]);
  return (
    <>
      <header className="flex-shrink-0 border-b border-dashed border-stone-600">
        <div className="font-bold text-lg">Chat</div>
      </header>
      <main
        ref={messageContainerRef}
        className={classNames("flex-1 min-h-0 overflow-y-auto")}
      >
        <div className="flex flex-col gap-4 first:mt-2">
          <ChatPromptMessage content="This is the beginning of the conversation." />
          {messages.map((message, index) => (
            <ChatMessageBubble key={index} message={message} />
          ))}
          {pendingMessage === null ? null : (
            <ChatMessageBubble
              message={{ role: "assistant", content: pendingMessage }}
            />
          )}
          {/* <ChatAssistantAction />
          <ChatAssistantAction />
          <ChatAssistantAction /> */}
        </div>
      </main>
      <footer className="flex-shrink-0 border-t border-dashed pt-4 border-stone-600">
        <ChatInput onSubmit={sendMessage} />
      </footer>
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
      <div>{message.content}</div>
    </div>
  );
}

function ChatAssistantAction({}) {
  return (
    <div
      className={classNames(
        "px-4 py-3.5 w-3/4 bg-stone-100 flex flex-col gap-1",
        "self-start"
      )}
    >
      <div className="text-sm font-bold text-stone-700">
        Assistant searched Google for "<span>Test</span>"
      </div>
      <div>and got following search results</div>
      <div className="flex flex-col gap-1">
        <div>Test</div>
      </div>
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
