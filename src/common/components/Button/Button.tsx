import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export default function Button({
  variant = 'ghost',
  icon: Icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2';
  
  const variants = {
    primary: 'px-4 py-2 text-white bg-gray-900 rounded-lg hover:bg-gray-800',
    secondary: 'px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100',
    ghost: 'text-gray-500 hover:text-gray-700',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}