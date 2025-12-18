'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!data.email || !data.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      await login(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your Astro account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                {...register('email', { required: true })}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register('password', { required: true })}
              />

              {error && (
                <div className="p-3 bg-danger/20 border border-danger rounded-lg text-sm text-danger">
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-cosmic-silver/70">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-primary hover:text-primary-hover">
                  Sign up
                </Link>
              </p>
              <p className="text-sm text-cosmic-silver/70">
                <Link href="/" className="text-primary hover:text-primary-hover">
                  Back to home
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
