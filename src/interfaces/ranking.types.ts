/**
 * ranking.types.ts
 * กำหนดโครงสร้างข้อมูล, Tiers, Score Thresholds และ Icons สำหรับระบบจัดอันดับ (Leaderboard & Ranking System)
 * Project: x2o-league
 * Zberus Tech Co, Ltd.
 */

export type RankTierId = 
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master';

export interface RankTier {
  id: RankTierId;
  nameTh: string;
  nameEn: string;
  minPoints: number;
  maxPoints: number | null; // null สำหรับ Master (ไม่จำกัดเพดานคะแนนสูงสุด)
  badgeColor: string; // Tailwind color class สำหรับ badge หรือ background
  textColor: string; // Tailwind text color
  borderColor: string; // Tailwind border color
  iconName: string; // ชื่อไอคอนสำหรับใช้กับ SVG / Icon mapping (เช่น 'bronze-shield', 'silver-shield', etc.)
  description: string;
}

/**
  * รายการ Tiers ทั้งหมดในระบบ x2o-league พร้อมเกณฑ์คะแนน (Score Thresholds)
  */
export const RANK_TIERS: Record<RankTierId, RankTier> = {
  bronze: {
    id: 'bronze',
    nameTh: 'บรอนซ์ (Bronze)',
    nameEn: 'Bronze',
    minPoints: 0,
    maxPoints: 99,
    badgeColor: 'bg-amber-700/20',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-700/40',
    iconName: 'bronze-shield',
    description: 'ระดับเริ่มต้นสำหรับผู้เล่นใหม่ที่เพิ่งเข้าสู่สนามประลอง X2O League',
  },
  silver: {
    id: 'silver',
    nameTh: 'ซิลเวอร์ (Silver)',
    nameEn: 'Silver',
    minPoints: 100,
    maxPoints: 299,
    badgeColor: 'bg-slate-300/20',
    textColor: 'text-slate-400',
    borderColor: 'border-slate-400/40',
    iconName: 'silver-shield',
    description: 'ระดับพัฒนาฝีมือ ผู้เล่นเริ่มเข้าใจเทคนิคและกลยุทธ์การวางหมาก',
  },
  gold: {
    id: 'gold',
    nameTh: 'โกลด์ (Gold)',
    nameEn: 'Gold',
    minPoints: 300,
    maxPoints: 599,
    badgeColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/40',
    iconName: 'gold-shield',
    description: 'ระดับผู้ชำนาญการ มีความแม่นยำและเฉียบคมในการตัดสินใจ',
  },
  platinum: {
    id: 'platinum',
    nameTh: 'แพลตินัม (Platinum)',
    nameEn: 'Platinum',
    minPoints: 600,
    maxPoints: 999,
    badgeColor: 'bg-teal-500/20',
    textColor: 'text-teal-400',
    borderColor: 'border-teal-500/40',
    iconName: 'platinum-shield',
    description: 'ระดับยอดฝีมือชั้นแนวหน้า โดดเด่นทั้งเกมรุกและเกมรับ',
  },
  diamond: {
    id: 'diamond',
    nameTh: 'ไดมอนด์ (Diamond)',
    nameEn: 'Diamond',
    minPoints: 1000,
    maxPoints: 1499,
    badgeColor: 'bg-cyan-400/20',
    textColor: 'text-cyan-300',
    borderColor: 'border-cyan-400/50',
    iconName: 'diamond-shield',
    description: 'ระดับเซียนผู้ไร้เทียมทาน มีสถิติการแข่งขันที่ยอดเยี่ยม',
  },
  master: {
    id: 'master',
    nameTh: 'มาสเตอร์ (Master)',
    nameEn: 'Master',
    minPoints: 1500,
    maxPoints: null,
    badgeColor: 'bg-purple-600/20',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/60',
    iconName: 'master-crown',
    description: 'ระดับสูงสุดในตำนาน จักรพรรดิแห่งสนามประลอง X2O League',
  },
};

/**
 * ฟังก์ชันช่วยคำนวณและดึงข้อมูล Tier ของผู้เล่นจากคะแนนสะสม (rankPoints)
 */
export function getPlayerTier(rankPoints: number): RankTier {
  const points = Math.max(0, rankPoints || 0);
  
  if (points >= 1500) return RANK_TIERS.master;
  if (points >= 1000) return RANK_TIERS.diamond;
  if (points >= 600) return RANK_TIERS.platinum;
  if (points >= 300) return RANK_TIERS.gold;
  if (points >= 100) return RANK_TIERS.silver;
  return RANK_TIERS.bronze;
}

/**
 * Interface สำหรับข้อมูล Ranking ในตาราง Leaderboard
 */
export interface LeaderboardUserEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  rankPoints: number;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  tier: RankTier;
  rankPosition?: number;
}
