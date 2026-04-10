import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Utensils, 
  Users, 
  Calendar, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Menu,
  X,
  History, 
  ChevronRight,
  Search,
  Check,
  XCircle,
  Activity,
  Award,
  FileText,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { generateDietPDF, generateSchedulePDF } from '../utils/pdfGenerator';

const TrainerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [dietPlans, setDietPlans] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [trainerEarnings, setTrainerEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Modals state
  const [isDietModalOpen, setIsDietModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [newPlan, setNewPlan] = useState({ 
    name: '', 
    description: '', 
    meals: [{ day: 'Daily', time: '08:00 AM', food: '', calories: 0, protein: 0, carbs: 0, fat: 0 }] 
  });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignmentData, setAssignmentData] = useState({ userId: '', dietPlanId: '', endDate: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [dietsRes, traineesRes, bookingsRes, earningsRes] = await Promise.all([
        api.get('/diets').catch(err => {
          console.error('Diet API Error:', err);
          throw new Error('Nutrition data synchronization failed');
        }),
        api.get('/admin/users').catch(err => {
          console.error('User API Error:', err);
          throw new Error('Client records access denied or unavailable');
        }),
        api.get('/bookings/trainer-schedule').catch(err => {
          console.error('Schedule API Error:', err);
          throw new Error('Operational schedule could not be retrieved');
        }),
        api.get(`/admin/trainers/${userData._id}/earnings`).catch(err => null) // Admin API but available for trainer too if we set routes
      ]);
      
      setDietPlans(dietsRes.data.data || []);
      setTrainees((traineesRes.data.data || []).filter(u => u.role === 'user'));
      setBookings(bookingsRes.data.data || []);
      if (earningsRes) setTrainerEarnings(earningsRes.data.data);
    } catch (err) {
      setError(err.message || 'System-wide synchronization failed');
      console.error('Dashboard Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleCreateDietPlan = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingPlan) {
        await api.put(`/diets/${editingPlan._id}`, newPlan);
        setSuccess('Nutritional Protocol Recalibrated');
      } else {
        await api.post('/diets', newPlan);
        setSuccess('Strategic Diet Plan Established');
      }
      setIsDietModalOpen(false);
      setEditingPlan(null);
      setNewPlan({ name: '', description: '', meals: [{ day: 'Daily', time: '08:00 AM', food: '', calories: 0, protein: 0, carbs: 0, fat: 0 }] });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDietPlan = (plan) => {
    setEditingPlan(plan);
    setNewPlan({
      name: plan.name,
      description: plan.description,
      meals: plan.meals.map(m => ({ ...m }))
    });
    setIsDietModalOpen(true);
  };

  const handleDeleteDietPlan = async (id) => {
    if (!window.confirm('Are you sure you want to decommission this nutritional protocol?')) return;
    try {
      setLoading(true);
      await api.delete(`/diets/${id}`);
      setSuccess('Protocol Decommissioned');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Internal logic error during deletion');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDiet = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/diets/assign', assignmentData);
      setSuccess('Nutritional Directives Distributed');
      setIsAssignModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setSuccess(`Session status updated to ${status}`);
      fetchData();
    } catch (err) {
      setError('Status Update Failed');
    }
  };

  const addMeal = () => {
    setNewPlan({
      ...newPlan,
      meals: [...newPlan.meals, { day: 'Daily', time: '12:00 PM', food: '', calories: 0, protein: 0, carbs: 0, fat: 0 }]
    });
  };

  const removeMeal = (index) => {
    const updatedMeals = newPlan.meals.filter((_, i) => i !== index);
    setNewPlan({ ...newPlan, meals: updatedMeals });
  };

  const updateMeal = (index, field, value) => {
    const updatedMeals = [...newPlan.meals];
    updatedMeals[index][field] = value;
    setNewPlan({ ...newPlan, meals: updatedMeals });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row relative overflow-x-hidden font-sans">
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3">
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-green-600 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-green-600/20 flex items-center"
          >
            <CheckCircle2 size={18} className="mr-3" />
            {success}
            <button onClick={() => setSuccess('')} className="ml-4 opacity-70"><XCircle size={14}/></button>
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-600 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-red-600/20 flex items-center"
          >
            <History size={18} className="mr-3" />
            {error}
            <button onClick={() => setError('')} className="ml-4 opacity-70"><XCircle size={14}/></button>
          </motion.div>
        )}
      </div>

      {/* Mobile Top Bar */}
      <header className="lg:hidden bg-white border-b border-slate-200 p-6 sticky top-0 z-[60] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Gym<span className="text-indigo-600">Staff</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Professional Hub</p>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Modern Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-80 bg-white border-r border-slate-200 p-10 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto shrink-0 shadow-2xl lg:shadow-none shadow-indigo-500/10`}>
        <div className="flex items-center space-x-5 mb-14 px-2">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-600/30 uppercase tracking-tighter italic overflow-hidden group">
            <motion.span whileHover={{ scale: 1.2, rotate: 5 }}>{userData.name?.charAt(0)}</motion.span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
              GYM<span className="text-indigo-600">STAFF</span>
            </h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-2 px-2 py-1 bg-slate-50 rounded-lg w-fit border border-slate-100">Professional</p>
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          {[
            { id: 'overview', label: 'Command Hub', icon: LayoutDashboard },
            { id: 'diets', label: 'Nutritional Purity', icon: Utensils },
            { id: 'trainees', label: 'Client Assets', icon: Users },
            { id: 'schedule', label: 'Operational Grid', icon: Calendar },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center space-x-5 px-7 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all group ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-14 pt-10 border-t border-slate-100 flex flex-col gap-6">
           <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group transition-all hover:border-indigo-200">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600 border border-slate-100 group-hover:scale-110 transition-transform">
                    <Award size={20} />
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic leading-none">{userData.name}</h4>
                    <p className="text-[8px] font-bold text-slate-400 mt-1 italic uppercase tracking-widest">{userData.role || 'Staff'}</p>
                 </div>
              </div>
              <p className="text-slate-400 text-[8px] font-medium leading-relaxed italic">{userData.email}</p>
           </div>
           
           <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-4 px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-[0.98]"
          >
            <LogOut size={20} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 p-6 lg:p-14 space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl shadow-indigo-500/5 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              {activeTab} <span className="text-indigo-600">Interface</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-2 italic flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Maintaining gym operational effectiveness at peak parameters
            </p>
          </div>
          <div className="flex bg-slate-50 p-1.5 rounded-[2rem] border border-slate-200 shadow-inner mt-6 md:mt-0">
             <div className="px-8 py-4 rounded-[1.5rem] bg-white border border-slate-200 shadow-sm text-center">
               <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5 opacity-60">System Status</span>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 flex items-center gap-2">
                 SYNCED <Activity size={12} />
               </span>
             </div>
          </div>
          <LayoutDashboard className="absolute -right-10 -bottom-10 w-48 h-48 text-indigo-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </header>

        <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                variants={containerVariants} initial="hidden" animate="visible" exit="hidden"
                className="space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'Active Protocols', value: dietPlans.length, icon: Utensils, color: 'text-indigo-600', bg: 'bg-indigo-50', unit: 'STRATEGIES', trend: '+12%' },
                    { label: 'Total Trainees', value: trainees.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', unit: 'OPERATIVES', trend: '+5%' },
                    { label: 'Verified PT', value: bookings.filter(b => b.status === 'confirmed').length, icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50', unit: 'SESSIONS', trend: 'STABLE' },
                    { label: 'Aggregate Payout', value: trainerEarnings ? `Rs.${trainerEarnings.totalEarnings.toLocaleString()}` : 'Rs.0', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50', unit: 'REVENUE', trend: '+18%' }
                  ].map((stat, idx) => (
                    <motion.div 
                      key={idx} 
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-indigo-500/5 group relative overflow-hidden transition-all hover:border-indigo-500/40"
                    >
                      <div className={`p-5 w-fit rounded-2xl ${stat.bg} mb-8 ${stat.color} shadow-inner group-hover:scale-110 transition-transform`}>
                        <stat.icon size={28} />
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{stat.trend}</span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic">{stat.value}</h3>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.unit}</span>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                         <stat.icon size={120} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  variants={itemVariants}
                  className="bg-indigo-600 p-14 rounded-[4rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-600/30 group"
                >
                  <div className="relative z-10 max-w-3xl">
                    <h3 className="text-4xl font-black uppercase tracking-tighter italic mb-8 leading-none">Commanding Excellence: <br/><span className="text-indigo-200">Staff Operational Directives</span></h3>
                    <p className="text-indigo-100 text-lg font-medium leading-relaxed italic mb-10 opacity-80">
                      As a professional staff operative, your mission is to maintain peak synchronization between client nutritional intake and instructional trajectories. Your dashboard is the nexus of gym operational effectiveness. Ensure every trainee is mapped to a verified protocol.
                    </p>
                    <div className="flex gap-4">
                       <button onClick={() => setActiveTab('trainees')} className="px-10 py-5 bg-white text-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl shadow-indigo-900/40">Inspect Operatives</button>
                    </div>
                  </div>
                  <Activity className="absolute -bottom-20 -right-20 w-96 h-96 text-white/10 -rotate-12 group-hover:rotate-0 transition-all duration-1000" />
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'diets' && (
              <motion.div key="diets" variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 gap-6">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Nutritional Blueprints</h3>
                    <p className="text-slate-400 text-sm italic font-medium mt-1">Strategic dietary protocols for trainee transformation</p>
                  </div>
                  <button 
                    onClick={() => { setEditingPlan(null); setIsDietModalOpen(true); }}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 active:scale-[0.98]"
                  >
                    <Plus size={18} />
                    Establish Protocol
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  {dietPlans.map((plan) => (
                    <motion.div 
                      key={plan._id} 
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-xl shadow-indigo-500/5 group relative overflow-hidden transition-all hover:border-indigo-500/30"
                    >
                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                          <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-tight group-hover:text-indigo-600 transition-colors">{plan.name}</h4>
                          <div className="flex items-center gap-3 mt-3">
                             <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest italic">{plan.meals.length} Meal Segments</div>
                             <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest italic">Target: Optimized</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => generateDietPDF(plan)}
                             className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all border border-transparent hover:border-indigo-100 shadow-sm"
                             title="Export Protocol PDF"
                           >
                             <FileText size={20}/>
                           </button>
                           <button 
                             onClick={() => handleEditDietPlan(plan)}
                             className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border border-transparent hover:border-indigo-100 hover:bg-white"
                             title="Modify Protocol"
                           >
                             <Edit size={20}/>
                           </button>
                           <button 
                             onClick={() => handleDeleteDietPlan(plan._id)}
                             className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all border border-transparent hover:border-red-100 hover:bg-white"
                             title="Decommission Protocol"
                           >
                             <Trash2 size={20}/>
                           </button>
                        </div>
                      </div>
                      
                      <p className="text-slate-500 text-base font-medium italic mb-12 line-clamp-3 leading-relaxed relative z-10">
                        {plan.description || 'No strategic summary provided for this nutritional protocol. Ensure trainee adherence to specified meal timings.'}
                      </p>
                      
                      <div className="flex items-center gap-4 relative z-10">
                         <button 
                          onClick={() => { setAssignmentData({...assignmentData, dietPlanId: plan._id}); setIsAssignModalOpen(true); }}
                          className="flex-1 py-5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          <ChevronRight size={16} />
                          Deploy to Operative
                        </button>
                      </div>

                      <Utensils className="absolute -right-10 -bottom-10 w-48 h-48 opacity-[0.03] group-hover:opacity-[0.06] -rotate-12 transition-all duration-700" />
                    </motion.div>
                  ))}
                  {dietPlans.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-white border border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                         <Utensils size={40} />
                      </div>
                      <p className="text-slate-400 font-black italic tracking-[0.2em] uppercase text-sm">No dietary protocols established.</p>
                      <button onClick={() => setIsDietModalOpen(true)} className="text-indigo-600 font-black uppercase text-xs tracking-widest hover:underline">+ Initialize First Strategy</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'trainees' && (
              <motion.div key="trainees" variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
                <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-500/5 transition-all hover:shadow-indigo-500/10">
                  <div className="px-12 py-10 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Operative Directory</h3>
                      <p className="text-slate-400 text-xs font-medium italic mt-1">Personnel current mapping and contact vectors</p>
                    </div>
                    <div className="relative group w-full md:w-auto">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search for operative..." 
                        className="w-full md:w-80 bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-8 text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all outline-none italic" 
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                          <th className="px-12 py-8">Entity Identity</th>
                          <th className="px-12 py-8">Comms Frequency</th>
                          <th className="px-12 py-8 text-right">Strategic Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {trainees.map((u) => (
                          <motion.tr 
                            key={u._id} 
                            whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.5)' }}
                            className="transition-all group"
                          >
                            <td className="px-12 py-10">
                              <div className="flex items-center gap-5">
                                 <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
                                    {u.name?.charAt(0)}
                                 </div>
                                 <div className="flex flex-col">
                                   <span className="font-black text-slate-900 text-xl uppercase tracking-tighter group-hover:text-indigo-600 transition-colors leading-none">{u.name}</span>
                                   <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">{u.email}</span>
                                 </div>
                              </div>
                            </td>
                            <td className="px-12 py-10">
                               <div className="flex flex-col">
                                 <div className="text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <Activity size={14} className="text-indigo-400" />
                                    {u.contactNumber}
                                 </div>
                                 <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter italic">Verified Mobile Unit</div>
                               </div>
                            </td>
                            <td className="px-12 py-10 text-right">
                               <button 
                                 onClick={() => { setAssignmentData({...assignmentData, userId: u._id}); setIsAssignModalOpen(true); }}
                                 className="px-8 py-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-indigo-100 hover:border-indigo-600 shadow-sm active:scale-[0.95]"
                               >
                                 Assign Protocol
                               </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div key="schedule" variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
                {/* Weekly Calendar Component */}
                <div className="bg-white border border-slate-200 rounded-[3.5rem] p-12 shadow-2xl shadow-indigo-500/5 transition-all hover:shadow-indigo-500/10">
                   <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
                      <div>
                         <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Weekly Operational Grid</h3>
                         <p className="text-slate-400 text-sm font-medium italic mt-1 pb-2 border-b-2 border-indigo-100 w-fit">Tactical PT Logistics and Asset Distribution</p>
                      </div>
                      <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
                         <div className="px-8 py-3 bg-white rounded-xl shadow-sm text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border border-slate-200">Current Time Window</div>
                         <button 
                           onClick={() => generateSchedulePDF(bookings, userData.name)}
                           className="px-8 py-3 bg-indigo-600 text-white rounded-xl shadow-lg text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95"
                         >
                           <FileText size={14} />
                           Export Report
                         </button>
                      </div>
                   </div>
 
                   <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dIdx) => {
                        const dayBookings = bookings.filter(b => {
                          const date = new Date(b.date);
                          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                          return dayName === day;
                        });
 
                        return (
                          <div key={day} className="space-y-5">
                             <div className="text-center py-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{day}</span>
                             </div>
                             <div className="space-y-4">
                                {dayBookings.map((b, i) => (
                                  <motion.div 
                                    key={i} 
                                    whileHover={{ y: -5, scale: 1.05 }}
                                    className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-sm ${
                                      b.status === 'confirmed' ? 'bg-indigo-600 border-transparent text-white shadow-indigo-200 shadow-lg' : 
                                      b.status === 'completed' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                                    }`}
                                  >
                                     <p className={`text-[8px] font-black uppercase tracking-widest mb-2 ${b.status === 'confirmed' ? 'text-indigo-200' : 'opacity-60'}`}>{b.timeSlot.split(' - ')[0]}</p>
                                     <p className="text-[11px] font-black uppercase tracking-tighter leading-tight truncate">{b.user?.name}</p>
                                  </motion.div>
                                ))}
                                {dayBookings.length === 0 && (
                                  <div className="h-24 border-2 border-dashed border-slate-100 rounded-[2rem] flex items-center justify-center opacity-40">
                                     <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-pulse"></div>
                                  </div>
                                )}
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
 
                <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-500/5">
                  <div className="px-12 py-10 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-4">
                       <Calendar className="text-indigo-600" />
                       PT Operational Schedule
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                          <th className="px-12 py-8">Session Vectors</th>
                          <th className="px-12 py-8">Operative Comms</th>
                          <th className="px-12 py-8">Status State</th>
                          <th className="px-12 py-8 text-right">System Optimization</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bookings.map((b) => (
                          <motion.tr 
                            key={b._id} 
                            whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.5)' }}
                            className="transition-all group"
                          >
                            <td className="px-12 py-10">
                              <div className="flex flex-col">
                                <span className="font-black text-slate-900 text-xl uppercase tracking-tighter group-hover:text-indigo-600 transition-colors leading-none">{new Date(b.date).toLocaleDateString()}</span>
                                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.15em] italic mt-2 flex items-center gap-2">
                                   <Clock size={12} />
                                   {b.timeSlot}
                                </span>
                              </div>
                            </td>
                            <td className="px-12 py-10">
                               <div className="font-black text-slate-800 uppercase tracking-tighter text-lg leading-none">{b.user?.name}</div>
                               <div className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-widest">{b.user?.email}</div>
                            </td>
                            <td className="px-12 py-10">
                               <span className={`inline-flex items-center px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border ${
                                 b.status === 'completed' ? 'bg-green-50 border-green-100 text-green-600 shadow-sm' :
                                 b.status === 'confirmed' ? 'bg-blue-50 border-blue-100 text-blue-600 shadow-sm' : 
                                 b.status === 'cancelled' ? 'bg-red-50 border-red-100 text-red-600 shadow-sm' : 'bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm animate-pulse'
                               }`}>
                                 {b.status === 'pending' ? 'SYNC PENDING' : b.status}
                               </span>
                            </td>
                            <td className="px-12 py-10 text-right">
                               <div className="flex justify-end gap-3">
                                  {b.status === 'pending' && (
                                     <>
                                        <button onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')} className="p-3 bg-green-50 text-green-600 rounded-xl border border-green-100 hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-[0.9]"><Check size={20}/></button>
                                        <button onClick={() => handleUpdateBookingStatus(b._id, 'cancelled')} className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-[0.9]"><XCircle size={20}/></button>
                                     </>
                                  )}
                                  {b.status === 'confirmed' && (
                                     <button onClick={() => handleUpdateBookingStatus(b._id, 'completed')} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.95]">Archive Session</button>
                                  )}
                               </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

      {/* Diet Plan Modal */}
      {isDietModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">{editingPlan ? 'Recalibrate Protocol' : 'Establish Protocol'}</h3>
                <p className="text-slate-500 text-sm mt-1 font-medium italic">{editingPlan ? 'Optimizing existing trajectories' : 'Defining nutritional trajectories'}</p>
              </div>
              <button onClick={() => { setIsDietModalOpen(false); setEditingPlan(null); setNewPlan({ name: '', description: '', meals: [{ day: 'Daily', time: '08:00 AM', food: '', calories: 0, protein: 0, carbs: 0, fat: 0 }] }); }} className="p-3 hover:bg-white/50 rounded-full text-slate-400 transition-colors"><XCircle size={32} /></button>
            </div>
            
            <form onSubmit={handleCreateDietPlan} className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 italic">Blueprint Identity</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Muscle Mass Optimization" 
                    value={newPlan.name} 
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/10 outline-none" required 
                  />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 italic">Strategic Summary</label>
                   <input 
                    type="text" 
                    placeholder="Brief description..." 
                    value={newPlan.description} 
                    onChange={(e) => setNewPlan({...newPlan, description: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/10 outline-none" required 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                  <h5 className="text-[11px] font-black uppercase tracking-widest text-indigo-600 italic">Meal Components</h5>
                  <button type="button" onClick={addMeal} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">+ Segment Meal</button>
                </div>
                
                <div className="space-y-6">
                  {newPlan.meals.map((meal, index) => (
                    <div key={index} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col gap-6 relative group">
                      <button type="button" onClick={() => removeMeal(index)} className="absolute -top-2 -right-2 p-2 bg-white text-red-500 rounded-full border border-red-100 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 px-1">Phase</label>
                            <select value={meal.day} onChange={(e) => updateMeal(index, 'day', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase outline-none">
                               {['Daily', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 px-1">Timestamp</label>
                            <input type="text" placeholder="08:00 AM" value={meal.time} onChange={(e) => updateMeal(index, 'time', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none" />
                         </div>
                         <div className="space-y-2">
                             <label className="text-[9px] font-black uppercase text-slate-400 px-1">Nutritional Load</label>
                             <input type="text" placeholder="Chicken & Rice" value={meal.food} onChange={(e) => updateMeal(index, 'food', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none" required />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                         <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 px-1">CALS</label>
                            <input type="number" value={meal.calories} onChange={(e) => updateMeal(index, 'calories', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold outline-none" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 px-1">PRO (G)</label>
                            <input type="number" value={meal.protein} onChange={(e) => updateMeal(index, 'protein', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold outline-none" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 px-1">CARB (G)</label>
                            <input type="number" value={meal.carbs} onChange={(e) => updateMeal(index, 'carbs', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold outline-none" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400 px-1">FAT (G)</label>
                            <input type="number" value={meal.fat} onChange={(e) => updateMeal(index, 'fat', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold outline-none" />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
                {loading ? (editingPlan ? 'Recalibrating...' : 'Initializing...') : (editingPlan ? 'Update Strategic Payload' : 'Finalize Strategy & Secure Protocol')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Diet Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Deploy Protocol</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="p-2 hover:bg-white/50 rounded-full text-slate-400 transition-colors"><XCircle size={28} /></button>
            </div>
            <form onSubmit={handleAssignDiet} className="p-10 space-y-8">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Target Client</label>
                    <select 
                      value={assignmentData.userId} 
                      onChange={(e) => setAssignmentData({...assignmentData, userId: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10" required
                    >
                       <option value="">Select Operational Target...</option>
                       {trainees.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Blueprint Selection</label>
                    <select 
                      value={assignmentData.dietPlanId} 
                      onChange={(e) => setAssignmentData({...assignmentData, dietPlanId: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10" required
                    >
                       <option value="">Select Strategy Payload...</option>
                       {dietPlans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Termination Date</label>
                    <input 
                      type="date" 
                      value={assignmentData.endDate} 
                      onChange={(e) => setAssignmentData({...assignmentData, endDate: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10" required
                    />
                  </div>
               </div>
               <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
                 {loading ? 'Transmitting...' : 'Confirm Deployment'}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
