import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { PaymentIntent, PaymentStatus, Transaction } from '@/types/payment';
import { Blockchain } from '@/types';

interface UsePaymentReturn {
  paymentIntent: PaymentIntent | null;
  status: PaymentStatus;
  error: string | null;
  transaction: Transaction | null;
  createPayment: (packageType: string, blockchain: Blockchain, token: string) => Promise<void>;
  cancelPayment: () => void;
  verifyTransaction: (txHash: string) => Promise<void>;
  resetPayment: () => void;
}

export function usePayment(): UsePaymentReturn {
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Clear polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const createPayment = useCallback(async (
    packageType: string,
    blockchain: Blockchain,
    token: string
  ) => {
    try {
      setStatus('creating');
      setError(null);

      const response = await apiClient.createPaymentIntent(packageType, blockchain, token);
      setPaymentIntent(response);
      setStatus('waiting');

      // Start polling for payment status
      startPolling(response.id);
    } catch (err: any) {
      console.error('Error creating payment:', err);
      setError(err?.response?.data?.error?.message || 'Failed to create payment');
      setStatus('failed');
    }
  }, []);

  const startPolling = useCallback((paymentId: string) => {
    const interval = setInterval(async () => {
      try {
        const txn = await apiClient.getPaymentStatus(paymentId);
        setTransaction(txn);

        if (txn.status === 'confirming') {
          setStatus('processing');
        } else if (txn.status === 'completed') {
          setStatus('success');
          if (pollInterval) clearInterval(pollInterval);
          setPollInterval(null);
        } else if (txn.status === 'failed') {
          setStatus('failed');
          setError('Payment verification failed');
          if (pollInterval) clearInterval(pollInterval);
          setPollInterval(null);
        } else if (txn.status === 'expired') {
          setStatus('expired');
          setError('Payment expired');
          if (pollInterval) clearInterval(pollInterval);
          setPollInterval(null);
        }
      } catch (err: any) {
        console.error('Error polling payment status:', err);
        // Don't stop polling on error, just log it
      }
    }, 2000); // Poll every 2 seconds

    setPollInterval(interval);
  }, [pollInterval]);

  const cancelPayment = useCallback(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    setPaymentIntent(null);
    setStatus('idle');
    setError(null);
    setTransaction(null);
  }, [pollInterval]);

  const verifyTransaction = useCallback(async (txHash: string) => {
    if (!paymentIntent) {
      setError('No payment intent found');
      return;
    }

    try {
      setStatus('processing');
      setError(null);

      const txn = await apiClient.verifyTransaction(paymentIntent.id, txHash);
      setTransaction(txn);

      if (txn.status === 'completed') {
        setStatus('success');
      } else if (txn.status === 'confirming') {
        setStatus('processing');
        // Start polling for confirmation
        startPolling(paymentIntent.id);
      } else if (txn.status === 'failed') {
        setStatus('failed');
        setError('Transaction verification failed');
      }
    } catch (err: any) {
      console.error('Error verifying transaction:', err);
      setError(err?.response?.data?.error?.message || 'Failed to verify transaction');
      setStatus('failed');
    }
  }, [paymentIntent, startPolling]);

  const resetPayment = useCallback(() => {
    cancelPayment();
  }, [cancelPayment]);

  return {
    paymentIntent,
    status,
    error,
    transaction,
    createPayment,
    cancelPayment,
    verifyTransaction,
    resetPayment,
  };
}
