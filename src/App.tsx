import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Layout } from './components/Layout';
import { useAppState } from './state/store';
import { Landing } from './pages/Landing';
import { NewClientChat } from './pages/NewClientChat';
import { MyPlan } from './pages/MyPlan';
import { TalkConsent, TalkDetails, TalkConfirmed } from './pages/Talk';
import { SignIn } from './pages/SignIn';
import { Dashboard } from './pages/Dashboard';
import { ClientChat } from './pages/ClientChat';
import { AskAdviser } from './pages/AskAdviser';
import { Staff } from './pages/Staff';

function RequireSignIn({ children }: { children: ReactNode }) {
  const signedIn = useAppState((s) => s.signedIn);
  return signedIn ? children : <Navigate to="/signin" replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          {/* Flow 1: new client, anonymous */}
          <Route index element={<Landing />} />
          <Route path="chat" element={<NewClientChat />} />
          <Route path="plan" element={<MyPlan />} />
          <Route path="talk" element={<TalkConsent />} />
          <Route path="talk/details" element={<TalkDetails />} />
          <Route path="talk/confirmed" element={<TalkConfirmed />} />
          {/* Flow 2: existing client */}
          <Route path="signin" element={<SignIn />} />
          <Route path="dashboard" element={<RequireSignIn><Dashboard /></RequireSignIn>} />
          <Route path="client-chat" element={<RequireSignIn><ClientChat /></RequireSignIn>} />
          <Route path="ask-adviser" element={<RequireSignIn><AskAdviser /></RequireSignIn>} />
          {/* $RUs staff: engagement measures and monitoring log */}
          <Route path="staff" element={<Staff />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
