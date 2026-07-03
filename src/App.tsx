import { useEffect, useState } from 'react';
import { auth, db, googleProvider } from './config/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// CSS
import './App.css'

// Views
import Header from './layouts/Header';
import Footer from './layouts/Footer';
import Auth from './components/auth/Auth';
import Dashboard from './components/main/Dashboard';
import BotGame from './components/games/bot-game/BotGame';
import Leaderboard from './components/games/leaderboard/Leaderboard';

// Interface
import { UserProfile } from './interfaces/UserProfile.interface';

function App() {

  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        let profile: UserProfile;

        if (userSnap.exists()) {
          profile = userSnap.data() as UserProfile;
        } else {
          profile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Player',
            photoURL: firebaseUser.photoURL || '',
            rankPoints: 20,
            totalGames: 0,
            wins: 0,
            winsBotCount: 0,
            losses: 0,
            draws: 0,
          };
          await setDoc(userRef, profile);
        }
        setUser(profile);
        if (location.pathname === '/login') {
          navigate('/');
        }
      } else {
        setUser(null);
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#05060f] text-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!user && location.pathname === '/login') {
    return (
      <Auth onLogin={handleLogin} />
    );
  }

  return (
    <div className="min-h-screen bg-[#05060f] text-slate-100 flex flex-col font-sans overflow-hidden">
      <Header user={user} onLogout={() => auth.signOut()} />
      <main className="flex-1 flex flex-col p-4 sm:p-8 w-full max-w-6xl mx-auto overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/game/bot" element={<BotGame user={user} onComplete={() => navigate('/')} />} />
          <Route path="/leaderboard" element={<Leaderboard onComplete={() => navigate('/')} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );

}

export default App
