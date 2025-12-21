'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Blockchain } from '@/types';
import { BLOCKCHAIN_TOKENS, BlockchainToken } from '@/types/payment';

interface BlockchainSelectorProps {
  selectedBlockchain: Blockchain;
  selectedToken: string;
  onBlockchainChange: (blockchain: Blockchain) => void;
  onTokenChange: (token: string) => void;
}

export function BlockchainSelector({
  selectedBlockchain,
  selectedToken,
  onBlockchainChange,
  onTokenChange,
}: BlockchainSelectorProps) {
  const blockchains: { value: Blockchain; label: string; icon: string }[] = [
    { value: 'solana', label: 'Solana', icon: '◎' },
    { value: 'ethereum', label: 'Ethereum', icon: 'Ξ' },
    { value: 'base', label: 'Base', icon: '🔵' },
  ];

  const tokens = BLOCKCHAIN_TOKENS[selectedBlockchain];

  return (
    <div className="space-y-4">
      {/* Blockchain Selection */}
      <div>
        <label className="block text-sm font-medium text-cosmic-silver/80 mb-2">
          Select Blockchain
        </label>
        <div className="grid grid-cols-3 gap-3">
          {blockchains.map((blockchain) => (
            <motion.button
              key={blockchain.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onBlockchainChange(blockchain.value);
                // Reset to first token when blockchain changes
                const firstToken = BLOCKCHAIN_TOKENS[blockchain.value][0];
                onTokenChange(firstToken.symbol);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedBlockchain === blockchain.value
                  ? 'border-cosmic-gold bg-cosmic-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  : 'border-cosmic-violet/30 glass hover:border-cosmic-violet/50'
              }`}
            >
              <div className="text-3xl mb-1">{blockchain.icon}</div>
              <div className={`text-sm font-semibold ${
                selectedBlockchain === blockchain.value
                  ? 'text-cosmic-gold'
                  : 'text-cosmic-silver/80'
              }`}>
                {blockchain.label}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Token Selection */}
      <div>
        <label className="block text-sm font-medium text-cosmic-silver/80 mb-2">
          Select Token
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {tokens.map((token) => (
            <motion.button
              key={token.symbol}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTokenChange(token.symbol)}
              className={`p-3 rounded-lg border transition-all ${
                selectedToken === token.symbol
                  ? 'border-cosmic-violet bg-cosmic-violet/20'
                  : 'border-cosmic-violet/30 glass hover:border-cosmic-violet/50'
              }`}
            >
              <div className={`text-lg font-bold ${
                selectedToken === token.symbol
                  ? 'text-cosmic-violet'
                  : 'text-cosmic-silver/80'
              }`}>
                {token.symbol}
              </div>
              <div className="text-xs text-cosmic-silver/60">
                {token.name}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
