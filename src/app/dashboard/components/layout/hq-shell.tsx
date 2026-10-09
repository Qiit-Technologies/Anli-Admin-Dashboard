"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

/**
 * Shared shell for HQ command-center pages: inner HQ sidebar + header + content.
 * Matches the shell pattern used by the existing dashboard sub-pages.
 */
export default function HqShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col sm:flex-row overflow-hidden">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title={title}
        />
        <main className="px-4 sm:px-6 py-6 space-y-4 sm:space-y-6 bg-gray-50 overflow-x-hidden flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
