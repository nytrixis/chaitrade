"use client";

import { useEffect, useState } from 'react';
import { formatDateTime, formatRelativeTime } from '@/lib/utils/format';
import { ACTIVITY_ICONS } from '@/lib/utils/constants';

export interface Activity {
  id: string;
  action_type: string;
  description: string;
  actor_wallet?: string;
  tx_hash?: string;
  created_at: string;
  metadata?: any;
}

export interface ActivityTimelineProps {
  invoiceId: number;
  activities?: Activity[];
  className?: string;
}

export function ActivityTimeline({ invoiceId, activities = [], className = '' }: ActivityTimelineProps) {
  const [timelineActivities, setTimelineActivities] = useState<Activity[]>(activities);

  // In production, fetch activities from database
  useEffect(() => {
    // Mock activities for demo
    if (activities.length === 0) {
      const mockActivities: Activity[] = [
        {
          id: '1',
          action_type: 'invoice_created',
          description: 'Invoice uploaded and minted as NFT',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          metadata: { nft_id: invoiceId },
        },
        {
          id: '2',
          action_type: 'funding_received',
          description: 'First investment received',
          actor_wallet: '0x8f3a9d2c1b4e5f6a7d8c9b0a1f2e3d4c5b6a7d8c',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          metadata: { amount: 50000 },
        },
      ];
      setTimelineActivities(mockActivities);
    }
  }, [invoiceId, activities]);

  const getActivityIcon = (actionType: string): string => {
    return ACTIVITY_ICONS[actionType as keyof typeof ACTIVITY_ICONS] || '📌';
  };

  const getActivityColor = (actionType: string): string => {
    switch (actionType) {
      case 'invoice_created':
        return 'border-blue-500 bg-blue-500/20';
      case 'funding_received':
        return 'border-sage-green-500 bg-sage-green-500/20';
      case 'fully_funded':
        return 'border-purple-500 bg-purple-500/20';
      case 'settlement_triggered':
        return 'border-yellow-500 bg-yellow-500/20';
      case 'invoice_settled':
        return 'border-sage-green-500 bg-sage-green-500/20';
      case 'default':
        return 'border-red-500 bg-red-500/20';
      default:
        return 'border-medium-gray bg-medium-gray/20';
    }
  };

  if (timelineActivities.length === 0) {
    return (
      <div className={`card ${className}`}>
        <h3 className="text-xl font-bold text-off-white mb-4">Activity Timeline</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-light-gray">No activity yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <h3 className="text-xl font-bold text-off-white mb-6">Activity Timeline</h3>

      <div className="space-y-6">
        {timelineActivities.map((activity, index) => (
          <div key={activity.id} className="flex gap-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              {/* Icon Circle */}
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getActivityColor(activity.action_type)}`}>
                <span className="text-lg">{getActivityIcon(activity.action_type)}</span>
              </div>

              {/* Connecting Line */}
              {index < timelineActivities.length - 1 && (
                <div className="w-0.5 h-full min-h-[40px] bg-medium-gray/30 mt-2"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              {/* Title */}
              <div className="font-semibold text-off-white mb-1">
                {activity.description}
              </div>

              {/* Time */}
              <div className="text-sm text-light-gray mb-2">
                {formatRelativeTime(activity.created_at)}
                <span className="text-xs text-light-gray/50 ml-2">
                  {formatDateTime(activity.created_at)}
                </span>
              </div>

              {/* Actor */}
              {activity.actor_wallet && (
                <div className="text-xs text-light-gray mb-2">
                  By: <span className="font-mono">{activity.actor_wallet.slice(0, 6)}...{activity.actor_wallet.slice(-4)}</span>
                </div>
              )}

              {/* Metadata */}
              {activity.metadata && (
                <div className="bg-dark-gray/50 rounded-lg p-3 text-xs space-y-1">
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-light-gray capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-off-white font-semibold">
                        {typeof value === 'number' && key.includes('amount')
                          ? `₹${value.toLocaleString()}`
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Transaction Hash */}
              {activity.tx_hash && (
                <a
                  href={`https://testnet.snowtrace.io/tx/${activity.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sage-green-500 hover:text-sage-green-400 mt-2 inline-block"
                >
                  View transaction →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More (if needed) */}
      {timelineActivities.length > 10 && (
        <button className="btn-secondary w-full mt-4">
          Load More Activity
        </button>
      )}
    </div>
  );
}

/**
 * Compact version for sidebar
 */
export function ActivityTimelineCompact({ invoiceId, limit = 5 }: { invoiceId: number; limit?: number }) {
  return (
    <div className="card">
      <h4 className="text-lg font-bold text-off-white mb-4">Recent Activity</h4>
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-2 bg-dark-gray/30 rounded-lg">
          <span className="text-xl">📄</span>
          <div className="flex-1 text-sm">
            <p className="text-off-white font-medium">Invoice Created</p>
            <p className="text-xs text-light-gray">2 hours ago</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-2 bg-dark-gray/30 rounded-lg">
          <span className="text-xl">💰</span>
          <div className="flex-1 text-sm">
            <p className="text-off-white font-medium">Funding Received</p>
            <p className="text-xs text-light-gray">1 hour ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
