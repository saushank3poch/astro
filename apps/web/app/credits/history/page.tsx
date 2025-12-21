'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Transaction } from '@/types/payment';
import { apiClient } from '@/lib/api';

export default function TransactionHistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchTransactions();
  }, [isAuthenticated, router]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTransactions({
        limit: 100,
        offset: 0,
      });
      setTransactions(response.data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    if (filter === 'all') return true;
    return txn.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const configs = {
      completed: {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/30',
        label: 'Completed',
      },
      pending: {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        label: 'Pending',
      },
      confirming: {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        label: 'Confirming',
      },
      failed: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/30',
        label: 'Failed',
      },
      expired: {
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
        label: 'Expired',
      },
    };

    const config = configs[status as keyof typeof configs] || configs.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const getExplorerUrl = (blockchain: string, txHash: string) => {
    const explorers = {
      solana: `https://solscan.io/tx/${txHash}`,
      ethereum: `https://etherscan.io/tx/${txHash}`,
      base: `https://basescan.org/tx/${txHash}`,
    };
    return explorers[blockchain as keyof typeof explorers] || '#';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-cosmic-deep py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-cosmic-gold via-cosmic-violet to-cosmic-cyan bg-clip-text text-transparent mb-2"
          >
            Transaction History
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-cosmic-silver/70"
          >
            View all your credit purchases and payments
          </motion.p>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Filter */}
          <div className="flex gap-2">
            {(['all', 'completed', 'pending', 'failed'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === filterOption
                    ? 'bg-cosmic-violet text-white'
                    : 'glass text-cosmic-silver/70 hover:text-cosmic-silver'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>

          {/* Purchase Button */}
          <Link href="/credits/purchase">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cosmic-gold to-yellow-600 text-cosmic-deep font-semibold"
            >
              Purchase Credits
            </motion.button>
          </Link>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-cosmic-silver/60 mt-4">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 glass rounded-xl border border-cosmic-violet/30"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-cosmic-silver mb-2">
              No Transactions Found
            </h3>
            <p className="text-cosmic-silver/60 mb-6">
              {filter === 'all'
                ? "You haven't made any purchases yet."
                : `No ${filter} transactions found.`}
            </p>
            <Link href="/credits/purchase">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cosmic-gold to-yellow-600 text-cosmic-deep font-semibold"
              >
                Purchase Credits
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl border border-cosmic-violet/30 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cosmic-violet/10 border-b border-cosmic-violet/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cosmic-silver/80 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cosmic-silver/80 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cosmic-silver/80 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cosmic-silver/80 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cosmic-silver/80 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cosmic-silver/80 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cosmic-silver/80 uppercase tracking-wider">
                      Transaction
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cosmic-violet/20">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-cosmic-violet/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cosmic-silver">
                        {formatDate(txn.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cosmic-silver font-medium">
                        {txn.packageType || 'Credit Package'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-cosmic-silver">
                        {txn.amount} {txn.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-cosmic-silver/80">
                            {txn.blockchain?.charAt(0).toUpperCase() + txn.blockchain?.slice(1) || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(txn.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="text-cosmic-gold font-semibold">
                          {txn.creditsGranted || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {txn.transactionHash ? (
                          <a
                            href={getExplorerUrl(txn.blockchain || '', txn.transactionHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cosmic-violet hover:text-cosmic-indigo underline"
                          >
                            View →
                          </a>
                        ) : (
                          <span className="text-cosmic-silver/40">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
