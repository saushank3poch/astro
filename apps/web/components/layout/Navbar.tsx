'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Fetch user on mount to get latest credits
  useEffect(() => {
    if (isAuthenticated) {
      apiClient.getCurrentUser()
        .then((updatedUser) => {
          useAuthStore.setState({ user: updatedUser });
        })
        .catch((err) => {
          console.error('Error fetching user:', err);
        });
    }
  }, [isAuthenticated, pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Don't show navbar on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/signup') || !isAuthenticated) {
    return null;
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/predictions', label: 'Predictions' },
    { href: '/assets', label: 'Assets' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-cosmic-violet/20 glass">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-cosmic-gold via-cosmic-violet to-cosmic-cyan bg-clip-text text-transparent"
            >
              ✨ Astro
            </motion.div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    pathname === link.href
                      ? 'bg-cosmic-violet/20 text-cosmic-gold'
                      : 'text-cosmic-silver/80 hover:text-cosmic-silver hover:bg-cosmic-violet/10'
                  }`}
                >
                  {link.label}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Credits and user menu */}
          <div className="flex items-center gap-4">
            {/* Credits display */}
            {user && (
              <Link href="/settings">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cosmic-gold/10 to-cosmic-violet/10 border border-cosmic-gold/30 cursor-pointer hover:border-cosmic-gold/50 transition-all"
                >
                  <span className="text-cosmic-gold text-xl">💎</span>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-cosmic-silver/60">Credits</span>
                    <span className="text-lg font-bold text-cosmic-gold">
                      {user.creditsBalance || 0}
                    </span>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* User menu */}
            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cosmic-violet/30 hover:border-cosmic-violet/50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cosmic-violet to-cosmic-indigo flex items-center justify-center text-white font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
                </div>
                <span className="hidden md:block text-cosmic-silver/80">
                  {user?.username || 'Menu'}
                </span>
              </motion.button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 glass border border-cosmic-violet/30 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link href="/settings">
                  <div className="px-4 py-3 hover:bg-cosmic-violet/20 transition-colors cursor-pointer border-b border-cosmic-violet/20">
                    <span className="text-cosmic-silver/80 hover:text-cosmic-silver">Settings</span>
                  </div>
                </Link>
                <Link href="/predictions/history">
                  <div className="px-4 py-3 hover:bg-cosmic-violet/20 transition-colors cursor-pointer border-b border-cosmic-violet/20">
                    <span className="text-cosmic-silver/80 hover:text-cosmic-silver">History</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left hover:bg-cosmic-violet/20 transition-colors"
                >
                  <span className="text-cosmic-silver/80 hover:text-cosmic-silver">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-cosmic-violet/20">
        <div className="flex items-center justify-around py-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                className={`px-3 py-2 text-sm rounded transition-all ${
                  pathname === link.href
                    ? 'bg-cosmic-violet/20 text-cosmic-gold'
                    : 'text-cosmic-silver/80'
                }`}
              >
                {link.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
