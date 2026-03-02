import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Dashboard } from './components/Dashboard';
import { EntryForm } from './components/EntryForm';
import { ReportView } from './components/ReportView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { LayoutDashboard, PlusCircle, FileText, Landmark } from 'lucide-react';
import { getEntries, saveEntry, deleteEntry, type KPIEntry } from './lib/storage';
import { supabase } from './lib/supabase';
import { AuthLayout } from './components/auth/AuthLayout';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { OTPVerification } from './components/auth/OTPVerification';

type AuthStep = 'login' | 'signup' | 'otp';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [entries, setEntries] = useState<KPIEntry[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [pendingPhone, setPendingPhone] = useState('');

  useEffect(() => {
    // Initialize session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchEntries(session.user.id);
      setIsInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchEntries(session.user.id);
      else setEntries([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchEntries = async (userId: string) => {
    const data = await getEntries(userId);
    setEntries(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info('Logged out successfully');
  };

  const handleAddEntry = async (entry: Omit<KPIEntry, 'id' | 'created_at' | 'user_id'>) => {
    if (!session?.user) return;
    const newEntry = await saveEntry(entry, session.user.id);
    if (newEntry) {
      setEntries(prev => [newEntry, ...prev]);
      toast.success('Performance record saved successfully');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const success = await deleteEntry(id);
    if (success) {
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.info('Record deleted');
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Secure PMS...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        {authStep === 'login' && (
          <AuthLayout title="Welcome Back" subtitle="Log in to manage your performance data">
            <LoginForm 
              onSuccess={() => {}} 
              onSwitchToSignUp={() => setAuthStep('signup')} 
            />
          </AuthLayout>
        )}
        
        {authStep === 'signup' && (
          <AuthLayout title="Create Account" subtitle="Join the PMS platform today">
            <SignUpForm 
              onSuccess={(phone) => {
                setPendingPhone(phone);
                setAuthStep('otp');
              }} 
              onSwitchToLogin={() => setAuthStep('login')} 
            />
          </AuthLayout>
        )}

        {authStep === 'otp' && (
          <AuthLayout title="Verify Identity" subtitle="Enter the code sent to your phone">
            <OTPVerification 
              phone={pendingPhone}
              onSuccess={() => setAuthStep('login')}
              onBack={() => setAuthStep('signup')}
            />
          </AuthLayout>
        )}
        <Toaster position="top-center" richColors />
      </>
    );
  }

  const userName = session.user.user_metadata?.first_name 
    ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name}`
    : session.user.phone || 'User';

  const userRole = 'Standard User';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-0 transition-all">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-100">
              <Landmark className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">BANKERS PMS</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-tight">Performance Management</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-5 bg-slate-50 p-2 pr-6 rounded-full border border-slate-100 group cursor-pointer hover:border-emerald-200 transition-all">
             <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black border-2 border-white shadow-sm">
                {userName.split(' ').map((n: string) => n[0]).join('')}
             </div>
             <div className="text-left">
                <p className="text-sm font-black text-slate-900 leading-tight">{userName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{userRole}</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <div className="flex justify-center md:justify-start">
            <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl p-1.5 rounded-2xl">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
                <LayoutDashboard className="w-4 h-4" />
                <span className="font-bold uppercase tracking-wider text-xs">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="entry" className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
                <PlusCircle className="w-4 h-4" />
                <span className="font-bold uppercase tracking-wider text-xs">New Entry</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
                <FileText className="w-4 h-4" />
                <span className="font-bold uppercase tracking-wider text-xs">Reports</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TabsContent value="dashboard">
              <Dashboard 
                entries={entries} 
                user={{ id: session.user.id, name: userName, role: 'user', username: session.user.phone || '' }} 
                onLogout={handleLogout} 
              />
            </TabsContent>

            <TabsContent value="entry">
              <div className="max-w-3xl mx-auto">
                <EntryForm onAdd={handleAddEntry} />
              </div>
            </TabsContent>

            <TabsContent value="reports">
              <ReportView entries={entries} onDelete={handleDeleteEntry} userName={userName} />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center h-20 md:hidden z-20 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] rounded-t-[32px]">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'dashboard' ? 'bg-emerald-50' : ''}`}>
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter">Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('entry')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all ${activeTab === 'entry' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'entry' ? 'bg-emerald-50' : ''}`}>
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter">New Entry</span>
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all ${activeTab === 'reports' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'reports' ? 'bg-emerald-50' : ''}`}>
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter">Reports</span>
        </button>
      </nav>

      <Toaster position="top-center" expand={false} richColors closeButton />
    </div>
  );
};

export default App;