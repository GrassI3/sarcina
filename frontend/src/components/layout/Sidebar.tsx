'use client';

import React, { useState } from 'react';
import { Sidebar as AceternitySidebar, SidebarBody, SidebarLink } from '../ui/sidebar';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const Logo = () => {
  return (
    <Link href="/" className="font-normal flex space-x-2 items-center text-sm py-4 text-white relative z-20">
      <svg className="w-6 h-6 flex-shrink-0 text-[var(--accent-electric-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-heading font-bold text-lg text-white whitespace-pre"
      >
        FlowState
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link href="/" className="font-normal flex space-x-2 flex-shrink-0 items-center text-sm py-4 text-white relative z-20 w-fit">
      <svg className="w-6 h-6 flex-shrink-0 text-[var(--accent-electric-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </Link>
  );
};

export function Sidebar() {
  const [open, setOpen] = useState(false);

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0 text-[var(--foreground-muted)] group-hover/sidebar:text-[var(--accent-electric-blue)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: 'Tasks',
      href: '/tasks',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0 text-[var(--foreground-muted)] group-hover/sidebar:text-[var(--accent-electric-blue)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      label: 'Planner',
      href: '/planner',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0 text-[var(--foreground-muted)] group-hover/sidebar:text-[var(--accent-vibrant-green)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Focus',
      href: '/focus',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0 text-[var(--foreground-muted)] group-hover/sidebar:text-[var(--accent-neon-purple)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Habits',
      href: '/habits',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0 text-[var(--foreground-muted)] group-hover/sidebar:text-[var(--accent-vibrant-green)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Team Hub',
      href: '/chat',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0 text-[var(--foreground-muted)] group-hover/sidebar:text-[var(--accent-electric-blue)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
    },
  ];

  return (
    <AceternitySidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 bg-[var(--background-panel)] dark:bg-[var(--background-panel)] backdrop-blur-md border-r border-t-0 border-l-0 border-b-0 border-[var(--glass-border)] !h-[100dvh]">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {navItems.map((link, idx) => (
              <SidebarLink 
                key={idx} 
                link={link} 
                className="hover:text-[var(--accent-electric-blue)] transition-colors text-[var(--foreground-muted)]"
              />
            ))}
          </div>
        </div>
        
        <div className="pt-4 border-t border-[var(--glass-border)]">
           <SidebarLink
             link={{
               label: 'Personal Settings',
               href: '#',
               icon: (
                 <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[var(--accent-neon-purple)] to-[var(--accent-electric-blue)] flex-shrink-0 flex items-center justify-center text-[8px] text-white font-bold border border-white/20">
                   U
                 </div>
               ),
             }}
             className="hover:text-white transition-colors"
           />
        </div>
      </SidebarBody>
    </AceternitySidebar>
  );
}
