import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LamaranApp from './components/lamaran/LamaranApp';
import FinanceApp from './components/finance/FinanceApp';
import InterviewApp from './components/interview/InterviewApp';
import CaposApp from './components/capos/CaposApp';
import Login from './components/Login';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('lamaran');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Memuat aplikasi...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={logout} 
        user={user} 
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-slate-950">
        {activeTab === 'lamaran' && <LamaranApp />}
        {activeTab === 'finance' && <FinanceApp />}
        {activeTab === 'interview' && <InterviewApp />}
        {activeTab === 'capos' && <CaposApp />}
      </main>
    </div>
  );
}
