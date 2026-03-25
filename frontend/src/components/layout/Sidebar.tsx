'use client';

import React, { useState } from 'react';
import { Sidebar as AceternitySidebar, SidebarBody, SidebarLink } from '../ui/sidebar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '@/lib/AuthContext';

export const Logo = () => {
  return (
    <Link href="/" className="font-normal flex space-x-3 items-center text-sm py-4 text-foreground relative z-20">
      <div className="w-8 h-8 rounded-xl bg-[linear-gradient(135deg,var(--accent-electric-blue),var(--accent-vibrant-green))] flex items-center justify-center shadow-[0_10px_24px_rgba(70,140,220,0.35)]">
        <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 3L5 14h6l-1 7 9-12h-6z" />
        </svg>
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-heading font-bold text-lg text-foreground whitespace-pre"
      >
        FlowState
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link href="/" className="font-normal flex space-x-2 shrink-0 items-center text-sm py-4 text-foreground relative z-20 w-fit">
      <div className="w-8 h-8 rounded-xl bg-[linear-gradient(135deg,var(--accent-electric-blue),var(--accent-vibrant-green))] flex items-center justify-center shadow-[0_10px_24px_rgba(70,140,220,0.35)]">
        <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 3L5 14h6l-1 7 9-12h-6z" />
        </svg>
      </div>
    </Link>
  );
};

export function Sidebar() {
  const [open, setOpen] = useState(true);
  const { user, logout } = useAuth();
  const displayInitial = (user?.displayName?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();
  const displayName = user?.displayName || user?.email || "Workspace User";

  const navItems = [
    {
      label: 'Dashboard',
      href: '/?view=dashboard',
      icon: (
        <svg className="w-5 h-5 shrink-0 text-(--foreground-muted) group-hover/sidebar:text-electric-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: 'Tasks',
      href: '/?view=tasks',
      icon: (
        <svg className="w-5 h-5 shrink-0 text-(--foreground-muted) group-hover/sidebar:text-electric-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      label: 'Planner',
      href: '/?view=planner',
      icon: (
        <svg className="w-5 h-5 shrink-0 text-(--foreground-muted) group-hover/sidebar:text-(--accent-vibrant-green) transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Focus',
      href: '/?view=focus',
      icon: (
        <svg className="w-5 h-5 shrink-0 text-(--foreground-muted) group-hover/sidebar:text-neon-purple transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Habits',
      href: '/?view=habits',
      icon: (
        <svg className="w-5 h-5 shrink-0 text-(--foreground-muted) group-hover/sidebar:text-(--accent-vibrant-green) transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Team Hub',
      href: '/?view=chat',
      icon: (
        <svg className="w-5 h-5 shrink-0 text-(--foreground-muted) group-hover/sidebar:text-electric-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
    },
  ];

  return (
    <AceternitySidebar open={open} setOpen={setOpen} animate={false}>
      <SidebarBody className="justify-between gap-8 bg-panel/90 dark:bg-panel/95 backdrop-blur-xl border-r border-t-0 border-l-0 border-b-0 border-(--glass-border) h-dvh! shadow-[10px_0_36px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-6 flex flex-col gap-1.5">
            {navItems.map((link, idx) => (
              <SidebarLink 
                key={idx} 
                link={link} 
                className="hover:text-foreground transition-all text-(--foreground-muted) rounded-xl px-2 py-2.5 hover:bg-black/8 dark:hover:bg-white/8"
              />
            ))}
          </div>
        </div>
        
        <div className="pt-4 border-t border-(--glass-border) flex flex-col gap-2 overflow-hidden">
           <SidebarLink
             link={{
               label: displayName,
               href: '#',
               icon: (
                 <div className="w-6 h-6 rounded-full bg-linear-to-tr from-(--accent-vibrant-green) to-electric-blue shrink-0 flex items-center justify-center text-[9px] text-white font-bold border border-white/20">
                   {displayInitial}
                 </div>
               ),
             }}
             className="hover:text-foreground transition-all text-(--foreground-muted) rounded-xl px-2 py-2.5 hover:bg-black/8 dark:hover:bg-white/8"
           />
           <button
             type="button"
             onClick={() => void logout()}
             className="text-left rounded-xl px-2 py-2.5 text-sm text-(--foreground-muted) hover:bg-black/8 dark:hover:bg-white/8 hover:text-foreground transition-all"
           >
             Logout
           </button>
           <ThemeToggle />
        </div>
      </SidebarBody>
    </AceternitySidebar>
  );
}
