'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome, {user.username || user.email || 'Cosmic Explorer'}! 🌟
            </h1>
            <p className="text-cosmic-silver/70">
              Your personalized astrological dashboard
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/settings">
              <Button variant="outline">Settings</Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cosmic-gold mb-2">
                  {user.creditsBalance || 0}
                </div>
                <div className="text-sm text-cosmic-silver/70">Credits Remaining</div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cosmic-violet mb-2">
                  {user.subscriptionTier?.toUpperCase()}
                </div>
                <div className="text-sm text-cosmic-silver/70">Subscription Tier</div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cosmic-cyan mb-2">0</div>
                <div className="text-sm text-cosmic-silver/70">Total Predictions</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your cosmic journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button fullWidth variant="primary" disabled>
                  🔮 New Prediction
                </Button>
                <Button fullWidth variant="secondary" disabled>
                  ⭐ View Compatible Assets
                </Button>
                <Button fullWidth variant="outline" disabled>
                  📊 Polymarket Events
                </Button>
                <Button fullWidth variant="outline" disabled>
                  📈 Prediction History
                </Button>
              </div>
              <p className="text-xs text-cosmic-silver/60 text-center mt-4">
                Prediction features coming soon!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Account information and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-cosmic-violet/20">
                  <span className="text-cosmic-silver/70">Email:</span>
                  <span className="font-medium">{user.email || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cosmic-violet/20">
                  <span className="text-cosmic-silver/70">Username:</span>
                  <span className="font-medium">{user.username || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cosmic-violet/20">
                  <span className="text-cosmic-silver/70">Primary Auth:</span>
                  <span className="font-medium capitalize">{user.primaryAuthMethod}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-cosmic-violet/20">
                  <span className="text-cosmic-silver/70">Birth Date:</span>
                  <span className="font-medium">{user.birthDate || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-cosmic-silver/70">Member Since:</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/settings">
                  <Button fullWidth variant="outline">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
