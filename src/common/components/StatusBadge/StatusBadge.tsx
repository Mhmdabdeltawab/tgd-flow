import React from 'react';
import { StatusType } from '../../types';

type StatusStyle = {
  bg: string;
  text: string;
  ring: string;
};

const getStatusStyles = (status: string): StatusStyle => {
  // Contract statuses
  if (status === 'opened') return { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-600/20' };
  if (status === 'pending') return { bg: 'bg-yellow-50', text: 'text-yellow-700', ring: 'ring-yellow-600/20' };
  if (status === 'closed') return { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-600/20' };

  // Contract types
  if (status === 'Supply') return { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-600/20' };
  if (status === 'Sales') return { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-600/20' };

  // Shipment statuses
  if (status === 'in_transit') return { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-600/20' };
  if (status === 'delivered') return { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-600/20' };
  if (status === 'received') return { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-600/20' };
  if (status === 'cancelled') return { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-600/20' };
  if (status === 'scheduled') return { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-600/20' };

  // Default style
  return { bg: 'bg-gray-50', text: 'text-gray-700', ring: 'ring-gray-600/20' };
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const styles = getStatusStyles(status);

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-sm'}
        rounded-full font-medium ring-1 ring-inset
        ${styles.bg} ${styles.text} ${styles.ring}
      `}
    >
      {formatStatus(status)}
    </span>
  );
}