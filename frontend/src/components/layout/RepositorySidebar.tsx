"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, FolderTree, Network, Server, MessageSquare, Download } from "lucide-react";

interface RepositorySidebarProps {
  repoId: string;
}

export function RepositorySidebar({ repoId }: RepositorySidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: `/repositories/${repoId}/overview`, icon: LayoutDashboard },
    { label: "Files", href: `/repositories/${repoId}/files`, icon: FolderTree },
    { label: "Architecture", href: `/repositories/${repoId}/architecture`, icon: Network },
    { label: "Wiki", href: `/repositories/${repoId}/wiki`, icon: BookOpen },
    { label: "APIs", href: `/repositories/${repoId}/apis`, icon: Server },
    { label: "AI Chat", href: `/repositories/${repoId}/chat`, icon: MessageSquare },
    { label: "Exports", href: `/repositories/${repoId}/exports`, icon: Download },
  ];

  return (
    <aside className="w-52 bg-surface border-r border-border flex flex-col py-4 px-2 space-y-1 text-xs">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition font-medium ${
              isActive
                ? "bg-accent/20 text-white font-semibold border border-accent/40"
                : "text-gray-400 hover:text-white hover:bg-panel"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-accent-blue" : "text-gray-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
