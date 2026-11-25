/**
 * RankBadge.tsx
 * UI Component สำหรับแสดงไอคอนตราสัญลักษณ์ระดับ (Rank Tier Badge & Shield) 
 * รองรับ Dark/Light mode, Interactive Tooltip/Card และ Responsive Sizing
 * Project: x2o-league
 * Zberus Tech Co, Ltd.
 */

import React from 'react';
import { RankTier, RankTierId, RANK_TIERS, getPlayerTier } from '../../../interfaces/ranking.types';

export interface RankBadgeProps {
  /** คะแนนของผู้เล่น (ถ้าระบุ ระบบจะคำนวณ Tier อัตโนมัติ) */
  points?: number;
  /** หรือระบุ TierId โดยตรง */
  tierId?: RankTierId;
  /** ขนาดของ Badge: 'sm' | 'md' | 'lg' | 'xl' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** รูปแบบการแสดงผล: 'badge' (ป้ายชื่อ+ไอคอน), 'shield' (โล่ไอคอนอย่างเดียว), 'card' (การ์ดรายละเอียดเต็ม) */
  variant?: 'badge' | 'shield' | 'card';
  /** แสดงชื่อ Tier ด้วยหรือไม่ (สำหรับแบบ shield) */
  showName?: boolean;
  /** Custom CSS Class เพิ่มเติม */
  className?: string;
  /** Callback เมื่อคลิกที่ Badge */
  onClick?: () => void;
}

/**
 * SVG Shield / Crown Component แยกตาม Tier พร้อมดีไซน์พรีเมียมรองรับ Dark/Light Mode
 */
const RankTierIcon: React.FC<{ tierId: RankTierId; className?: string }> = ({ tierId, className = 'w-6 h-6' }) => {
  switch (tierId) {
    case 'bronze':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 5V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V5L12 2Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 7L14.5 10.5H12V14.5L9.5 11H12V7Z" fill="currentColor"/>
          <path d="M9 17H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'silver':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 5V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V5L12 2Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 11L12 7L16 11L12 17L8 11Z" fill="currentColor" fillOpacity="0.7"/>
          <circle cx="12" cy="11" r="2" fill="currentColor"/>
        </svg>
      );
    case 'gold':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 5V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V5L12 2Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 6L15 10L13 16H11L9 10L12 6Z" fill="currentColor"/>
          <path d="M7 13L12 19L17 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'platinum':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 5V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V5L12 2Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 5L17 11L12 19L7 11L12 5Z" fill="currentColor" fillOpacity="0.85"/>
          <circle cx="12" cy="11" r="3" fill="white" fillOpacity="0.95"/>
        </svg>
      );
    case 'diamond':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 5V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V5L12 2Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 9H18L12 19L6 9Z" fill="currentColor" fillOpacity="0.75"/>
          <path d="M9 9L12 4L15 9H9Z" fill="currentColor"/>
          <circle cx="12" cy="11" r="1.5" fill="white"/>
        </svg>
      );
    case 'master':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 5V11C4 16.55 7.42 21.74 12 23C16.58 21.74 20 16.55 20 11V5L12 2Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 8L8 12L12 6L16 12L19 8L17 16H7L5 8Z" fill="currentColor"/>
          <circle cx="12" cy="12" r="2.5" fill="white"/>
        </svg>
      );
    default:
      return null;
  }
};

