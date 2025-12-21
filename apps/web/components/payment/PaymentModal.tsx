'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Blockchain } from '@/types';
import { usePayment } from '@/hooks/usePayment';
import { PaymentStatus } from './PaymentStatus';
import { QRCodeDisplay } from './QRCodeDisplay';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageType: string;
  blockchain: Blockchain;
  token: string;
  onSuccess?: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  packageType,
  blockchain,
  token,
  onSuccess,
}: PaymentModalProps) {
  const { paymentIntent, status, error, transaction, createPayment, cancelPayment, verifyTransaction, resetPayment } = usePayment();
  const [txHash, setTxHash] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  useEffect(() => {
    if (isOpen && !paymentIntent) {
      createPayment(packageType, blockchain, token);
    }
  }, [isOpen, packageType, blockchain, token]);

  useEffect(() => {
    if (status === 'success' && onSuccess) {
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 3000);
    }
  }, [status, onSuccess]);

  const handleClose = () => {
    resetPayment();
    setTxHash('');
    onClose();
  };

  const handleCancel = () => {
    cancelPayment();
    handleClose();
  };

  const handleVerify = async () => {
    if (txHash.trim()) {
      await verifyTransaction(txHash.trim());
    }
  };

  const handleCopyAddress = async () => {
    if (paymentIntent?.recipientAddress) {
      try {
        await navigator.clipboard.writeText(paymentIntent.recipientAddress);
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleCopyAmount = async () => {
    if (paymentIntent?.amountCrypto) {
      try {
        await navigator.clipboard.writeText(paymentIntent.amountCrypto.toString());
        setCopiedAmount(true);
        setTimeout(() => setCopiedAmount(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const isSolana = blockchain === 'solana';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass border border-cosmic-violet/50 rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-cosmic-violet/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-cosmic-gold">
                  Complete Payment
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-cosmic-silver/60 hover:text-cosmic-silver text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {status === 'creating' || status === 'idle' ? (
                <PaymentStatus status={status} />
              ) : status === 'success' ? (
                <PaymentStatus
                  status={status}
                  creditsGranted={transaction?.creditsGranted}
                />
              ) : status === 'failed' || status === 'expired' ? (
                <div>
                  <PaymentStatus status={status} error={error} />
                  <div className="mt-6 flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => createPayment(packageType, blockchain, token)}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-cosmic-gold to-yellow-600 text-cosmic-deep font-semibold"
                    >
                      Try Again
                    </motion.button>
                  </div>
                </div>
              ) : isSolana && paymentIntent?.qrCode ? (
                // Solana Payment Flow (QR Code)
                <div>
                  {status === 'processing' ? (
                    <PaymentStatus status={status} />
                  ) : (
                    <QRCodeDisplay
                      paymentUrl={paymentIntent.deepLink || paymentIntent.qrCode}
                      amount={paymentIntent.amountCrypto}
                      currency={paymentIntent.currency}
                      expiresAt={paymentIntent.expiresAt}
                      onExpired={() => {
                        cancelPayment();
                      }}
                    />
                  )}
                </div>
              ) : (
                // Ethereum/Base Payment Flow (Manual)
                <div className="space-y-6">
                  {status === 'processing' ? (
                    <PaymentStatus status={status} />
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <p className="text-lg text-cosmic-silver mb-2">
                          Send payment to the address below
                        </p>
                        <p className="text-sm text-cosmic-silver/60">
                          Network: {blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}
                        </p>
                      </div>

                      {/* Payment Address */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-cosmic-silver/80">
                          Payment Address
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={paymentIntent?.recipientAddress || ''}
                            className="flex-1 px-4 py-3 bg-cosmic-deep/50 border border-cosmic-violet/30 rounded-lg text-cosmic-silver font-mono text-sm"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopyAddress}
                            className="px-4 py-3 rounded-lg bg-cosmic-violet/30 hover:bg-cosmic-violet/50 text-cosmic-silver"
                          >
                            {copiedAddress ? '✓' : '📋'}
                          </motion.button>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-cosmic-silver/80">
                          Amount
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${paymentIntent?.amountCrypto || ''} ${token}`}
                            className="flex-1 px-4 py-3 bg-cosmic-deep/50 border border-cosmic-violet/30 rounded-lg text-cosmic-silver font-mono text-sm"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopyAmount}
                            className="px-4 py-3 rounded-lg bg-cosmic-violet/30 hover:bg-cosmic-violet/50 text-cosmic-silver"
                          >
                            {copiedAmount ? '✓' : '📋'}
                          </motion.button>
                        </div>
                      </div>

                      {/* Transaction Hash Input */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-cosmic-silver/80">
                          Transaction Hash
                        </label>
                        <input
                          type="text"
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                          placeholder="Enter transaction hash after sending payment"
                          className="w-full px-4 py-3 bg-cosmic-deep/50 border border-cosmic-violet/30 rounded-lg text-cosmic-silver placeholder-cosmic-silver/40 focus:outline-none focus:border-cosmic-violet"
                        />
                      </div>

                      {/* Verify Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleVerify}
                        disabled={!txHash.trim()}
                        className={`w-full py-4 rounded-lg font-semibold transition-all ${
                          txHash.trim()
                            ? 'bg-gradient-to-r from-cosmic-gold to-yellow-600 text-cosmic-deep shadow-lg'
                            : 'bg-cosmic-violet/20 text-cosmic-silver/40 cursor-not-allowed'
                        }`}
                      >
                        Verify Transaction
                      </motion.button>

                      {/* Warning */}
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm text-yellow-400">
                          ⚠️ Make sure to send the exact amount to the correct address. Double-check the network before sending.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {status !== 'success' && status !== 'creating' && (
              <div className="sticky bottom-0 glass border-t border-cosmic-violet/30 px-6 py-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="w-full py-3 rounded-lg bg-cosmic-violet/20 text-cosmic-silver hover:bg-cosmic-violet/30 transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
