import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-card-bg border border-card-border',
    glass: 'glass',
    glow: 'bg-card-bg border border-card-border animate-pulse-glow',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`rounded-lg ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ children, className = '', ...props }: CardTitleProps) {
  return (
    <h3 className={`text-xl font-bold text-foreground ${className}`} {...props}>
      {children}
    </h3>
  );
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ children, className = '', ...props }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-cosmic-silver/70 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-cosmic-violet/20 ${className}`} {...props}>
      {children}
    </div>
  );
}
