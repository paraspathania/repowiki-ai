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
    <aside className="w-56 bg-surface/30 backdrop-blur-md border-r border-white/[0.06] flex flex-col py-6 px-3.5 space-y-1.5 text-xs">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 font-semibold border ${
              isActive
                ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shadow-md shadow-indigo-950/20"
                : "text-slate-400 hover:text-white hover:bg-white/[0.02] border-transparent"
            }`}
          >
            <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
