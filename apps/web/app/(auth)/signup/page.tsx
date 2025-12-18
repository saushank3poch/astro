'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<SignupFormData>();

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (data.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        birthDate: data.birthDate,
        birthTime: data.birthTime,
        birthLocation: {
          lat: 0, // Will be geocoded on backend
          lng: 0,
          city: data.birthCity,
          country: data.birthCountry,
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card variant="glass" padding="lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl">Create Your Account</CardTitle>
            <CardDescription className="text-center">
              Join Astro and unlock cosmic insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Username"
                  placeholder="astrouser"
                  {...register('username', { required: true })}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', { required: true })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password', { required: true })}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword', { required: true })}
                />
              </div>

              <div className="border-t border-cosmic-violet/20 pt-4 mt-6">
                <h4 className="font-semibold mb-3 text-cosmic-gold">Birth Information</h4>
                <p className="text-xs text-cosmic-silver/70 mb-4">
                  Required for personalized astrological predictions
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Birth Date"
                    type="date"
                    {...register('birthDate', { required: true })}
                  />

                  <Input
                    label="Birth Time"
                    type="time"
                    helperText="As accurate as possible"
                    {...register('birthTime', { required: true })}
                  />

                  <Input
                    label="Birth City"
                    placeholder="New York"
                    {...register('birthCity', { required: true })}
                  />

                  <Input
                    label="Birth Country"
                    placeholder="USA"
                    {...register('birthCountry', { required: true })}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-danger/20 border border-danger rounded-lg text-sm text-danger">
                  {error}
                </div>
              )}

              <Button type="submit" fullWidth isLoading={isLoading}>
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-cosmic-silver/70">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:text-primary-hover">
                  Sign in
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
