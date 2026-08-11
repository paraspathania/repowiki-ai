"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Network,
  GitCommit,
  Server,
  Database,
  Package,
  Activity,
  ShieldAlert,
  GraduationCap,
  MessageSquare,
  Download,
  Settings,
  HelpCircle,
  Bell,
  LogIn,
  PanelLeftClose,
  PanelLeftOpen,
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
  isExpanded: boolean;
}

function NavItem({ label, href, icon: Icon, isActive, isExpanded }: NavItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Link
      href={href}
      className={`sidebar-nav-item group relative flex items-center ${
        isExpanded ? "px-3 py-2 w-full justify-start gap-3" : "w-10 h-9 justify-center"
      } rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/20"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
      }`}
      onMouseEnter={() => !isExpanded && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Icon
        className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${
          isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
        }`}
      />

      {isExpanded && (
        <span className="text-xs font-semibold truncate tracking-tight text-slate-200 group-hover:text-white">
          {label}
        </span>
      )}

      {/* Floating Tooltip only in Collapsed Mode */}
      {!isExpanded && showTooltip && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1a1d27] text-white text-[11px] font-medium rounded-lg whitespace-nowrap z-50 pointer-events-none border border-white/[0.1] shadow-xl shadow-black/80 animate-fade-in">
          {label}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1a1d27] border-l border-b border-white/[0.1] rotate-45" />
        </div>
      )}
    </Link>
  );
}

function BottomNavItem({
  icon: Icon,
  label,
  onClick,
  isExpanded,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  isExpanded: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`sidebar-nav-item group relative flex items-center ${
        isExpanded ? "px-3 py-2 w-full justify-start gap-3" : "w-10 h-9 justify-center"
      } rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all duration-200`}
      onMouseEnter={() => !isExpanded && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Icon className="w-4 h-4 flex-shrink-0 transition-colors duration-200 group-hover:text-slate-300" />
      {isExpanded && <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">{label}</span>}
      {!isExpanded && showTooltip && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1a1d27] text-white text-[11px] font-medium rounded-lg whitespace-nowrap z-50 pointer-events-none border border-white/[0.1] shadow-xl shadow-black/80 animate-fade-in">
          {label}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1a1d27] border-l border-b border-white/[0.1] rotate-45" />
        </div>
      )}
    </button>
  );
}

function UserAvatar({ isExpanded }: { isExpanded: boolean }) {
  const { user, isAuthenticated, openAuthModal, signOut } = useAuth();

  if (!isAuthenticated) {
    return (
      <BottomNavItem icon={LogIn} label="Sign In" onClick={openAuthModal} isExpanded={isExpanded} />
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

  return (
    <button
      className={`group relative flex items-center ${
        isExpanded ? "px-3 py-2 w-full justify-start gap-3" : "w-10 h-9 justify-center"
      } rounded-xl hover:bg-white/[0.04] transition-all duration-200`}
      onClick={signOut}
    >
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-white/20 flex-shrink-0">
        {initials}
      </div>
      {isExpanded && <span className="text-xs font-semibold text-slate-300 truncate">Sign Out ({user?.name})</span>}
    </button>
  );
}

export function RepositorySidebar({ repoId }: RepositorySidebarProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const navItems = [
    { label: "Overview", href: `/repositories/${repoId}/overview`, icon: LayoutDashboard },
    { label: "Wiki", href: `/repositories/${repoId}/wiki`, icon: BookOpen },
    { label: "Files Explorer", href: `/repositories/${repoId}/files`, icon: FolderTree },
    { label: "Architecture", href: `/repositories/${repoId}/architecture`, icon: Network },
    { label: "Code Flow", href: `/repositories/${repoId}/code-flow`, icon: GitCommit },
    { label: "APIs Hub", href: `/repositories/${repoId}/apis`, icon: Server },
    { label: "Database ERD", href: `/repositories/${repoId}/database`, icon: Database },
    { label: "Dependencies", href: `/repositories/${repoId}/dependencies`, icon: Package },
    { label: "Insights & Refactor", href: `/repositories/${repoId}/insights`, icon: Activity },
    { label: "Security Audit", href: `/repositories/${repoId}/security`, icon: ShieldAlert },
    { label: "Learning Engine", href: `/repositories/${repoId}/learning`, icon: GraduationCap },
    { label: "Grounded AI Chat", href: `/repositories/${repoId}/chat`, icon: MessageSquare },
    { label: "Exports", href: `/repositories/${repoId}/exports`, icon: Download },
  ];

  return (
    <aside
      className={`${
        isExpanded ? "w-56" : "w-[56px]"
      } bg-[#090b11] border-r border-white/[0.08] flex flex-col items-center py-3 justify-between flex-shrink-0 z-30 transition-all duration-300 ease-in-out relative select-none`}
    >
      {/* Sidebar Expand / Collapse Toggle Header */}
      <div className="w-full px-2 pb-2 flex items-center justify-between border-b border-white/[0.06]">
        {isExpanded && (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Navigation
          </span>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition mx-auto"
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation list */}
      <div className="flex flex-col items-center gap-1 overflow-y-auto max-h-[calc(100vh-140px)] no-scrollbar py-2 w-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <NavItem
              key={item.href}
              label={item.label}
              href={item.href}
              icon={item.icon}
              isActive={isActive}
              isExpanded={isExpanded}
            />
          );
        })}
      </div>

      {/* Bottom utility icons */}
      <div className="flex flex-col items-center gap-1 pt-2 border-t border-white/[0.06] w-full px-2">
        <BottomNavItem icon={Bell} label="Notifications" isExpanded={isExpanded} />
        <BottomNavItem icon={HelpCircle} label="Help & Docs" isExpanded={isExpanded} />
        <BottomNavItem icon={Settings} label="Settings" isExpanded={isExpanded} />
        <UserAvatar isExpanded={isExpanded} />
      </div>
    </aside>
  );
}
