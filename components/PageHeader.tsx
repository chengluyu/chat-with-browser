import {
  ActivityLogIcon,
  ChatBubbleIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";

export default function PageHeader() {
  return (
    <header className="flex-shrink-0 px-2 h-10 flex flex-row items-center border-b gap-8 border-stone-400">
      <Link className="font-bold text-xl" href="/">
        Chat with Browser
      </Link>
      <nav className="flex flex-row items-center gap-4">
        <Link
          className="flex items-center text-stone-600 border-b-2 border-transparent hover:border-current"
          href="/chat"
        >
          <ChatBubbleIcon className="mr-1" />
          Chat
        </Link>
        <Link
          className="flex items-center text-red-600 border-b-2 border-transparent hover:border-current"
          href="/reader"
        >
          <ReaderIcon className="mr-1" />
          Reader Test
        </Link>
        <Link
          className="flex items-center text-red-600 border-b-2 border-transparent hover:border-current"
          href="/bibtex"
        >
          <ActivityLogIcon className="mr-1" />
          BibTeX Converter
        </Link>
      </nav>
    </header>
  );
}
