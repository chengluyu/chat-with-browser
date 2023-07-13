"use client";

import {
  ActivityLogIcon,
  ChatBubbleIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import classNames from "classnames";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PageHeader() {
  const pathname = usePathname();
  return (
    <header className="flex-shrink-0 px-2 h-10 flex flex-row items-center border-b gap-8 border-stone-400">
      <Link className="font-bold text-xl" href="/">
        Chat with Browser
      </Link>
      <nav className="flex flex-row items-center gap-4">
        <NavLink href="/chat">
          <ChatBubbleIcon className="mr-1 text-current" />
          Chat
        </NavLink>
        <NavLink href="/reader">
          <ReaderIcon className="mr-1 text-current" />
          Reader Test
        </NavLink>
        <NavLink href="/bibtex">
          <ActivityLogIcon className="mr-1 text-current" />
          BibTeX Converter
        </NavLink>
      </nav>
    </header>
  );
}

type NavLinkProps = { href: string; children: React.ReactNode };

function NavLink({ href, children }: NavLinkProps) {
  const isActive = usePathname().startsWith(href);
  return (
    <Link
      className={classNames(
        "flex items-center border-b border-transparent hover:border-current",
        isActive ? "text-red-600" : "text-stone-600"
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
