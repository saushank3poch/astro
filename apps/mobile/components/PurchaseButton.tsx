import React from 'react';
import { Button } from './Button';

interface PurchaseButtonProps {
  productId: string;
  title: string;
  onPurchase: (productId: string) => void;
  loading?: boolean;
}

export function PurchaseButton({
  productId,
  title,
  onPurchase,
  loading,
}: PurchaseButtonProps) {
  return (
    <Button
      title={title}
      onPress={() => onPurchase(productId)}
      loading={loading}
      variant="primary"
    />
  );
}