export const RankBadge: React.FC<RankBadgeProps> = ({
  points,
  tierId,
  size = 'md',
  variant = 'badge',
  showName = true,
  className = '',
  onClick,
}) => {
  // Determine Tier object
  let tier: RankTier;
  if (tierId && RANK_TIERS[tierId]) {
    tier = RANK_TIERS[tierId];
  } else if (typeof points === 'number') {
    tier = getPlayerTier(points);
  } else {
    tier = RANK_TIERS.bronze;
  }

  // Size mapping configuration (Responsive & Scalable)
  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      text: 'text-xs',
      padding: 'px-2 py-0.5',
      gap: 'gap-1.5',
      shieldSize: 'w-6 h-6',
    },
    md: {
      icon: 'w-5 h-5',
      text: 'text-sm font-medium',
      padding: 'px-3 py-1',
      gap: 'gap-2',
      shieldSize: 'w-8 h-8',
    },
    lg: {
      icon: 'w-7 h-7',
      text: 'text-base font-semibold',
      padding: 'px-4 py-1.5',
      gap: 'gap-2.5',
      shieldSize: 'w-12 h-12',
    },
    xl: {
      icon: 'w-10 h-10',
      text: 'text-lg font-bold',
      padding: 'px-5 py-2.5',
      gap: 'gap-3',
      shieldSize: 'w-16 h-16',
    },
  };

  const currentSize = sizeConfig[size];

  // 1. Variant: Shield Only (with optional name below)
  if (variant === 'shield') {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex flex-col items-center justify-center ${onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''} ${className}`}
        title={`${tier.nameTh} (${tier.minPoints}${tier.maxPoints ? ` - ${tier.maxPoints}` : '+'} pts)`}
      >
        <div className={`flex items-center justify-center rounded-xl p-2 ${tier.badgeColor} border ${tier.borderColor} shadow-sm backdrop-blur-sm ${currentSize.shieldSize}`}>
          <RankTierIcon tierId={tier.id} className={currentSize.icon} />
        </div>
        {showName && (
          <span className={`mt-1 font-semibold ${tier.textColor} ${size === 'sm' ? 'text-[10px]' : 'text-xs'} tracking-wide`}>
            {tier.nameEn}
          </span>
        )}
      </div>
    );
  }

  // 2. Variant: Card (Full details card for profile or leaderboard header)
  if (variant === 'card') {
    const nextMilestone = tier.maxPoints !== null ? tier.maxPoints + 1 : tier.minPoints;
    const progressPercent = typeof points === 'number' && tier.maxPoints !== null
      ? Math.min(100, Math.max(5, ((points - tier.minPoints) / ((tier.maxPoints - tier.minPoints) || 1)) * 100))
      : 100;

    return (
      <div
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl border ${tier.borderColor} ${tier.badgeColor} p-5 backdrop-blur-md shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-xl hover:border-opacity-80 hover:scale-[1.01]' : ''} ${className}`}
      >
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <RankTierIcon tierId={tier.id} className="w-36 h-36" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className={`flex items-center justify-center rounded-2xl p-3.5 bg-slate-900/40 border ${tier.borderColor} shadow-inner ${currentSize.shieldSize}`}>
            <RankTierIcon tierId={tier.id} className={currentSize.icon} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold bg-slate-900/60 ${tier.textColor}`}>
                Tier Rank
              </span>
              {typeof points === 'number' && (
                <span className="text-xs text-slate-300 font-mono">
                  {points.toLocaleString()} pts
                </span>
              )}
            </div>
            <h3 className={`text-xl font-bold mt-1 ${tier.textColor}`}>
              {tier.nameTh}
            </h3>
            <p className="text-xs text-slate-300/80 mt-1 max-w-xs leading-relaxed">
              {tier.description}
            </p>
          </div>
        </div>
        {typeof points === 'number' && tier.maxPoints !== null && (
          <div className="mt-4 pt-3 border-t border-slate-700/30 relative z-10">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>ความคืบหน้าสู่ระดับถัดไป</span>
              <span className="font-mono">{points} / {nextMilestone} pts</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Default Variant: Badge (Inline Pill Badge)
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${currentSize.gap} ${currentSize.padding} rounded-full border ${tier.borderColor} ${tier.badgeColor} backdrop-blur-sm shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''} ${className}`}
      title={tier.description}
    >
      <RankTierIcon tierId={tier.id} className={currentSize.icon} />
      <span className={`${currentSize.text} ${tier.textColor} font-semibold tracking-wide whitespace-nowrap`}>
        {tier.nameTh}
      </span>
      {typeof points === 'number' && size !== 'sm' && (
        <span className="text-xs font-mono text-slate-400/90 pl-1 border-l border-slate-600/40">
          {points} pts
        </span>
      )}
    </div>
  );
};

export default RankBadge;
