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
    <div className="h-screen w-screen flex flex-col sm:flex-row overflow-hidden">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title={title}
        />
        <main className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-[#0f1115] overflow-y-auto overflow-x-hidden flex-1 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
