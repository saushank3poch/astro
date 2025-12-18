'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { linkPhantomWallet, linkMetaMaskWallet, isPhantomInstalled, isMetaMaskInstalled } from '@/lib/wallet';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLinkPhantom = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await linkPhantomWallet('Phantom Wallet');
      setSuccess('Phantom wallet linked successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to link Phantom wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkMetaMask = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await linkMetaMaskWallet('MetaMask Wallet');
      setSuccess('MetaMask wallet linked successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to link MetaMask wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-cosmic-silver/70">
            Manage your account and preferences
          </p>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-danger/20 border border-danger rounded-lg text-danger"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-success/20 border border-success rounded-lg text-success"
          >
            {success}
          </motion.div>
        )}

        {/* Account Linking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Linked Accounts</CardTitle>
              <CardDescription>
                Connect multiple authentication methods to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Email */}
                <div className="flex justify-between items-center p-4 border border-cosmic-violet/20 rounded-lg">
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-cosmic-silver/70">
                      {user.email || 'Not linked'}
                    </div>
                  </div>
                  <div className="text-sm text-success">
                    {user.email ? '✓ Linked' : 'Not linked'}
                  </div>
                </div>

                {/* Phantom Wallet */}
                <div className="flex justify-between items-center p-4 border border-cosmic-violet/20 rounded-lg">
                  <div>
                    <div className="font-medium">◎ Phantom Wallet</div>
                    <div className="text-sm text-cosmic-silver/70">
                      Solana blockchain
                    </div>
                  </div>
                  {isPhantomInstalled() ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleLinkPhantom}
                      disabled={isLoading}
                    >
                      Link Wallet
                    </Button>
                  ) : (
                    <div className="text-sm text-cosmic-silver/50">Not installed</div>
                  )}
                </div>

                {/* MetaMask Wallet */}
                <div className="flex justify-between items-center p-4 border border-cosmic-violet/20 rounded-lg">
                  <div>
                    <div className="font-medium">Ξ MetaMask</div>
                    <div className="text-sm text-cosmic-silver/70">
                      Ethereum blockchain
                    </div>
                  </div>
                  {isMetaMaskInstalled() ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleLinkMetaMask}
                      disabled={isLoading}
                    >
                      Link Wallet
                    </Button>
                  ) : (
                    <div className="text-sm text-cosmic-silver/50">Not installed</div>
                  )}
                </div>

                {/* Twitter */}
                <div className="flex justify-between items-center p-4 border border-cosmic-violet/20 rounded-lg">
                  <div>
                    <div className="font-medium">Twitter / X</div>
                    <div className="text-sm text-cosmic-silver/70">
                      {user.twitterHandle || 'Not linked'}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card variant="glass" padding="lg">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-cosmic-silver/70 mb-1">Username</div>
                  <div className="font-medium">{user.username || 'Not set'}</div>
                </div>
                <div>
                  <div className="text-sm text-cosmic-silver/70 mb-1">Birth Date</div>
                  <div className="font-medium">{user.birthDate || 'Not set'}</div>
                </div>
                <div>
                  <div className="text-sm text-cosmic-silver/70 mb-1">Birth Time</div>
                  <div className="font-medium">{user.birthTime || 'Not set'}</div>
                </div>
                <div>
                  <div className="text-sm text-cosmic-silver/70 mb-1">Astrology System</div>
                  <div className="font-medium capitalize">
                    {user.astrologySystem || 'Both'}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button fullWidth variant="outline" disabled>
                Edit Profile (Coming Soon)
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass" padding="lg" className="border-danger">
            <CardHeader>
              <CardTitle className="text-danger">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                fullWidth
                variant="danger"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
