'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { authenticateWithPhantom, authenticateWithMetaMask, isPhantomInstalled, isMetaMaskInstalled } from '@/lib/wallet';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handlePhantomConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { user, isNewUser } = await authenticateWithPhantom();
      setUser(user);

      if (isNewUser) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect with Phantom');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetaMaskConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { user, isNewUser } = await authenticateWithMetaMask();
      setUser(user);

      if (isNewUser) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect with MetaMask');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl"
      >
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cosmic-violet via-cosmic-indigo to-cosmic-cyan bg-clip-text text-transparent"
          >
            Astro
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-cosmic-silver mb-4"
          >
            Cosmic Insights for Financial Decisions
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-cosmic-silver/70 max-w-2xl mx-auto"
          >
            Harness the power of ancient astrology and modern AI to make informed predictions about crypto, stocks, and financial markets.
          </motion.p>
        </div>

        {/* Authentication Options */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Wallet Auth */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card variant="glass" padding="lg" className="h-full">
              <CardHeader>
                <CardTitle className="text-center">Connect Wallet</CardTitle>
                <CardDescription className="text-center">
                  Web3-native authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Phantom */}
                <Button
                  fullWidth
                  variant="primary"
                  onClick={handlePhantomConnect}
                  disabled={!isPhantomInstalled() || isLoading}
                  isLoading={isLoading}
                >
                  <span className="mr-2">◎</span>
                  {isPhantomInstalled() ? 'Connect Phantom' : 'Install Phantom'}
                </Button>

                {/* MetaMask */}
                <Button
                  fullWidth
                  variant="primary"
                  onClick={handleMetaMaskConnect}
                  disabled={!isMetaMaskInstalled() || isLoading}
                  isLoading={isLoading}
                >
                  <span className="mr-2">Ξ</span>
                  {isMetaMaskInstalled() ? 'Connect MetaMask' : 'Install MetaMask'}
                </Button>

                {!isPhantomInstalled() && !isMetaMaskInstalled() && (
                  <p className="text-xs text-cosmic-silver/60 text-center mt-2">
                    Install a wallet to continue
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Email Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card variant="glass" padding="lg" className="h-full">
              <CardHeader>
                <CardTitle className="text-center">Sign Up</CardTitle>
                <CardDescription className="text-center">
                  Create a new account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/auth/signup">
                  <Button fullWidth variant="secondary">
                    Get Started
                  </Button>
                </Link>
                <p className="text-xs text-cosmic-silver/60 text-center mt-4">
                  Free tier includes 3 predictions per month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Email Login */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card variant="glass" padding="lg" className="h-full">
              <CardHeader>
                <CardTitle className="text-center">Sign In</CardTitle>
                <CardDescription className="text-center">
                  Already have an account?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/auth/login">
                  <Button fullWidth variant="outline">
                    Sign In
                  </Button>
                </Link>
                <p className="text-xs text-cosmic-silver/60 text-center mt-4">
                  Or connect your wallet above
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-danger/20 border border-danger rounded-lg text-center text-danger max-w-2xl mx-auto"
          >
            {error}
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
        >
          <div>
            <div className="text-4xl mb-3">🔮</div>
            <h3 className="font-bold text-lg mb-2">Three Prediction Types</h3>
            <p className="text-sm text-cosmic-silver/70">
              Macro trends, birth date analysis, and divination methods
            </p>
          </div>
          <div>
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-bold text-lg mb-2">Personalized Insights</h3>
            <p className="text-sm text-cosmic-silver/70">
              Get asset recommendations based on your birth chart
            </p>
          </div>
          <div>
            <div className="text-4xl mb-3">🌟</div>
            <h3 className="font-bold text-lg mb-2">AI-Powered</h3>
            <p className="text-sm text-cosmic-silver/70">
              Advanced AI agents combining astrology with market analysis
            </p>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-center text-xs text-cosmic-silver/50 max-w-3xl mx-auto"
        >
          ⚠️ For entertainment purposes only. Predictions are not financial advice.
          Always do your own research and consult with licensed financial advisors before making investment decisions.
        </motion.div>
      </motion.div>
    </div>
  );
}
