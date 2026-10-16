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
  Lock,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface RepositorySidebarProps {
  repoId: string;
}

interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
}

interface NavItemProps extends NavItemConfig {
  isActive: boolean;
  isExpanded: boolean;
  isLocked: boolean;
  onLockedClick: () => void;
}

function NavItem({
  label,
  href,
  icon: Icon,
  isActive,
  isExpanded,
  isLocked,
  onLockedClick,
}: NavItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const baseClass = `sidebar-nav-item group relative flex items-center ${
    isExpanded ? "px-3 py-2 w-full justify-start gap-2.5" : "w-9 h-8 justify-center"
  } rounded-sm transition-colors duration-150 ${
    isLocked
      ? "opacity-50 cursor-pointer text-[#737373] hover:opacity-80 hover:bg-[#141414]"
      : isActive
      ? "bg-[#1D1D1D] text-[#F5F5F5] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[2px] before:bg-[#F5F5F5]"
      : "text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#141414]"
  }`;

  const tooltipContent = isLocked ? "Sign in to unlock" : label;

  const inner = (
    <>
      <div className="relative flex-shrink-0">
        <Icon
          className={`w-3.5 h-3.5 transition-colors duration-150 ${
            isLocked
              ? "text-[#737373]"
              : isActive
              ? "text-[#F5F5F5]"
              : "text-[#737373] group-hover:text-[#F5F5F5]"
          }`}
        />
        {isLocked && (
          <Lock className="w-2 h-2 text-[#737373] absolute -bottom-1 -right-1" />
        )}
      </div>

      {isExpanded && (
        <span className={`text-xs truncate tracking-tight flex-1 ${isActive ? "text-[#F5F5F5] font-semibold" : "text-[#A3A3A3] group-hover:text-[#F5F5F5]"}`}>
          {label}
        </span>
      )}

      {isExpanded && isLocked && (
        <Lock className="w-2.5 h-2.5 text-[#737373] flex-shrink-0" />
      )}

      {/* Tooltip */}
      {!isExpanded && showTooltip && (
        <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#141414] text-[#F5F5F5] text-[11px] font-mono rounded-sm whitespace-nowrap z-50 pointer-events-none border border-[#303030] shadow-xl">
          {tooltipContent}
        </div>
      )}
    </>
  );

  if (isLocked) {
    return (
      <button
        onClick={onLockedClick}
        className={baseClass}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={baseClass}
      onMouseEnter={() => !isExpanded && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {inner}
    </Link>
  );
}

function BottomNavItem({
  icon: Icon,
  label,
  href,
  onClick,
  isExpanded,
  isActive,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  isExpanded: boolean;
  isActive?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const content = (
    <>
      <Icon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors duration-150 ${isActive ? "text-[#F5F5F5]" : "text-[#737373] group-hover:text-[#F5F5F5]"}`} />
      {isExpanded && <span className={`text-xs ${isActive ? "text-[#F5F5F5] font-semibold" : "text-[#A3A3A3] group-hover:text-[#F5F5F5]"}`}>{label}</span>}
      {!isExpanded && showTooltip && (
        <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#141414] text-[#F5F5F5] text-[11px] font-mono rounded-sm whitespace-nowrap z-50 pointer-events-none border border-[#303030] shadow-xl">
          {label}
        </div>
      )}
    </>
  );

  const className = `sidebar-nav-item group relative flex items-center ${
    isExpanded ? "px-3 py-2 w-full justify-start gap-2.5" : "w-9 h-8 justify-center"
  } rounded-sm ${
    isActive ? "bg-[#1D1D1D] text-[#F5F5F5] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[2px] before:bg-[#F5F5F5]" : "text-[#737373] hover:text-[#F5F5F5] hover:bg-[#141414]"
  } transition-colors duration-150`;

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        onMouseEnter={() => !isExpanded && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={className}
      onMouseEnter={() => !isExpanded && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {content}
    </button>
  );
}

function UserAvatar({ isExpanded }: { isExpanded: boolean }) {
  const { user, isAuthenticated, openAuthModal, openProfileModal } = useAuth();

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
        isExpanded ? "px-3 py-2 w-full justify-start gap-2.5" : "w-9 h-8 justify-center"
      } rounded-sm hover:bg-[#141414] transition-colors duration-150`}
      onClick={openProfileModal}
      title="View Profile"
    >
      <div className="w-5 h-5 rounded-none bg-[#1D1D1D] border border-[#303030] flex items-center justify-center text-[9px] font-bold text-[#F5F5F5] flex-shrink-0 font-mono">
        {initials}
      </div>
      {isExpanded && <span className="text-xs font-mono text-[#A3A3A3] group-hover:text-[#F5F5F5] truncate">{user?.name}</span>}
    </button>
  );
}

export function RepositorySidebar({ repoId }: RepositorySidebarProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { isAuthenticated, openAuthModal } = useAuth();

  const navItems: NavItemConfig[] = [
    // --- Public features ---
    { label: "Overview", href: `/repositories/${repoId}/overview`, icon: LayoutDashboard },
    { label: "Files Explorer", href: `/repositories/${repoId}/files`, icon: FolderTree },
    { label: "Architecture", href: `/repositories/${repoId}/architecture`, icon: Network },
    { label: "Database ERD", href: `/repositories/${repoId}/database`, icon: Database },
    { label: "Dependencies", href: `/repositories/${repoId}/dependencies`, icon: Package },
    // --- Auth-required features ---
    { label: "Wiki", href: `/repositories/${repoId}/wiki`, icon: BookOpen, requiresAuth: true },
    { label: "Code Flow", href: `/repositories/${repoId}/code-flow`, icon: GitCommit, requiresAuth: true },
    { label: "APIs Hub", href: `/repositories/${repoId}/apis`, icon: Server, requiresAuth: true },
    { label: "Insights & Refactor", href: `/repositories/${repoId}/insights`, icon: Activity, requiresAuth: true },
    { label: "Security Audit", href: `/repositories/${repoId}/security`, icon: ShieldAlert, requiresAuth: true },
    { label: "Learning Engine", href: `/repositories/${repoId}/learning`, icon: GraduationCap, requiresAuth: true },
    { label: "Grounded AI Chat", href: `/repositories/${repoId}/chat`, icon: MessageSquare, requiresAuth: true },
    { label: "Exports", href: `/repositories/${repoId}/exports`, icon: Download, requiresAuth: true },
  ];

  const isSettingsActive = pathname.startsWith(`/repositories/${repoId}/settings`);

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-[2px]"
          onClick={() => setIsExpanded(false)}
        />
      )}
      <aside
        className={`${
          isExpanded
            ? "w-56 fixed md:relative inset-y-0 left-0 z-40 shadow-2xl md:shadow-none"
            : "w-[48px] md:w-[52px]"
        } bg-[#0A0A0A] border-r border-[#303030] flex flex-col items-center py-2.5 justify-between flex-shrink-0 z-30 transition-all duration-200 ease-in-out select-none`}
      >
      {/* Sidebar Expand / Collapse Toggle Header */}
      <div className="w-full px-2 pb-2 flex items-center justify-between border-b border-[#303030]">
        {isExpanded && (
          <span className="text-[10px] font-mono font-semibold text-[#737373] uppercase tracking-wider px-2">
            Navigation
          </span>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-sm text-[#737373] hover:text-[#F5F5F5] hover:bg-[#141414] transition mx-auto"
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isExpanded ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Navigation list */}
      <div className="flex flex-col items-center gap-0.5 overflow-y-auto max-h-[calc(100vh-130px)] no-scrollbar py-2 w-full px-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isLocked = !!item.requiresAuth && !isAuthenticated;
          return (
            <NavItem
              key={item.href}
              label={item.label}
              href={item.href}
              icon={item.icon}
              isActive={isActive}
              isExpanded={isExpanded}
              isLocked={isLocked}
              onLockedClick={openAuthModal}
            />
          );
        })}
      </div>

      {/* Bottom utility icons */}
      <div className="flex flex-col items-center gap-0.5 pt-2 border-t border-[#303030] w-full px-1.5">
        <BottomNavItem icon={Bell} label="Notifications" isExpanded={isExpanded} />
        <BottomNavItem icon={HelpCircle} label="Help & Docs" isExpanded={isExpanded} />
        <BottomNavItem
          icon={Settings}
          label="Settings"
          href={`/repositories/${repoId}/settings`}
          isActive={isSettingsActive}
          isExpanded={isExpanded}
        />
        <UserAvatar isExpanded={isExpanded} />
      </div>
    </aside>
    </>
  );
}
