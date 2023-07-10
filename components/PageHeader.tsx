import Link from "next/link";

export default function PageHeader() {
  return (
    <header className="flex-shrink-0 px-2 h-10 flex flex-row items-center border-b gap-8 border-stone-400">
      <Link className="font-bold text-xl" href="/">
        Chat with Browser
      </Link>
      <nav className="flex flex-row items-center gap-4">
        <Link
          className="font-bold text-lg text-stone-600 underline-offset-2 hover:underline"
          href="/chat"
        >
          Chat
        </Link>
        <Link
          className="font-bold text-lg text-red-600 underline-offset-2 hover:underline"
          href="/reader"
        >
          Reader Test
        </Link>
        <Link
          className="font-bold text-lg text-red-600 underline-offset-2 hover:underline"
          href="/bibtex"
        >
          BibTeX Converter
        </Link>
      </nav>
    </header>
  );
}
