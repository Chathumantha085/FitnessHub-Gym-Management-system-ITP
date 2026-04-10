import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  CreditCard, 
  Settings, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Trash2, 
  Plus, 
  DollarSign, 
  AlertCircle,
  FileSearch,
  History,
  Edit,
  FileText
} from 'lucide-react';
import { generateMembersPDF, generateStaffPDF, generatePlansPDF, generateFinancePDF } from '../utils/pdfGenerator';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);

  // ── Granular loading states ───────────────────────────────────────────────
  const [loadingUsers,    setLoadingUsers]    = useState(true);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [loadingPlans,    setLoadingPlans]    = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingRevenue,  setLoadingRevenue]  = useState(true);
  const [actionLoading,   setActionLoading]   = useState(false); // for modal form mutations (hire, plan save)
  const [rowLoading,      setRowLoading]      = useState({});   // per-row: { [id-action]: true }
  // ─────────────────────────────────────────────────────────────────────────

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('members'); // 'members', 'trainers', 'plans', 'finance'
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
  const [editingUser, setEditingUser] = useState(null); // For edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [newTrainer, setNewTrainer] = useState({ name: '', email: '', contactNumber: '', address: '', hourlyRate: '', yearsExperience: '', specialization: '' });
  
  // Trainer Earnings State
  const [selectedTrainerEarnings, setSelectedTrainerEarnings] = useState(null);
  const [isEarningsModalOpen, setIsEarningsModalOpen] = useState(false);
  
  // Membership Plans State
  const [plans, setPlans] = useState([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', durationMonths: '', description: '', features: '' });

  // Finance State
  const [payments, setPayments] = useState([]);
  const [revenueStats, setRevenueStats] = useState({ total: 0, monthly: [] });

  const navigate = useNavigate();

  // ── Skeleton helpers ──────────────────────────────────────────────────────
  const SkeletonRow = ({ cols = 5 }) => (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-10 py-8">
          <div className="h-4 bg-slate-100 rounded-xl" style={{ width: `${60 + (i % 3) * 15}%` }} />
          {i === 0 && <div className="h-3 bg-slate-100 rounded-xl mt-2 w-2/3" />}
        </td>
      ))}
    </tr>
  );

  const SkeletonCard = () => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-pulse">
      <div className="h-5 bg-slate-100 rounded-xl w-1/2 mb-4" />
      <div className="h-9 bg-slate-100 rounded-xl w-3/4 mb-6" />
      <div className="space-y-3 mb-8">
        {[1,2,3].map(i => <div key={i} className="h-3 bg-slate-100 rounded-xl" style={{ width: `${50 + i * 10}%` }} />)}
      </div>
      <div className="h-12 bg-slate-100 rounded-2xl" />
    </div>
  );

  const SkeletonStatCard = () => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-pulse">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl mb-8" />
      <div className="h-3 bg-slate-100 rounded-xl w-1/2 mb-3" />
      <div className="h-8 bg-slate-100 rounded-xl w-3/4" />
    </div>
  );

  // Spinner component for action states
  const Spinner = ({ size = 16, className = '' }) => (
    <svg
      className={`animate-spin ${className}`}
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
  // ─────────────────────────────────────────────────────────────────────────

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://tan-salamander-545528.hostingersite.com/api').replace('/api', '');

  useEffect(() => {
    fetchUsers();
    fetchTrainers();
    fetchPlans();
    fetchPayments();
    fetchRevenue();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (err) {
      handleApiError(err, 'Failed to fetch users.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTrainers = async () => {
    setLoadingTrainers(true);
    try {
      const response = await api.get('/admin/trainers');
      setTrainers(response.data.data);
    } catch (err) {
      handleApiError(err, 'Failed to fetch trainers.');
    } finally {
      setLoadingTrainers(false);
    }
  };

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await api.get('/membership/admin/plans');
      setPlans(response.data.data);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const response = await api.get('/payments/admin');
      setPayments(response.data.data);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchRevenue = async () => {
    setLoadingRevenue(true);
    try {
      const response = await api.get('/payments/admin/revenue');
      setRevenueStats(response.data);
    } catch (err) {
      console.error('Failed to fetch revenue:', err);
    } finally {
      setLoadingRevenue(false);
    }
  };

  const handleApiError = (err, defaultMsg) => {
    setError(err.response?.data?.message || defaultMsg);
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.clear();
      navigate('/login');
    }
    setTimeout(() => setError(''), 5000);
  };

  // Helper: set/clear loading for a specific row+action key
  const setRowAction = (id, action, value) =>
    setRowLoading(prev => ({ ...prev, [`${id}-${action}`]: value }));
  const isRowLoading = (id, action) => !!rowLoading[`${id}-${action}`];

  const handleUpdateStatus = async (id, status) => {
    let rejectReason = '';
    if (status === 'rejected') {
      rejectReason = prompt('Please enter the reason for rejection:');
      if (rejectReason === null) return;
    }
    setRowAction(id, status, true);
    try {
      const response = await api.patch(`/admin/approve/${id}`, { status, rejectReason });
      setUsers(users.map((u) => (u._id === id ? response.data.data : u)));
      showSuccess(`User ${status} successfully!`);
    } catch (err) {
      handleApiError(err, `Failed to ${status} user.`);
    } finally {
      setRowAction(id, status, false);
    }
  };

  const handleDeleteUser = async (id, role) => {
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;
    setRowAction(id, 'delete', true);
    try {
      if (role === 'trainer') {
        await api.delete(`/admin/trainers/${id}`);
        setTrainers(trainers.filter((t) => t._id !== id));
      } else {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter((u) => u._id !== id));
      }
      showSuccess('Account deleted successfully.');
    } catch (err) {
      handleApiError(err, 'Failed to delete account.');
    } finally {
      setRowAction(id, 'delete', false);
    }
  };

  const handleSendQR = async (id) => {
    setRowAction(id, 'sendqr', true);
    try {
      const response = await api.post(`/admin/users/${id}/qr`);
      showSuccess(response.data.message);
    } catch (err) {
      handleApiError(err, 'Failed to send QR code.');
    } finally {
      setRowAction(id, 'sendqr', false);
    }
  };

  const handleHireTrainer = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const response = await api.post('/admin/trainers', newTrainer);
      setTrainers([...trainers, response.data.data]);
      setIsHireModalOpen(false);
      setNewTrainer({ name: '', email: '', contactNumber: '', address: '', hourlyRate: '', yearsExperience: '', specialization: '' });
      showSuccess('Trainer hired and credentials emailed!');
    } catch (err) {
      handleApiError(err, 'Failed to hire trainer.');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchTrainerEarnings = async (trainerId) => {
    setRowAction(trainerId, 'earnings', true);
    try {
      const response = await api.get(`/admin/trainers/${trainerId}/earnings`);
      setSelectedTrainerEarnings(response.data.data);
      setIsEarningsModalOpen(true);
    } catch (err) {
      handleApiError(err, 'Failed to fetch trainer earnings.');
    } finally {
      setRowAction(trainerId, 'earnings', false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const endpoint = editingUser.role === 'trainer' ? `/admin/trainers/${editingUser._id}` : `/admin/users/${editingUser._id}`;
      const response = await api.put(endpoint, editingUser);
      
      if (editingUser.role === 'trainer') {
        setTrainers(trainers.map((t) => (t._id === editingUser._id ? response.data.data : t)));
      } else {
        setUsers(users.map((u) => (u._id === editingUser._id ? response.data.data : u)));
      }
      
      setIsEditModalOpen(false);
      setEditingUser(null);
      showSuccess('Account updated successfully!');
    } catch (err) {
      handleApiError(err, 'Failed to update account.');
    } finally {
      setActionLoading(false);
    }
  };

  // Membership Plan Actions
  const handleSavePlan = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const planData = {
        ...newPlan,
        features: newPlan.features.split(',').map(f => f.trim()).filter(f => f)
      };

      if (editingPlan) {
        const response = await api.put(`/membership/admin/plans/${editingPlan._id}`, planData);
        setPlans(plans.map(p => p._id === editingPlan._id ? response.data.data : p));
        showSuccess('Plan updated successfully');
      } else {
        const response = await api.post('/membership/admin/plans', planData);
        setPlans([response.data.data, ...plans]);
        showSuccess('New plan created');
      }
      setIsPlanModalOpen(false);
      setEditingPlan(null);
      setNewPlan({ name: '', price: '', durationMonths: '', description: '', features: '' });
    } catch (err) {
      handleApiError(err, 'Failed to save membership plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePlan = async (id) => {
    setRowAction(id, 'toggle', true);
    try {
      const response = await api.patch(`/membership/admin/plans/${id}/toggle`);
      setPlans(plans.map(p => p._id === id ? response.data.data : p));
      showSuccess('Plan status updated');
    } catch (err) {
      handleApiError(err, 'Failed to toggle plan status');
    } finally {
      setRowAction(id, 'toggle', false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    setRowAction(id, 'delete', true);
    try {
      await api.delete(`/membership/admin/plans/${id}`);
      setPlans(plans.filter(p => p._id !== id));
      showSuccess('Plan deleted');
    } catch (err) {
      handleApiError(err, 'Failed to delete plan');
    } finally {
      setRowAction(id, 'delete', false);
    }
  };

  // Payment Actions
  const handleConfirmPayment = async (id) => {
    setRowAction(id, 'confirm', true);
    try {
      const response = await api.patch(`/payments/admin/${id}/confirm`);
      setPayments(payments.map(p => p._id === id ? { ...p, status: 'confirmed' } : p));
      fetchRevenue();
      showSuccess('Payment confirmed, membership activated & member notified via email!');
    } catch (err) {
      handleApiError(err, 'Failed to confirm payment');
    } finally {
      setRowAction(id, 'confirm', false);
    }
  };

  const handleRejectPayment = async (id) => {
    const reason = prompt('Enter a reason for rejection (optional, will be included in the email to the member):');
    if (reason === null) return; // User cancelled
    setRowAction(id, 'reject', true);
    try {
      await api.patch(`/payments/admin/${id}/reject`, { reason: reason.trim() || undefined });
      setPayments(payments.map(p => p._id === id ? { ...p, status: 'rejected' } : p));
      showSuccess('Payment rejected & member notified via email');
    } catch (err) {
      handleApiError(err, 'Failed to reject payment');
    } finally {
      setRowAction(id, 'reject', false);
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 relative">
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
        {success && (
          <div className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-green-600/20 animate-in fade-in slide-in-from-top-4">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-red-600/20 animate-in fade-in slide-in-from-top-4">
            {error}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-8 border-b border-slate-200 gap-4">
          <div className="flex items-center space-x-6">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
              Gym<span className="text-indigo-600">Admin</span>
            </h1>
            <div className="h-10 w-[1px] bg-slate-200"></div>
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => setActiveTab('members')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'members' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Members
              </button>
              <button 
                onClick={() => setActiveTab('trainers')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'trainers' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Staff
              </button>
              <button 
                onClick={() => setActiveTab('plans')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'plans' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Plans
              </button>
              <button 
                onClick={() => setActiveTab('finance')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'finance' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Finance
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             {activeTab === 'members' && (
              <div className="flex items-center gap-3">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  {['pending', 'approved', 'rejected', 'all'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                        filter === f ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => generateMembersPDF(filteredUsers, filter)}
                  className="p-2.5 bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200 rounded-xl transition-all shadow-sm"
                  title="Export Member Report"
                >
                  <FileText size={18} />
                </button>
              </div>
             )}
             {activeTab === 'staff' || activeTab === 'trainers' ? (
               <div className="flex items-center gap-3">
                 <button 
                    onClick={() => generateStaffPDF(trainers)}
                    className="p-2.5 bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200 rounded-xl transition-all shadow-sm"
                    title="Export Staff Report"
                  >
                    <FileText size={18} />
                  </button>
                 <button 
                   onClick={() => setIsHireModalOpen(true)}
                   className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                 >
                   + Hire trainer
                 </button>
               </div>
             ) : null}
             {activeTab === 'plans' && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => generatePlansPDF(plans)}
                    className="p-2.5 bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200 rounded-xl transition-all shadow-sm"
                    title="Export Plans Report"
                  >
                    <FileText size={18} />
                  </button>
                  <button 
                    onClick={() => { setEditingPlan(null); setNewPlan({ name: '', price: '', durationMonths: '', description: '', features: '' }); setIsPlanModalOpen(true); }}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                  >
                    + Create Plan
                  </button>
                </div>
             )}
            <button 
              onClick={handleLogout}
              className="px-6 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              Sign Out
            </button>
          </div>
        </header>

        {(activeTab === 'members' || activeTab === 'trainers') ? (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm shadow-indigo-500/5">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black flex items-center text-slate-900 tracking-tight">
                  {activeTab === 'members' ? 'Member Directory' : 'Professional Staff'}
                  <span className={`ml-3 px-3 py-1 rounded-xl text-xs font-black ${activeTab === 'members' ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {activeTab === 'members' ? filteredUsers.length : trainers.length}
                  </span>
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-medium italic">Manage and supervise gym {activeTab}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                    <th className="px-10 py-6">Identity</th>
                    <th className="px-10 py-6">Connection</th>
                    <th className={`px-10 py-6 ${activeTab === 'trainers' ? 'hidden' : ''}`}>Verification</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTab === 'members' ? (
                    <>
                      {/* Skeleton rows while loading */}
                      {loadingUsers && [1,2,3,4].map(i => <SkeletonRow key={i} cols={5} />)}

                      {filteredUsers.length === 0 && !loadingUsers && (
                        <tr>
                          <td colSpan="5" className="px-10 py-20 text-center">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Users size={32} className="text-slate-300" />
                              </div>
                              <p className="text-slate-400 font-bold italic tracking-wider">No active members found.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50 transition-all group">
                          <td className="px-10 py-8">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{user.name}</span>
                              <span className="text-slate-400 text-[10px] font-mono mt-1 font-bold">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center text-slate-700 text-xs font-black">
                                {user.contactNumber}
                              </div>
                              <div className="text-slate-500 text-[10px] font-medium max-w-[180px] truncate">{user.address}</div>
                            </div>
                          </td>
                          <td className="px-10 py-8">
                            <a 
                              href={`${API_BASE_URL}${user.paymentSlipUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-indigo-600 transition-all"
                            >
                              <Eye size={18} />
                            </a>
                          </td>
                          <td className="px-10 py-8">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                              user.status === 'approved' ? 'bg-green-50 border-green-100 text-green-600' : 
                              user.status === 'rejected' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${user.status === 'approved' ? 'bg-green-600' : user.status === 'rejected' ? 'bg-red-600' : 'bg-indigo-600 animate-pulse'}`}></span>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex justify-end items-center space-x-2">
                              {user.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(user._id, 'approved')}
                                    disabled={isRowLoading(user._id, 'approved') || isRowLoading(user._id, 'rejected')}
                                    className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-green-600/10 transition-all flex items-center gap-2"
                                  >
                                    {isRowLoading(user._id, 'approved') ? <Spinner size={12} /> : null}
                                    APPROVE
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(user._id, 'rejected')}
                                    disabled={isRowLoading(user._id, 'approved') || isRowLoading(user._id, 'rejected')}
                                    className="text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60 border border-red-100 font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                                  >
                                    {isRowLoading(user._id, 'rejected') ? <Spinner size={12} /> : null}
                                    REJECT
                                  </button>
                                </>
                              )}
                              {user.status === 'approved' && (
                                <button
                                  onClick={() => handleSendQR(user._id)}
                                  disabled={isRowLoading(user._id, 'sendqr')}
                                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-2"
                                >
                                  {isRowLoading(user._id, 'sendqr') ? <Spinner size={12} /> : null}
                                  Send QR
                                </button>
                              )}
                              <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
                              <button onClick={() => { setEditingUser(user); setIsEditModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit size={18}/></button>
                              <button
                                onClick={() => handleDeleteUser(user._id, 'user')}
                                disabled={isRowLoading(user._id, 'delete')}
                                className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-50 transition-all"
                              >
                                {isRowLoading(user._id, 'delete') ? <Spinner size={16} className="text-red-400" /> : <Trash2 size={18}/>}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <>
                      {/* Skeleton rows while loading trainers */}
                      {loadingTrainers && [1,2,3].map(i => <SkeletonRow key={i} cols={4} />)}

                      {trainers.length === 0 && !loadingTrainers && (
                        <tr>
                          <td colSpan="5" className="px-10 py-20 text-center">
                            <p className="text-slate-500 font-medium italic">No trainers registered yet.</p>
                          </td>
                        </tr>
                      )}
                      {trainers.map((trainer) => (
                        <tr key={trainer._id} className="hover:bg-slate-50 transition-all group">
                          <td className="px-10 py-8">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{trainer.name}</span>
                              <span className="text-slate-400 text-[10px] font-mono mt-1 font-bold">{trainer.email}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-slate-700 text-xs font-black">{trainer.contactNumber}</td>
                          <td className="px-10 py-8">
                            <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold">Active</span>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="flex justify-end items-center space-x-2">
                              <button
                                onClick={() => fetchTrainerEarnings(trainer._id)}
                                disabled={isRowLoading(trainer._id, 'earnings')}
                                className="p-2 text-slate-400 hover:text-green-600 disabled:opacity-50 transition-all"
                                title="View Earnings"
                              >
                                {isRowLoading(trainer._id, 'earnings') ? <Spinner size={16} className="text-green-500" /> : <DollarSign size={18}/>}
                              </button>
                              <button onClick={() => { setEditingUser(trainer); setIsEditModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit size={18}/></button>
                              <button
                                onClick={() => handleDeleteUser(trainer._id, 'trainer')}
                                disabled={isRowLoading(trainer._id, 'delete')}
                                className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-50 transition-all"
                              >
                                {isRowLoading(trainer._id, 'delete') ? <Spinner size={16} className="text-red-400" /> : <Trash2 size={18}/>}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'plans' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Skeleton plan cards while loading */}
            {loadingPlans && [1,2,3].map(i => <SkeletonCard key={i} />)}

            {!loadingPlans && plans.map((plan) => (
              <div key={plan._id} className={`bg-white p-8 rounded-[2.5rem] shadow-sm shadow-indigo-500/5 relative overflow-hidden transition-all hover:scale-[1.02] border ${plan.isActive ? 'border-slate-100 hover:border-indigo-500/30' : 'border-red-100 grayscale opacity-80'}`}>
                <div className="absolute top-0 right-0 p-6">
                  <button onClick={() => { setEditingPlan(plan); setNewPlan({ ...plan, features: plan.features.join(', ') }); setIsPlanModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit size={18} /></button>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    disabled={isRowLoading(plan._id, 'delete')}
                    className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-50 transition-all"
                  >
                    {isRowLoading(plan._id, 'delete') ? <Spinner size={16} className="text-red-400" /> : <Trash2 size={18} />}
                  </button>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-black text-indigo-600">Rs.{plan.price}</span>
                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest pl-2">/ {plan.durationMonths} Months</span>
                  </div>
                </div>

                <p className="text-slate-500 text-sm mb-8 font-medium line-clamp-2 leading-relaxed">{plan.description}</p>
                
                <div className="space-y-4 mb-10">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                      <CheckCircle2 size={14} className="text-indigo-500" />
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleTogglePlan(plan._id)}
                  disabled={isRowLoading(plan._id, 'toggle') || isRowLoading(plan._id, 'delete')}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                    plan.isActive ? 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600' : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  {isRowLoading(plan._id, 'toggle') ? <Spinner size={14} /> : null}
                  {plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                </button>
              </div>
            ))}
            {!loadingPlans && plans.length === 0 && (
              <div className="col-span-full py-24 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
                <p className="text-slate-400 font-bold italic tracking-widest uppercase text-xs">No active plans found.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {loadingRevenue ? (
                 <>
                   <SkeletonStatCard />
                   <SkeletonStatCard />
                 </>
               ) : (
                 <>
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-green-500/5">
                 <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-8 border border-green-100">
                   <DollarSign size={28} />
                 </div>
                 <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-2">Aggregate Revenue</p>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">Rs.{revenueStats.total.toLocaleString()}</h3>
               </div>
               
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-orange-500/5">
                 <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-8 border border-orange-100">
                   <History size={28} />
                 </div>
                 <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-2">Pending Fees</p>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                   {payments.filter(p => p.status === 'pending').length}
                 </h3>
               </div>
               </>
               )}

               <div className="bg-white p-8 rounded-[2.5rem] col-span-1 lg:col-span-2 border border-slate-100 shadow-sm">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8">Financial Scaling</h4>
                 <div className="flex items-end gap-3 h-24">
                   {revenueStats.monthly.map((m, i) => (
                     <div key={i} className="flex-1 bg-indigo-50 hover:bg-indigo-100 border-x border-t border-indigo-100/50 rounded-t-xl relative group transition-all" style={{ height: `${(m.amount / (Math.max(...revenueStats.monthly.map(x => x.amount)) || 1)) * 100}%` }}>
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-xl whitespace-nowrap z-20">
                         Rs.{m.amount.toLocaleString()}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            {/* Payment Transactions Table */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-xl font-black flex items-center gap-4 text-slate-900 tracking-tight">
                  <CreditCard size={24} className="text-indigo-600" />
                  Financial Records
                </h3>
                <button 
                  onClick={() => generateFinancePDF(payments, revenueStats)}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                  <FileText size={14} />
                  Export Financial Report
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                      <th className="px-10 py-6">Member</th>
                      <th className="px-10 py-6">Plan Info</th>
                      <th className="px-10 py-6">Method</th>
                      <th className="px-10 py-6">Proof</th>
                      <th className="px-10 py-6">Status</th>
                      <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Skeleton rows while loading payments */}
                    {loadingPayments && [1,2,3].map(i => <SkeletonRow key={i} cols={6} />)}

                    {!loadingPayments && payments.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50 transition-all group">
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 uppercase tracking-tight">{p.user?.name}</span>
                            <span className="text-slate-400 text-[10px] font-mono font-bold">{p.user?.email}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="text-indigo-600 font-black text-[11px] uppercase tracking-wider">{p.plan?.name}</span>
                            <span className="text-slate-900 font-black text-lg">Rs.{p.amount.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{p.method}</span>
                        </td>
                        <td className="px-10 py-8">
                          {p.paymentSlipUrl ? (
                            <a href={`${API_BASE_URL}${p.paymentSlipUrl}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 transition-all p-2 bg-indigo-50 rounded-xl border border-indigo-100 inline-block"><Eye size={20} /></a>
                          ) : <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Cash Receipt</span>}
                        </td>
                        <td className="px-10 py-8">
                           <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            p.status === 'confirmed' ? 'bg-green-50 border-green-100 text-green-600' : 
                            p.status === 'rejected' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${p.status === 'confirmed' ? 'bg-green-600' : p.status === 'rejected' ? 'bg-red-600' : 'bg-indigo-600 animate-pulse'}`}></span>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right">
                          {p.status === 'pending' && (
                            <div className="flex justify-end gap-3 text-xs">
                               <button
                                 onClick={() => handleConfirmPayment(p._id)}
                                 disabled={isRowLoading(p._id, 'confirm') || isRowLoading(p._id, 'reject')}
                                 className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-green-600/10 transition-all flex items-center gap-2"
                               >
                                 {isRowLoading(p._id, 'confirm') ? <Spinner size={12} /> : null}
                                 APPROVE
                               </button>
                               <button
                                 onClick={() => handleRejectPayment(p._id)}
                                 disabled={isRowLoading(p._id, 'confirm') || isRowLoading(p._id, 'reject')}
                                 className="text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60 border border-red-100 font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                               >
                                 {isRowLoading(p._id, 'reject') ? <Spinner size={12} /> : null}
                                 REJECT
                               </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!loadingPayments && payments.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-10 py-24 text-center text-slate-400 font-bold italic tracking-widest uppercase text-xs">No transaction records detected.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hire Trainer Modal */}
      {isHireModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg max-h-[90vh] rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
             <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-100 bg-indigo-50/30 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center">
                  <UserPlus className="mr-2 md:mr-3 text-indigo-600" size={20} />
                  Staff Recruitment
                </h3>
                <p className="text-slate-500 text-sm mt-1 font-medium italic">Credentials will be auto-generated</p>
              </div>
              <button onClick={() => setIsHireModalOpen(false)} className="p-2 hover:bg-white/50 rounded-full text-slate-400 transition-colors"><XCircle size={24} className="md:w-7 md:h-7" /></button>
            </div>
            <form onSubmit={handleHireTrainer} className="p-6 md:p-10 space-y-6 overflow-y-auto">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block px-1">Full Name</label>
                <input type="text" placeholder="e.g. David Smith" value={newTrainer.name} onChange={(e) => setNewTrainer({...newTrainer, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all" required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block px-1">Work Email</label>
                <input type="email" placeholder="trainer@gym.com" value={newTrainer.email} onChange={(e) => setNewTrainer({...newTrainer, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all" required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block px-1">Contact Number</label>
                <input type="text" placeholder="+94 7X XXX XXXX" value={newTrainer.contactNumber} onChange={(e) => setNewTrainer({...newTrainer, contactNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all" required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block px-1">Home Address</label>
                <textarea placeholder="Residential address..." value={newTrainer.address} onChange={(e) => setNewTrainer({...newTrainer, address: e.target.value})} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all resize-none" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block px-1">Hourly Rate (Rs.)</label>
                  <input type="number" placeholder="2500" value={newTrainer.hourlyRate} onChange={(e) => setNewTrainer({...newTrainer, hourlyRate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all" required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block px-1">Years Experience</label>
                  <input type="number" placeholder="5" value={newTrainer.yearsExperience} onChange={(e) => setNewTrainer({...newTrainer, yearsExperience: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block px-1">Specialization</label>
                <input type="text" placeholder="Weight Loss, HIIT, etc." value={newTrainer.specialization} onChange={(e) => setNewTrainer({...newTrainer, specialization: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all" />
              </div>
              <button type="submit" disabled={actionLoading} className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3">
                {actionLoading ? <><Spinner size={16} /> Processing...</> : 'Verify & Recruit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-lg max-h-[90vh] rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
            <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Identity Update</h3>
                <p className="text-slate-500 text-sm mt-1 font-medium">Modifying {editingUser.role} parameters</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><XCircle size={24} className="md:w-7 md:h-7" /></button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6 md:p-10 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block px-1">Full Name</label>
                  <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10" placeholder="Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block px-1">Mobile</label>
                  <input type="text" value={editingUser.contactNumber} onChange={(e) => setEditingUser({...editingUser, contactNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10" placeholder="Contact" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block px-1">Email</label>
                <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10" placeholder="Email" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block px-1">Location</label>
                <textarea value={editingUser.address} onChange={(e) => setEditingUser({...editingUser, address: e.target.value})} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none" placeholder="Address" />
              </div>

              {editingUser.role === 'trainer' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block px-1">Hourly Rate (Rs.)</label>
                      <input type="number" value={editingUser.hourlyRate} onChange={(e) => setEditingUser({...editingUser, hourlyRate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10" placeholder="Rate" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block px-1">Experience (Yrs)</label>
                      <input type="number" value={editingUser.yearsExperience} onChange={(e) => setEditingUser({...editingUser, yearsExperience: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10" placeholder="Years" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block px-1">Specialization</label>
                    <input type="text" value={editingUser.specialization} onChange={(e) => setEditingUser({...editingUser, specialization: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10" placeholder="Specialization" />
                  </div>
                </>
              )}

              <div className="pt-4 flex space-x-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={actionLoading} className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-600 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={actionLoading} className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-60 flex items-center justify-center gap-2">
                  {actionLoading ? <><Spinner size={14} /> Saving...</> : 'Commit Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Membership Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 w-full max-w-xl max-h-[90vh] rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
            <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30 shrink-0">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                  <CreditCard className="text-indigo-600 md:w-6 md:h-6" size={20} />
                  {editingPlan ? 'Refine Tier' : 'Establish Tier'}
                </h3>
                <p className="text-slate-500 text-sm mt-1 font-medium italic">Define membership parameters</p>
              </div>
              <button onClick={() => setIsPlanModalOpen(false)} className="p-2 hover:bg-white/50 rounded-full text-slate-400 transition-colors"><XCircle size={24} className="md:w-7 md:h-7" /></button>
            </div>
            
            <form onSubmit={handleSavePlan} className="p-6 md:p-10 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tier Identity</label>
                  <input type="text" placeholder="e.g. Platinum" value={newPlan.name} onChange={(e) => setNewPlan({...newPlan, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Financial Value (Rs.)</label>
                  <input type="number" placeholder="5000" value={newPlan.price} onChange={(e) => setNewPlan({...newPlan, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Temporal Scope (Mo)</label>
                  <input type="number" placeholder="3" value={newPlan.durationMonths} onChange={(e) => setNewPlan({...newPlan, durationMonths: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Strategic Description</label>
                  <input type="text" placeholder="Perfect for beginners" value={newPlan.description} onChange={(e) => setNewPlan({...newPlan, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Comprehensive Features (CSV)</label>
                <textarea placeholder="Free Wifi, Personal Trainer, Sauna" value={newPlan.features} onChange={(e) => setNewPlan({...newPlan, features: e.target.value})} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/10 resize-none" required />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="submit" disabled={actionLoading} className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.01] transition-all disabled:opacity-60 flex items-center justify-center gap-3">
                  {actionLoading ? <><Spinner size={16} /> Processing...</> : (editingPlan ? 'Update Strategic Plan' : 'Establish Strategic Tier')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trainer Earnings Modal */}
      {isEarningsModalOpen && (
        <EarningsModal 
          earnings={selectedTrainerEarnings} 
          onClose={() => setIsEarningsModalOpen(false)} 
        />
      )}
    </div>
  );
}

// Sub-component for Trainer Earnings Modal
function EarningsModal({ earnings, onClose }) {
  if (!earnings) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 w-full max-w-3xl max-h-[90vh] rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
        <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30 shrink-0">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight gap-2 md:gap-3 flex items-center">
              <DollarSign className="text-green-600 md:w-7 md:h-7" size={20} />
              Earnings Statement
            </h3>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">Performance-based financial overview</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full text-slate-400 transition-colors"><XCircle size={24} className="md:w-7 md:h-7" /></button>
        </div>
        
        <div className="p-6 md:p-10 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Aggregate Sessions</p>
              <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{earnings.sessionsCount} <span className="text-sm font-bold text-slate-400 ml-1">UNITS</span></h4>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Gross Payout</p>
              <h4 className="text-3xl font-black text-indigo-600 tracking-tighter">Rs.{earnings.totalEarnings.toLocaleString()}</h4>
            </div>
          </div>

          <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-2">Completion History</h5>
          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
            {earnings.sessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group">
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{s.user?.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(s.date).toLocaleDateString()} • {s.timeSlot}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900 tracking-tighter">Rs.{s.priceAtBooking}</p>
                  <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest">Commission Locked</p>
                </div>
              </div>
            ))}
            {earnings.sessions.length === 0 && (
              <div className="py-12 text-center text-slate-400 font-bold italic text-xs uppercase tracking-widest">No completed sessions found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add EarningsModal to the bottom of the JSX before closing the main div
// This is handled by appending the component and then inserting the call in the main return

export default AdminDashboard;
