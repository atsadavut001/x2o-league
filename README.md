# x2o-league - Real-time 2-Player Online PvP Tic-Tac-Toe

ยินดีต้อนรับสู่ **x2o-league** แพลตฟอร์มเกม Tic-Tac-Toe ระดับโปรดักชันที่รองรับโหมดผู้เล่นเดี่ยว (Vs Bot) โหมดเล่นในเครื่อง (Local 2-Player) และโหมดแข่งขันออนไลน์แบบเรียลไทม์ (Real-Time 2-Player Online PvP) ขับเคลื่อนด้วยสถาปัตยกรรม React 19, TypeScript, Tailwind CSS และ Firebase Firestore (`x2o-database`)

---

## 🌟 ฟีเจอร์เด่นของระบบออนไลน์ (Online PvP Features)

1. **Quick Matchmaking**: ระบบจับคู่อัตโนมัติ ค้นหาห้องที่รอผู้เล่นคนที่ 2 อยู่ หรือสร้างห้องใหม่ให้ทันทีโดยอัตโนมัติ
2. **Private Room (รหัสห้อง 6 หลัก)**: ระบบสร้างห้องส่วนตัวและเข้าร่วมการแข่งขันด้วยรหัส 6 หลัก (Room Code) เพื่อเล่นกับเพื่อนได้ทันที
3. **Real-time Synchronization**: ซิงค์สถานะกระดาน เทิร์นการเดิน และคะแนนแบบเรียลไทม์ด้วย Firebase Firestore `onSnapshot` พร้อมรับประกันความปลอดภัยด้วย `runTransaction` ป้องกันการเดินซ้ำซ้อนหรือแย่งเทิร์น
4. **Turn Validation & 30s Timer**: ระบบตรวจสอบสิทธิ์ความเป็นเจ้าของตาเดิน (Player X / O) และจำกัดเวลาต่อเทิร์น
5. **Best of 3 Rounds & Match Score**: ระบบตัดสินการแข่งขันแบบ 3 ใน 2 รอบ พร้อมแสดงถ้วยรางวัลผู้ชนะแมตช์
6. **Rank Points & Leaderboard**: ระบบคำนวณแต้ม Ranking (ชนะ +2 แต้ม, แพ้ -1 แต้ม, เสมอ 0 แต้ม) อัปเดตสถิติ wins / losses / draws ลงใน collection `users` และแสดงผลบนกระดานผู้นำ (Leaderboard)
7. **Rematch & Graceful Exit**: ระบบขอรีแมตช์เมื่อจบการแข่งขัน และปุ่มออกจากห้องหรือยอมแพ้อย่างปลอดภัย

---

## 🛠️ โครงสร้างสถาปัตยกรรมระบบออนไลน์ (Architecture & Files)

- **`src/interfaces/online.types.ts`**: TypeScript Interfaces สำหรับโครงสร้างห้อง (`Room`), ผู้เล่น (`PlayerInfo`), สถานะกระดาน (`BoardState`), และประวัติการเดินหมาก
- **`src/services/onlineGameService.ts`**: Core Service สำหรับจัดการ Firebase Firestore Transactions (`createRoom`, `joinRoom`, `quickMatch`, `makeMove`, `rematch`, `leaveRoom`)
- **`src/components/games/online/OnlineLobby.tsx`**: หน้า Lobby สำหรับเลือกสร้างห้อง, กรอกรหัสห้อง 6 หลัก, หรือกดค้นหาคู่แข่งอัตโนมัติ (Quick Match)
- **`src/components/games/online/OnlineBoard.tsx`**: หน้ากระดานแข่งขันออนไลน์ แสดงโปรไฟล์ผู้เล่น X vs O, สถานะเทิร์น, ตัวนับเวลา, ปุ่มคัดลอกรหัสห้อง, และหน้าต่างสรุปผล/รีแมตช์

---

## ⚙️ คู่มือการติดตั้งและใช้งาน (Getting Started & Setup)

### 1. การติดตั้งโปรเจกต์
โคลนโปรเจกต์และติดตั้งแพ็กเกจด้วย npm:
```bash
npm install
```

### 2. การตั้งค่า Environment Variables
ตรวจสอบไฟล์ `.env.dev` หรือกำหนดค่า Firebase Configuration ใน `src/config/firebase.ts` ให้ถูกต้อง:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTHDOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=x2o-database
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. การรันเซิร์ฟเวอร์พัฒนา (Development)
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:5173` เพื่อเข้าสู่หน้าแดชบอร์ดของเกม

---

## 📖 วิธีการเข้าใช้งานโหมด Online PvP
1. **เข้าสู่ระบบ (Authentication)**: ล็อกอินเข้าสู่ระบบด้วยบัญชีผู้ใช้ของคุณเพื่อบันทึกสถิติและแต้ม Rank
2. **เลือกโหมด Online PvP**: จากหน้า Dashboard คลิกที่ปุ่ม **"Online PvP"**
3. **เลือกวิธีการเข้าเล่นใน Lobby**:
   - **Quick Match**: กดปุ่มค้นหาคู่แข่ง ระบบจะสุ่มจับคู่กับผู้เล่นท่านอื่นที่กำลังรออยู่
   - **Create Room**: สร้างห้องส่วนตัวเพื่อรับ **Room Code 6 หลัก** แล้วส่งให้เพื่อน
   - **Join by Room Code**: กรอกรหัสห้อง 6 หลักของเพื่อนเพื่อเข้าร่วมห้องแข่งขัน
4. **เริ่มการแข่งขัน**: 
   - ผู้เล่น X (เจ้าของห้อง) เป็นฝ่ายเริ่มเดินก่อน สลับกับผู้เล่น O
   - แข่งขันชนะให้ครบ 2 ใน 3 รอบเพื่อคว้าแชมป์ประจำแมตช์และรับ Rank Points!
