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
  const [highCompatibilityCount, setHighCompatibilityCount] = React.useState(0);

  // Fetch user on mount to get latest credits and compatibility count
  useEffect(() => {
    if (isAuthenticated && user) {
      apiClient.getCurrentUser()
        .then((updatedUser) => {
          useAuthStore.setState({ user: updatedUser });
        })
        .catch((err) => {
          console.error('Error fetching user:', err);
        });

      // Fetch high compatibility count (score >= 8)
      apiClient.getTopCompatibleAssets(user.id, { minScore: 8, limit: 100 })
        .then((response) => {
          setHighCompatibilityCount(response.topAssets?.length || 0);
        })
        .catch((err) => {
          console.error('Error fetching compatibility count:', err);
        });
    }
  }, [isAuthenticated, user, pathname]);

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
    { href: '/compatibility', label: 'My Matches', badge: highCompatibilityCount },
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
                  className={`relative px-4 py-2 rounded-lg transition-all ${
                    pathname === link.href
                      ? 'bg-cosmic-violet/20 text-cosmic-gold'
                      : 'text-cosmic-silver/80 hover:text-cosmic-silver hover:bg-cosmic-violet/10'
                  }`}
                >
                  {link.label}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-cosmic-violet rounded-full border-2 border-cosmic-deep">
                      {link.badge > 9 ? '9+' : link.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Credits and user menu */}
          <div className="flex items-center gap-4">
            {/* Credits display with dropdown */}
            {user && (
              <div className="relative group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cosmic-gold/10 to-cosmic-violet/10 border cursor-pointer transition-all ${
                    (user.creditsBalance || 0) < 5
                      ? 'border-yellow-500/50 hover:border-yellow-500/70'
                      : 'border-cosmic-gold/30 hover:border-cosmic-gold/50'
                  }`}
                >
                  <span className="text-cosmic-gold text-xl">💎</span>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-cosmic-silver/60">Credits</span>
                    <span className={`text-lg font-bold ${
                      (user.creditsBalance || 0) < 5 ? 'text-yellow-400' : 'text-cosmic-gold'
                    }`}>
                      {user.creditsBalance || 0}
                    </span>
                  </div>
                  {(user.creditsBalance || 0) < 5 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                    </span>
                  )}
                </motion.div>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-64 glass border border-cosmic-violet/30 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-4 border-b border-cosmic-violet/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-cosmic-silver/70">Current Balance</span>
                      <span className="text-xl font-bold text-cosmic-gold">
                        {user.creditsBalance || 0}
                      </span>
                    </div>
                    {(user.creditsBalance || 0) < 5 && (
                      <p className="text-xs text-yellow-400 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>Low credits! Purchase more to continue.</span>
                      </p>
                    )}
                  </div>
                  <Link href="/credits/purchase">
                    <div className="px-4 py-3 hover:bg-cosmic-violet/20 transition-colors cursor-pointer border-b border-cosmic-violet/20">
                      <span className="text-cosmic-silver/80 hover:text-cosmic-silver flex items-center gap-2">
                        <span>💳</span>
                        <span>Purchase Credits</span>
                      </span>
                    </div>
                  </Link>
                  <Link href="/credits/history">
                    <div className="px-4 py-3 hover:bg-cosmic-violet/20 transition-colors cursor-pointer">
                      <span className="text-cosmic-silver/80 hover:text-cosmic-silver flex items-center gap-2">
                        <span>📜</span>
                        <span>Transaction History</span>
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
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
                className={`relative px-3 py-2 text-sm rounded transition-all ${
                  pathname === link.href
                    ? 'bg-cosmic-violet/20 text-cosmic-gold'
                    : 'text-cosmic-silver/80'
                }`}
              >
                {link.label}
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-cosmic-violet rounded-full">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
