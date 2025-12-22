'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CpuChipIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Overview', href: '/admin', icon: HomeIcon },
  { name: 'AI Costs', href: '/admin/ai-costs', icon: CpuChipIcon },
  { name: 'Performance', href: '/admin/performance', icon: BoltIcon },
  { name: 'Errors', href: '/admin/errors', icon: ExclamationTriangleIcon },
  { name: 'Feedback', href: '/admin/feedback', icon: ChatBubbleLeftRightIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-sm text-gray-400">Monitor & Analytics</p>
      </div>

      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 px-3 py-3 rounded-lg transition-all
                ${
                  isActive
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <HomeIcon className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
