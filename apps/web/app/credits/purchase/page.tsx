'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Blockchain } from '@/types';
import { CREDIT_PACKAGES } from '@/types/payment';
import { CreditPackageCard } from '@/components/payment/CreditPackageCard';
import { BlockchainSelector } from '@/components/payment/BlockchainSelector';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { apiClient } from '@/lib/api';

export default function CreditsPurchasePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedBlockchain, setSelectedBlockchain] = useState<Blockchain>('solana');
  const [selectedToken, setSelectedToken] = useState('SOL');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleProceedToPayment = () => {
    if (selectedPackage) {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = async () => {
    // Refresh user data to get updated credits
    try {
      const updatedUser = await apiClient.getCurrentUser();
      useAuthStore.setState({ user: updatedUser });
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cosmic-deep py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cosmic-gold via-cosmic-violet to-cosmic-cyan bg-clip-text text-transparent mb-4"
          >
            Purchase Credits
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-cosmic-silver/70 text-lg"
          >
            Choose a package and pay with crypto
          </motion.p>

          {/* Current Balance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full glass border border-cosmic-gold/30"
          >
            <span className="text-cosmic-gold text-2xl">💎</span>
            <div className="text-left">
              <div className="text-xs text-cosmic-silver/60">Current Balance</div>
              <div className="text-xl font-bold text-cosmic-gold">
                {user.creditsBalance || 0} Credits
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-cosmic-silver mb-6">
            Select Package
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <CreditPackageCard
                key={pkg.id}
                package={pkg}
                isSelected={selectedPackage === pkg.id}
                onSelect={() => setSelectedPackage(pkg.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Payment Method Selection */}
        {selectedPackage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-8 glass border border-cosmic-violet/30 rounded-xl"
          >
            <h2 className="text-2xl font-bold text-cosmic-silver mb-6">
              Payment Method
            </h2>
            <BlockchainSelector
              selectedBlockchain={selectedBlockchain}
              selectedToken={selectedToken}
              onBlockchainChange={setSelectedBlockchain}
              onTokenChange={setSelectedToken}
            />
          </motion.div>
        )}

        {/* Proceed Button */}
        {selectedPackage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProceedToPayment}
              className="px-12 py-4 rounded-xl bg-gradient-to-r from-cosmic-gold to-yellow-600 text-cosmic-deep text-lg font-bold shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:shadow-[0_0_40px_rgba(212,175,55,0.7)] transition-shadow"
            >
              Proceed to Payment
            </motion.button>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-6 glass border border-cosmic-violet/20 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-cosmic-silver mb-4">
            Payment Information
          </h3>
          <ul className="space-y-2 text-cosmic-silver/70 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-cosmic-gold">✓</span>
              <span>Credits are added instantly upon payment confirmation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cosmic-gold">✓</span>
              <span>Solana payments are confirmed within seconds using Solana Pay</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cosmic-gold">✓</span>
              <span>Ethereum and Base payments require manual confirmation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cosmic-gold">✓</span>
              <span>All transactions are secure and encrypted</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cosmic-gold">✓</span>
              <span>Credits never expire</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Payment Modal */}
      {selectedPackage && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          packageType={selectedPackage}
          blockchain={selectedBlockchain}
          token={selectedToken}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
