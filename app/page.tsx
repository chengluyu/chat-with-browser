import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Link href="/chat">Chat</Link>
      <Link href="/reader">Reader Test</Link>
      <Link href="/bibtex">BibTeX Converter</Link>
    </>
  );
}
