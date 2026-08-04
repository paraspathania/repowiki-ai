"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Network,
  Server,
  MessageSquare,
  Download,
  Settings,
  HelpCircle,
  Bell,
  LogIn,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface RepositorySidebarProps {
  repoId: string;
}

interface NavItemProps {
  label: string;
  href: string;
  icon: React.ElementType;
  isActive: boolean;
}

function NavItem({ label, href, icon: Icon, isActive }: NavItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Link
      href={href}
      className={`sidebar-nav-item group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-white/[0.08] text-white shadow-sm shadow-white/[0.04]"
          : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
      }`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Icon
        className={`w-[18px] h-[18px] transition-colors duration-200 ${
          isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
        }`}
      />
      {/* Tooltip */}
      <div
        className={`absolute left-full ml-3 px-2.5 py-1.5 bg-[#1a1d27] text-white text-[11px] font-medium rounded-lg whitespace-nowrap pointer-events-none border border-white/[0.08] shadow-xl shadow-black/40 transition-all duration-150 ${
          showTooltip
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-1"
        }`}
      >
        {label}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1a1d27] border-l border-b border-white/[0.08] rotate-45" />
      </div>
    </Link>
  );
}

function BottomNavItem({
  icon: Icon,
  label,
  onClick,
  className: extraClass,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`sidebar-nav-item group relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:text-slate-400 hover:bg-white/[0.04] transition-all duration-200 ${extraClass || ""}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Icon className="w-[18px] h-[18px] transition-colors duration-200 group-hover:text-slate-400" />
      {/* Tooltip */}
      <div
        className={`absolute left-full ml-3 px-2.5 py-1.5 bg-[#1a1d27] text-white text-[11px] font-medium rounded-lg whitespace-nowrap pointer-events-none border border-white/[0.08] shadow-xl shadow-black/40 transition-all duration-150 ${
          showTooltip
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-1"
        }`}
      >
        {label}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1a1d27] border-l border-b border-white/[0.08] rotate-45" />
      </div>
    </button>
  );
}

function UserAvatar() {
  const { user, isAuthenticated, openAuthModal, signOut } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isAuthenticated) {
    return (
      <BottomNavItem icon={LogIn} label="Sign In" onClick={openAuthModal} />
    );
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const providerColors: Record<string, string> = {
    google: "from-blue-500 to-red-500",
    github: "from-gray-600 to-gray-800",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        className="group relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/[0.04] transition-all duration-200"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={signOut}
      >
        <div
          className={`w-7 h-7 rounded-full bg-gradient-to-br ${
            providerColors[user?.provider || "github"]
          } flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white/[0.1] group-hover:ring-white/[0.2] transition-all duration-200`}
        >
          {initials}
        </div>
        {/* Tooltip */}
        <div
          className={`absolute left-full ml-3 px-2.5 py-1.5 bg-[#1a1d27] text-white text-[11px] font-medium rounded-lg whitespace-nowrap pointer-events-none border border-white/[0.08] shadow-xl shadow-black/40 transition-all duration-150 ${
            showTooltip
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-1"
          }`}
        >
          Sign Out ({user?.name})
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1a1d27] border-l border-b border-white/[0.08] rotate-45" />
        </div>
      </button>
    </div>
  );
}

export function RepositorySidebar({ repoId }: RepositorySidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: `/repositories/${repoId}/overview`,
      icon: LayoutDashboard,
    },
    {
      label: "Files",
      href: `/repositories/${repoId}/files`,
      icon: FolderTree,
    },
    {
      label: "Architecture",
      href: `/repositories/${repoId}/architecture`,
      icon: Network,
    },
    { label: "Wiki", href: `/repositories/${repoId}/wiki`, icon: BookOpen },
    { label: "APIs", href: `/repositories/${repoId}/apis`, icon: Server },
    {
      label: "AI Chat",
      href: `/repositories/${repoId}/chat`,
      icon: MessageSquare,
    },
    {
      label: "Exports",
      href: `/repositories/${repoId}/exports`,
      icon: Download,
    },
  ];

  return (
    <aside className="w-[52px] bg-[#0a0c14] border-r border-white/[0.06] flex flex-col items-center py-4 justify-between flex-shrink-0">
      {/* Top nav icons */}
      <div className="flex flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <NavItem
              key={item.href}
              label={item.label}
              href={item.href}
              icon={item.icon}
              isActive={isActive}
            />
          );
        })}
      </div>

      {/* Bottom utility icons */}
      <div className="flex flex-col items-center gap-1">
        <BottomNavItem icon={Bell} label="Notifications" />
        <BottomNavItem icon={HelpCircle} label="Help" />
        <BottomNavItem icon={Settings} label="Settings" />
        <div className="w-6 h-px bg-white/[0.08] my-1" />
        <UserAvatar />
      </div>
    </aside>
  );
}
