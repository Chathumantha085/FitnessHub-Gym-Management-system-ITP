import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  User, 
  CreditCard, 
  Calendar, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Menu,
  X,
  Bell,
  ChevronRight,
  TrendingUp,
  Activity,
  Award,
  History,
  LogIn,
  LogOut as LogOutIcon,
  Edit,
  Save,
  UserCircle,
  UserX,
  ShieldOff,
  Trash2,
  XCircle,
  Utensils,
  Dumbbell,
  Check,
  Sparkles
} from 'lucide-react';
import api from '../api/axios';
import AIChatbot from '../components/AIChatbot';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://tan-salamander-545528.hostingersite.com';

const MemberDashboard = () => {
  const [userData, setUserData] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user')) || {};
    return { ...savedUser, _id: savedUser._id || savedUser.id };
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentFile, setPaymentFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Nutrition & Training State
  const [activeDiet, setActiveDiet] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [bookingData, setBookingData] = useState({ date: '', timeSlot: '', notes: '', recurrence: 'none', duration: 1 });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [busyDates, setBusyDates] = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  
  // Feedback State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedBookingForFeedback, setSelectedBookingForFeedback] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ rating: 5, comment: '' });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [adherenceLoading, setAdherenceLoading] = useState(false);


  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (userData._id) {
      if (activeTab === 'attendance' || activeTab === 'dashboard') {
        fetchAttendance();
        fetchMembershipData();
        fetchTrainingData();
      }
      if (activeTab === 'membership') {
        fetchMembershipData();
      }
      if (activeTab === 'nutrition') {
        fetchDietData();
      }
      if (activeTab === 'training') {
        fetchTrainingData();
      }
    }
  }, [activeTab, userData._id]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);
  
  useEffect(() => {
    if (isBookingModalOpen && selectedTrainer) {
      fetchBusyDates();
    }
  }, [selectedTrainer, isBookingModalOpen]);

  useEffect(() => {
    if (isBookingModalOpen && selectedTrainer && bookingData.date) {
      fetchAvailability();
    }
  }, [bookingData.date, selectedTrainer, isBookingModalOpen]);


  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const freshUser = response.data.data;
      setUserData(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/attendance/user/${userData._id}`);
      setAttendanceHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembershipData = async () => {
    try {
      setIsLoading(true);
      const [plansRes, subRes] = await Promise.all([
        api.get('/membership/plans'),
        api.get('/membership/me')
      ]);
      setPlans(plansRes.data.data);
      setSubscription(subRes.data.data);
    } catch (error) {
      console.error('Error fetching membership data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDietData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/diets/my-plan');
      setActiveDiet(response.data.data);
    } catch (err) {
      console.error('Error fetching diet data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrainingData = async () => {
    try {
      setIsLoading(true);
      const [trainersRes, bookingsRes] = await Promise.all([
        api.get('/bookings/trainers'),
        api.get('/bookings/my-appointments')
      ]);
      setTrainers(trainersRes.data.data);
      setMyBookings(bookingsRes.data.data);
    } catch (err) {
      console.error('Error fetching training data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchBusyDates = async () => {
    try {
      setAvailabilityLoading(true);
      const response = await api.get('/bookings/busy-dates', {
        params: { trainerId: selectedTrainer._id }
      });
      setBusyDates(response.data.data || {});
    } catch (err) {
      console.error('Error fetching busy dates:', err);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      const response = await api.get('/bookings/availability', {
        params: {
          trainerId: selectedTrainer._id,
          date: bookingData.date
        }
      });
      const slots = response.data.bookedSlots || [];
      setBookedSlots(slots);
      
      // Reset selected slot if it's now booked
      if (slots.includes(bookingData.timeSlot)) {
        setBookingData(prev => ({ ...prev, timeSlot: '' }));
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const logMealAdherence = async (mealIndex) => {
    try {
      setAdherenceLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayLog = activeDiet?.adherenceLogs?.find(l => new Date(l.date).getTime() === today.getTime());
      let mealsConsumed = todayLog ? [...todayLog.mealsConsumed] : [];
      
      if (mealsConsumed.includes(mealIndex)) {
        mealsConsumed = mealsConsumed.filter(id => id !== mealIndex);
      } else {
        mealsConsumed.push(mealIndex);
      }

      const response = await api.post('/diets/log', {
        mealsConsumed,
        remarks: 'Daily meal log'
      });
      
      if (response.data.success && response.data.data) {
        setActiveDiet(response.data.data);
      }
      setSuccess('Nutritional log updated!');
    } catch (err) {
      console.error('Adherence log error:', err);
      setError('Failed to log nutritional data');
    } finally {
      setAdherenceLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.post('/bookings', {
        trainerId: selectedTrainer._id,
        ...bookingData
      });
      setSuccess('Session request transmitted successfully!');
      setIsBookingModalOpen(false);
      setBookingData({ date: '', timeSlot: '', notes: '', recurrence: 'none', duration: 1 });
      fetchTrainingData();
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to request session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      setFeedbackLoading(true);
      await api.post(`/bookings/${selectedBookingForFeedback._id}/feedback`, feedbackData);
      setSuccess('Feedback submitted successfully. Thank you for optimizing our performance!');
      setIsFeedbackModalOpen(false);
      setFeedbackData({ rating: 5, comment: '' });
      fetchTrainingData();
    } catch (err) {
      console.error('Feedback error:', err);
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const response = await api.put('/auth/profile', editedData);
      setUserData(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      setIsEditMode(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }

  };

  const handleDeactivateAccount = async () => {
    const confirm = window.confirm(
      "Are you sure you want to deactivate your account? This action will prevent you from logging in until an admin re-activates your account."
    );
    
    if (confirm) {
      try {
        setIsLoading(true);
        await api.delete('/auth/deactivate');
        localStorage.clear();
        window.location.reload();
      } catch (err) {
        console.error('Error deactivating account:', err);
        setError(err.response?.data?.message || 'Failed to deactivate account');
      } finally {
        setIsLoading(false);
      }

    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!paymentFile) return setError('Please upload your payment slip');
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('planId', selectedPlan._id);
      formData.append('amount', selectedPlan.price);
      formData.append('method', 'slip');
      formData.append('paymentSlip', paymentFile);

      await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Subscription request submitted! Please wait for admin approval.');
      setIsSubscriptionModalOpen(false);
      fetchMembershipData();
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.response?.data?.message || 'Failed to submit subscription');
    } finally {
      setUploading(false);
    }

  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'attendance', icon: History, label: 'Attendance' },
    { id: 'profile', icon: User, label: 'My Profile' },
    { id: 'membership', icon: CreditCard, label: 'Membership' },
    { id: 'nutrition', icon: Utensils, label: 'Nutrition' },
    { id: 'training', icon: Dumbbell, label: 'Training' },
    { id: 'schedule', icon: Calendar, label: 'Class Schedule' },
  ];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return { 
          icon: CheckCircle2, 
          color: 'text-green-600', 
          bg: 'bg-green-50', 
          border: 'border-green-100',
          label: 'Active Member'
        };
      case 'rejected':
        return { 
          icon: AlertCircle, 
          color: 'text-red-600', 
          bg: 'bg-red-50', 
          border: 'border-red-100',
          label: 'Membership Rejected'
        };
      default:
        return { 
          icon: Clock, 
          color: 'text-indigo-600', 
          bg: 'bg-indigo-50', 
          border: 'border-indigo-100',
          label: 'Verification Pending'
        };
    }
  };

  const status = getStatusConfig(userData.status);

  const renderAttendanceTab = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Attendance Vault</h3>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm shadow-indigo-500/5">
            <LogIn size={20} className="text-indigo-600" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-900">{attendanceHistory.length} Sessions Logged</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm shadow-indigo-500/5">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <th className="px-10 py-6">Date</th>
              <th className="px-10 py-6">Entry</th>
              <th className="px-10 py-6">Exit</th>
              <th className="px-10 py-6">Volume</th>
              <th className="px-10 py-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-10 py-24 text-center text-slate-400 font-bold italic uppercase tracking-widest text-xs">Synchronizing history...</td>
              </tr>
            ) : attendanceHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-10 py-24 text-center text-slate-400 font-bold italic uppercase tracking-widest text-xs">No entries detected in our database.</td>
              </tr>
            ) : (
              attendanceHistory.map((record) => (
                <tr key={record._id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-10 py-8 font-black text-slate-900 uppercase tracking-tighter">{record.date}</td>
                  <td className="px-10 py-8 text-sm text-slate-500 font-bold font-mono">
                    {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-10 py-8 text-sm text-slate-500 font-bold font-mono">
                    {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-10 py-8 text-[11px] text-indigo-600 font-black uppercase tracking-wider">
                    {record.duration ? `${record.duration} mins` : 'In Progress'}
                  </td>
                  <td className="px-10 py-8 text-right">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${record.checkOut ? 'bg-green-50 border-green-100 text-green-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600 animate-pulse'}`}>
                      {record.checkOut ? 'Archived' : 'Live Session'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderProfileTab = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">Profile Command</h3>
          <p className="text-slate-500 font-medium mt-1 italic">Maintain your operational parameters</p>
        </div>
        {!isEditMode && (
          <button 
            onClick={() => {
              setEditedData({
                name: userData.name,
                email: userData.email,
                contactNumber: userData.contactNumber,
                address: userData.address
              });
              setIsEditMode(true);
            }}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-600/20"
          >
            <Edit size={18} />
            Modify Data
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Profile Stats Sidebar */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] text-center relative overflow-hidden border border-slate-200 shadow-sm shadow-indigo-500/5 group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
            <div className="w-28 h-28 mx-auto bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-center mb-6 relative z-10 shadow-inner group-hover:scale-110 transition-transform">
              <UserCircle size={56} className="text-indigo-600" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2 italic">{userData.name}</h4>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Registered Member</p>
            
            <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${status.bg} ${status.color} ${status.border} shadow-sm`}>
               <span className={`w-2 h-2 rounded-full ${userData.status === 'approved' ? 'bg-green-600' : 'bg-indigo-600'}`}></span>
               {status.label}
            </div>
          </div>

          <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 shadow-sm">
            <h5 className="text-red-600 text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-3 italic">
              <ShieldOff size={18} />
              Termination Protocol
            </h5>
            <p className="text-slate-500 text-xs mb-8 leading-relaxed font-medium">
              Initiating deactivation will permanently restrict access to performance data and gym logistics.
            </p>
            <button 
              onClick={handleDeactivateAccount}
              className="w-full py-4 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
            >
              Confirm Deactivation
            </button>
          </div>
        </div>

        {/* Edit Integration */}
        <div className="lg:col-span-3">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Identity Name</label>
                  <input 
                    type="text" 
                    value={isEditMode ? editedData.name : userData.name} 
                    onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                    disabled={!isEditMode}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 disabled:opacity-50 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Comms Email</label>
                  <input 
                    type="email" 
                    value={isEditMode ? editedData.email : userData.email}
                    onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                    disabled={!isEditMode}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 disabled:opacity-50 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Mobile Comms</label>
                  <input 
                    type="text" 
                    value={isEditMode ? editedData.contactNumber : userData.contactNumber}
                    onChange={(e) => setEditedData({...editedData, contactNumber: e.target.value})}
                    disabled={!isEditMode}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 disabled:opacity-50 transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Registry Code</label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black text-slate-500 tracking-widest shadow-inner">
                    UID-{userData._id?.slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Physical Locale</label>
                <textarea 
                  rows="3" 
                  value={isEditMode ? editedData.address : userData.address}
                  onChange={(e) => setEditedData({...editedData, address: e.target.value})}
                  disabled={!isEditMode}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 disabled:opacity-50 transition-all resize-none shadow-sm"
                />
              </div>

              {isEditMode && (
                <div className="flex gap-6 pt-6">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 hover:bg-indigo-700"
                  >
                    {isSaving ? <Clock className="animate-spin" size={18} /> : <Save size={18} />}
                    {isSaving ? 'Synchronizing...' : 'Commit Data'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditMode(false)}
                    className="flex-1 py-5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-sm"
                  >
                    Abort
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row relative">
      <div className="fixed top-6 right-6 z-[60] flex flex-col gap-3">
        {success && (
          <div className="bg-green-600 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-green-600/20 animate-in fade-in slide-in-from-top-4 flex items-center">
            <CheckCircle2 size={18} className="mr-3" />
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-600 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-red-600/20 animate-in fade-in slide-in-from-top-4 flex items-center">
            <AlertCircle size={18} className="mr-3" />
            {error}
          </div>
        )}
      </div>

      {/* Mobile Top Bar */}
      <header className="lg:hidden bg-white border-b border-slate-200 p-6 sticky top-0 z-40 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Gym<span className="text-indigo-600">Member</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational Dashboard</p>
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
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-80 bg-white border-r border-slate-200 p-8 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto shrink-0 shadow-2xl lg:shadow-none shadow-indigo-500/10`}>
            <div className="flex items-center space-x-4 mb-12 px-2">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/20 uppercase tracking-tighter">
                {userData.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{userData.name}</h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2 px-1 py-0.5 bg-slate-50 rounded-lg w-fit border border-slate-100">Member</p>
              </div>
            </div>

            <nav className="space-y-2 flex-1">
              <button 
                onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                <LayoutDashboard size={20} />
                <span>Overview</span>
              </button>
              <button 
                onClick={() => { setActiveTab('attendance'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                <History size={20} />
                <span>Attendance</span>
              </button>
              <button 
                onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                <User size={20} />
                <span>Account</span>
              </button>
              <button 
                onClick={() => { setActiveTab('membership'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'membership' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                <CreditCard size={20} />
                <span>Plan</span>
              </button>
              <button 
                onClick={() => { setActiveTab('nutrition'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'nutrition' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                <Utensils size={20} />
                <span>Nutrition</span>
              </button>
              <button 
                onClick={() => { setActiveTab('training'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'training' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                <Dumbbell size={20} />
                <span>Training</span>
              </button>
            </nav>

            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-6">
               <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>

            </div>
      </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-6 lg:p-12 space-y-10 overflow-x-hidden">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">{activeTab === 'dashboard' ? 'Overview' : activeTab} Hub</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Operational view of your fitness journey</p>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-[1.5rem] border border-slate-200">
               <div className="px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                 <span className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</span>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${userData.status === 'approved' ? 'text-green-600' : 'text-indigo-600 animate-pulse'}`}>
                   {userData.status}
                 </span>
               </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-8"
              >
                {/* Hero / Status Section */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  <div className="lg:col-span-3 bg-white border border-slate-200 p-10 rounded-[3rem] relative overflow-hidden shadow-sm shadow-indigo-500/5 group">
                    <div className="relative z-10">
                      <h1 className="text-4xl font-black mb-3 text-slate-900 tracking-tighter uppercase italic">
                        Salutations, <span className="text-indigo-600">{userData.name.split(' ')[0]}!</span>
                      </h1>
                      <p className="text-slate-500 font-medium mb-8 italic">Operational synchronization complete. Your fitness trajectory is looking optimal.</p>
                      
                      <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border ${status.bg} ${status.color} ${status.border} shadow-sm`}>
                        <status.icon size={20} className={userData.status === 'pending' ? 'animate-pulse' : ''} />
                        <span className="text-[11px] font-black tracking-widest uppercase">{status.label}</span>
                      </div>

                      {userData.status === 'rejected' && userData.rejectReason && (
                        <div className="mt-6 p-5 bg-red-50 border border-red-100 rounded-2xl max-w-lg">
                          <p className="text-xs text-red-600 font-bold uppercase tracking-wider">
                            <span className="opacity-60 block mb-1">Rejection Reason:</span> {userData.rejectReason}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <TrendingUp className="absolute -bottom-6 -right-6 w-48 h-48 text-indigo-500/5 group-hover:text-indigo-500/10 transition-all duration-700 -rotate-12" />
                  </div>

                  <div className="lg:col-span-2 bg-indigo-600 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20 group">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div>
                        <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em] mb-2">Member Tier</p>
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase whitespace-nowrap">
                          {subscription?.plan?.name || 'NO ACTIVE PLAN'}
                        </h3>
                      </div>
                      <div className="mt-auto">
                        <p className="text-[10px] font-black opacity-60 mb-2 uppercase tracking-widest">Internal ID</p>
                        <p className="font-mono text-2xl font-black tracking-tighter">UID-{userData._id?.slice(-6).toUpperCase() || 'MEMBER'}</p>
                      </div>
                    </div>
                    <CreditCard className="absolute -top-10 -right-10 w-40 h-40 opacity-10 rotate-12 group-hover:rotate-6 transition-transform duration-700" />
                  </div>
                </motion.div>

                {/* Metrics Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: LogIn, label: 'Sessions', value: attendanceHistory.length, color: 'text-indigo-600', bg: 'bg-indigo-50', unit: 'Total' },
                    { icon: Award, label: 'Plan Status', value: subscription?.status || 'N/A', color: 'text-emerald-600', bg: 'bg-emerald-50', unit: 'Current' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm shadow-indigo-500/5 group hover:border-indigo-500/30 transition-all">
                      <div className={`p-4 w-fit rounded-2xl ${stat.bg} mb-6 ${stat.color} border border-transparent group-hover:border-current/10 transition-all`}>
                        <stat.icon size={24} />
                      </div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{stat.value}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.unit}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <motion.section variants={itemVariants} className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                      <h3 className="text-xl font-black flex items-center gap-4 text-slate-900 tracking-tight uppercase italic">
                        <Calendar className="text-indigo-600" size={24} />
                        Session Queue
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      {myBookings.length > 0 ? (
                        myBookings.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:scale-[1.02] transition-all">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner shrink-0">
                              <span className="text-[10px] font-black uppercase tracking-widest">{new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-slate-900 uppercase tracking-tight truncate">{item.trainer?.name || 'TRAINING SESSION'}</h4>
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1 truncate">{item.timeSlot} • {item.status}</p>
                            </div>
                            <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shrink-0 ${
                              item.status === 'confirmed' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                            }`}>
                              {item.status}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 bg-white border border-dashed border-slate-200 rounded-[2rem] text-center">
                          <p className="text-slate-400 font-bold italic py-4 uppercase text-[10px] tracking-widest">No active session deployments detected.</p>
                          <button 
                            onClick={() => setActiveTab('training')}
                            className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] hover:underline"
                          >
                            Initialize Sync
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.section>

                  <motion.section variants={itemVariants} className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                      <h3 className="text-xl font-black flex items-center gap-4 text-slate-900 tracking-tight uppercase italic">
                        <Clock className="text-indigo-600" size={24} />
                        Activity Logs
                      </h3>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                      <div className="space-y-10 relative">
                        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-slate-50 shadow-inner group-hover:bg-indigo-50 transition-colors"></div>
                        
                        {attendanceHistory.slice(0, 3).map((record, idx) => (
                          <div key={idx} className="relative flex gap-8 items-start">
                            <div className={`w-6 h-6 rounded-full ${record.checkOut ? 'bg-green-600' : 'bg-indigo-600'} border-4 border-white flex items-center justify-center z-10 shadow-md`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            </div>
                            <div className="-mt-1">
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{record.date}</p>
                              <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{record.checkOut ? 'Operational Phase Complete' : 'Session Initialization Recorded'}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 italic">
                                {record.checkOut ? `Volume: ${record.duration} mins` : `Timestamp: ${new Date(record.checkIn).toLocaleTimeString()}`}
                              </p>
                            </div>
                          </div>
                        ))}
                        {attendanceHistory.length === 0 && (
                          <div className="text-center text-slate-400 font-bold italic py-8 uppercase text-xs tracking-widest">No recent data sequences.</div>
                        )}
                      </div>
                    </div>
                  </motion.section>
                </div>
              </motion.div>
            )}

            {activeTab === 'attendance' && renderAttendanceTab()}
            {activeTab === 'profile' && renderProfileTab()}

            {activeTab === 'membership' && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
                {/* Active Membership Tier */}
                <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] relative overflow-hidden shadow-sm shadow-indigo-500/5">
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic mb-2">Subscription Logic</h3>
                      <p className="text-slate-500 font-medium italic">Active parameters for your gym facility access.</p>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Active Tier</p>
                        <p className="text-3xl font-black text-indigo-600 uppercase italic tracking-tighter">
                          {subscription ? subscription.plan?.name : 'No Active Plan'}
                        </p>
                      </div>
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${subscription?.status === 'active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {subscription?.status === 'active' ? <CheckCircle2 size={36} /> : <AlertCircle size={36} />}
                      </div>
                    </div>
                  </div>

                  {subscription && (
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-100">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initiation Date</p>
                        <p className="font-black text-slate-900 uppercase tracking-tighter">{new Date(subscription.startDate).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Termination Date</p>
                        <p className="font-black text-slate-900 uppercase tracking-tighter">{new Date(subscription.endDate).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Vector</p>
                        <div>
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${subscription.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {subscription.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Strategic Tier Selection */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between px-4">
                    <h3 className="text-xl font-black flex items-center gap-4 text-slate-900 tracking-tight uppercase italic">
                      <Award className="text-indigo-600" size={24} />
                      Tier Calibration
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                      <div key={plan._id} className="bg-white p-10 rounded-[3rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 border border-slate-200 shadow-sm shadow-indigo-500/5">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity -rotate-12 group-hover:rotate-0 duration-700">
                          <Award size={96} className="text-indigo-600" />
                        </div>
                        
                        <div className="mb-8 relative z-10">
                          <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">{plan.name}</h4>
                          <div className="flex items-baseline gap-2 mt-3">
                             <span className="text-4xl font-black text-indigo-600 tracking-tighter">Rs.{plan.price}</span>
                             <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">/ {plan.durationMonths} MO</span>
                          </div>
                        </div>

                        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed italic">{plan.description}</p>
                        
                        <div className="space-y-4 mb-10">
                          {plan.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-4 text-[11px] text-slate-600 font-black uppercase tracking-wider">
                              <CheckCircle2 size={16} className="text-indigo-600" />
                              {f}
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={() => { setSelectedPlan(plan); setIsSubscriptionModalOpen(true); }}
                          className="w-full py-5 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-inner border border-slate-200"
                        >
                          Initialize Tier
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div 
                key="schedule"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-center py-20 bg-white border border-slate-200 rounded-[3rem] shadow-sm"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic">Facility Logistics</h3>
                  <p className="text-slate-400 mt-2 font-medium italic">Personalized training schedules coming soon.</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'nutrition' && (
              <motion.div key="nutrition" variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
                <div className="bg-white border border-slate-200 p-12 rounded-[3rem] relative overflow-hidden shadow-sm shadow-indigo-500/5">
                  {activeDiet ? (
                    <div className="space-y-10">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div>
                          <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">{activeDiet.dietPlan?.name}</h3>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-3">Strategic Nutritional Protocol</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 flex flex-col items-center">
                             <span className="text-[9px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-1">Phase Start</span>
                             <span className="text-[10px] font-black uppercase text-indigo-600">{new Date(activeDiet.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="bg-rose-50 px-6 py-3 rounded-2xl border border-rose-100 flex flex-col items-center">
                             <span className="text-[9px] font-black uppercase text-rose-400 tracking-[0.2em] mb-1">Phase End</span>
                             <span className="text-[10px] font-black uppercase text-rose-600">{new Date(activeDiet.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="bg-green-50 px-6 py-3 rounded-2xl border border-green-100 flex flex-col items-center">
                             <span className="text-[9px] font-black uppercase text-green-400 tracking-[0.2em] mb-1">Status</span>
                             <span className="text-[10px] font-black uppercase text-green-600">{activeDiet.status}</span>
                          </div>
                        </div>
                      </div>

                      {activeDiet.dietPlan?.description && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-slate-500 text-sm">
                          {activeDiet.dietPlan.description}
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-3">
                             <Clock size={16} className="text-indigo-600" />
                             Today's Deployment
                           </h4>
                           <div className="space-y-4">
                             {activeDiet.dietPlan?.meals?.map((meal, idx) => {
                               const today = new Date();
                               today.setHours(0,0,0,0);
                               const todayLog = activeDiet.adherenceLogs?.find(l => new Date(l.date).getTime() === today.getTime());
                               const isDone = todayLog?.mealsConsumed?.includes(idx);
                               
                               return (
                                 <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group">
                                    <div className="flex items-center gap-6 w-full">
                                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isDone ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white text-indigo-600 border border-slate-200 shadow-inner'}`}>
                                          <span className="text-[10px] font-black">{meal.time}</span>
                                       </div>
                                       <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <h5 className="font-black text-slate-900 text-sm uppercase tracking-tight">{meal.food}</h5>
                                            <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest">{meal.day}</span>
                                          </div>
                                          <div className="grid grid-cols-5 gap-2 mt-2">
                                            {[
                                              { label: 'CAL', val: meal.calories, color: 'text-indigo-600' },
                                              { label: 'PRO', val: meal.protein, color: 'text-emerald-600' },
                                              { label: 'CARB', val: meal.carbs, color: 'text-amber-600' },
                                              { label: 'FAT', val: meal.fat, color: 'text-rose-600' }
                                            ].map((m, i) => (
                                              <div key={i} className="flex flex-col items-start px-2 py-1 rounded-lg bg-white/50 border border-slate-100 text-center">
                                                <span className="text-[7px] font-black text-slate-400 tracking-widest leading-none mb-1">{m.label}</span>
                                                <span className={`text-[9px] font-black ${m.color} leading-none`}>{m.val}</span>
                                              </div>
                                            ))}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                               );
                             })}
                           </div>
                        </div>

                        <div className="space-y-6">
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-3">
                             <TrendingUp size={16} className="text-indigo-600" />
                             Analytical Summary
                           </h4>
                           <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                 <div>
                                    <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Adherence Efficiency</p>
                                    <h4 className="text-4xl font-black italic tracking-tighter uppercase tabular-nums">
                                      {activeDiet.adherenceLogs ? Math.round((activeDiet.adherenceLogs.length / 30) * 100) : 0}%
                                    </h4>
                                 </div>
                                 <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${activeDiet.adherenceLogs ? Math.min(100, (activeDiet.adherenceLogs.length / 30) * 100) : 0}%` }}
                                      className="h-full bg-white shadow-lg"
                                    />
                                 </div>
                                 <p className="text-[10px] font-medium italic opacity-70 leading-relaxed">
                                   "Precision in strategy leads to optimization in performance. Maintain the cycle."
                                 </p>
                              </div>
                              <Sparkles className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
                           </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-24 text-center">
                       <Utensils size={48} className="mx-auto text-slate-200 mb-6" />
                       <h3 className="text-xl font-black text-slate-900 uppercase italic">Protocol Unauthorized</h3>
                       <p className="text-slate-400 font-medium italic mt-2">Engage with a professional staff member to receive your personalized strategic nutrition payload.</p>
                       <button 
                         onClick={() => setActiveTab('training')}
                         className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-[1.02] transition-all"
                       >
                         Initialize Training Engagement
                       </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'training' && (
              <motion.div key="training" variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
                <div className="flex justify-between items-center px-4">
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Coach Engagement</h3>
                   <div className="bg-white border border-slate-200 px-6 py-2 rounded-xl flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Scheduled Sessions</span>
                      <span className="text-sm font-black text-indigo-600">{myBookings.length}</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {trainers.map((trainer) => (
                     <div key={trainer._id} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:scale-[1.02] transition-all group relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 p-8 text-indigo-600/5 group-hover:text-indigo-600/10 transition-colors">
                           <Award size={80} />
                        </div>
                        <div className="flex items-center gap-6 mb-8">
                           <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center text-indigo-600 font-black text-3xl shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all overflow-hidden">
                              {trainer.profileImage ? (
                                <img src={`${API_BASE_URL}${trainer.profileImage}`} alt={trainer.name} className="w-full h-full object-cover" />
                              ) : (
                                trainer.name.charAt(0)
                              )}
                           </div>
                           <div className="flex-1">
                              <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic leading-none">{trainer.name}</h4>
                              <p className="text-indigo-600 text-[11px] font-black uppercase tracking-widest mt-3 flex items-center gap-2">
                                <Sparkles size={14} />
                                {trainer.specialization || 'Performance Specialist'}
                              </p>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-inner text-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Hourly Fee</p>
                              <p className="text-lg font-black text-indigo-600 tracking-tighter">Rs.{trainer.hourlyRate}</p>
                           </div>
                           <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-inner text-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Experience</p>
                              <p className="text-lg font-black text-slate-900 tracking-tighter">{trainer.yearsExperience} Yrs</p>
                           </div>
                        </div>

                        <div className="flex-1">
                           <p className="text-slate-500 text-sm font-medium italic mb-10 leading-relaxed">
                            {trainer.bio || 'This professional staff member is dedicated to optimizing member performance via strategic guidance.'}
                           </p>
                        </div>

                        <div className="flex flex-col gap-3">
                           <button 
                             onClick={() => { setSelectedTrainer(trainer); setIsBookingModalOpen(true); }}
                             className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98]"
                           >
                             Initialize Engagement
                           </button>
                        </div>
                     </div>
                   ))}
                </div>

                {myBookings.length > 0 && (
                   <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                      <div className="px-10 py-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                         <Calendar className="text-indigo-600" size={18} />
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">Confirmed Logistics</span>
                      </div>
                      <div className="overflow-x-auto">
                         <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-100">
                               {myBookings.map(b => (
                                 <tr key={b._id} className="hover:bg-slate-50 transition-all">
                                    <td className="px-10 py-6">
                                       <div className="font-black text-slate-900 uppercase tracking-tighter text-sm italic">{new Date(b.date).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-10 py-6">
                                       <div className="text-[10px] font-black uppercase text-indigo-600 tracking-widest italic">{b.timeSlot}</div>
                                    </td>
                                    <td className="px-10 py-6">
                                       <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-none">{b.trainer?.name}</div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                       <div className="flex items-center justify-end gap-4">
                                          {b.status === 'completed' && !b.feedback?.rating && (
                                             <button 
                                               onClick={() => { setSelectedBookingForFeedback(b); setIsFeedbackModalOpen(true); }}
                                               className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-[1.05] transition-all"
                                             >
                                               Feedback
                                             </button>
                                          )}
                                          <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shrink-0 ${
                                            b.status === 'completed' ? 'bg-green-50 border-green-100 text-green-600' : 
                                            b.status === 'confirmed' ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                                            b.status === 'cancelled' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                          }`}>
                                             {b.status}
                                          </span>
                                       </div>
                                    </td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Booking Modal Inclusion */}
          {selectedTrainer && isBookingModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
               <div className="bg-white border border-slate-200 w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 max-h-[95vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="px-12 py-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30 shrink-0">
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Initialize Training Plan</h3>
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-2">Strategic Deployment Protocol</p>
                     </div>
                     <button onClick={() => setIsBookingModalOpen(false)} className="p-2 hover:bg-white/50 rounded-full text-slate-400 transition-colors"><XCircle size={32} /></button>
                  </div>

                  {/* Modal Body (Scrollable) */}
                  <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                    {/* Trainer Summary */}
                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                        <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/20">
                          {selectedTrainer.name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Assigned Performance Coach</p>
                           <p className="font-black uppercase text-slate-900 text-lg tracking-tight italic">{selectedTrainer.name}</p>
                           <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{selectedTrainer.specialization}</p>
                        </div>
                    </div>

                    <form onSubmit={handleBooking} className="space-y-10">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Date Selection */}
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex justify-between items-center">
                               Phase Start Date
                               {bookingData.date && busyDates[bookingData.date] && (
                                 <span className="text-[9px] text-indigo-600 font-black animate-pulse">Occupied: {busyDates[bookingData.date].length} Slots</span>
                               )}
                             </label>
                             <input 
                               type="date" 
                               value={bookingData.date} 
                               onChange={(e) => setBookingData({...bookingData, date: e.target.value})} 
                               className={`w-full bg-slate-50 border ${bookingData.date && busyDates[bookingData.date] ? 'border-indigo-300 ring-2 ring-indigo-500/5' : 'border-slate-200'} rounded-[1.5rem] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all`} 
                               min={new Date().toISOString().split('T')[0]}
                               required 
                             />
                          </div>

                          {/* Time Slot Selection */}
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Operational Window</label>
                             <select 
                               value={bookingData.timeSlot} 
                               onChange={(e) => setBookingData({...bookingData, timeSlot: e.target.value})} 
                               className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50 transition-all" 
                               required
                               disabled={!bookingData.date || availabilityLoading}
                             >
                                <option value="">{availabilityLoading ? 'Synchronizing Availability...' : 'Select Training Window'}</option>
                                {['08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '04:00 PM - 05:00 PM', '05:00 PM - 06:00 PM', '06:00 PM - 07:00 PM'].map(slot => {
                                  const isBooked = bookedSlots.includes(slot);
                                  return (
                                    <option key={slot} value={slot} disabled={isBooked} className={isBooked ? 'text-slate-300' : ''}>
                                      {slot} {isBooked ? '(Occupied)' : ''}
                                    </option>
                                  );
                                })}
                             </select>
                          </div>
                       </div>

                       {/* Recurrence Configuration */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Recurrence Logic</label>
                             <select 
                               value={bookingData.recurrence} 
                               onChange={(e) => setBookingData({...bookingData, recurrence: e.target.value})} 
                               className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                             >
                                <option value="none">One Day Session</option>
                                <option value="daily">Daily Pattern</option>
                                <option value="weekly">Weekly Cycle</option>
                                <option value="weekdays">Weekday Ops (Mon-Fri)</option>
                                <option value="weekend">Weekend Ops (Sat-Sun)</option>
                             </select>
                          </div>

                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Duration Volume ({bookingData.recurrence === 'daily' ? 'Days' : 'Weeks'})</label>
                             <input 
                               type="number" 
                               min="1" 
                               max={bookingData.recurrence === 'daily' ? 30 : 12}
                               value={bookingData.duration} 
                               onChange={(e) => setBookingData({...bookingData, duration: parseInt(e.target.value) || 1})}
                               disabled={bookingData.recurrence === 'none'}
                               className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50 transition-all" 
                             />
                          </div>
                       </div>

                       {/* Summary Indicator */}
                       {bookingData.date && bookingData.recurrence !== 'none' && (
                         <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                           <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Activity size={14} />
                             Planned Training Sequence
                           </h5>
                           <div className="flex flex-wrap gap-2">
                              {/* Simple list of dates summary */}
                              <div className="text-[11px] font-black text-indigo-600 uppercase tracking-tight italic">
                                {bookingData.recurrence === 'weekly' && `Starting ${bookingData.date}, recurring every ${new Date(bookingData.date).toLocaleDateString([], {weekday: 'long'})} for ${bookingData.duration} weeks.`}
                                {bookingData.recurrence === 'daily' && `Starting ${bookingData.date}, recurring daily for ${bookingData.duration} days.`}
                                {bookingData.recurrence === 'weekdays' && `Training Mon-Fri starting from ${bookingData.date} for ${bookingData.duration} weeks.`}
                                {bookingData.recurrence === 'weekend' && `Training weekends starting from ${bookingData.date} for ${bookingData.duration} weeks.`}
                              </div>
                           </div>
                         </div>
                       )}

                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Operational Notes</label>
                         <textarea 
                           placeholder="Specify training focus or medical considerations..."
                           value={bookingData.notes}
                           onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none h-32 transition-all"
                         />
                       </div>

                       <button 
                         type="submit" 
                         disabled={isLoading} 
                         className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 active:scale-[0.98] flex items-center justify-center gap-4"
                       >
                          {isLoading ? <Clock className="animate-spin" size={20} /> : <Check size={20} />}
                          {isLoading ? 'Transmitting Data...' : 'Confirm Strategic Engagement'}
                       </button>
                    </form>
                  </div>
               </div>
            </div>
          )}

          {/* Subscription Modal Integration */}
          {selectedPlan && (
            <SubscriptionModal 
              isOpen={isSubscriptionModalOpen}
              onClose={() => setIsSubscriptionModalOpen(false)}
              plan={selectedPlan}
              onSubmit={handleSubscribe}
              setFile={setPaymentFile}
              uploading={uploading}
            />
          )}

          {isFeedbackModalOpen && selectedBookingForFeedback && (
            <FeedbackModal 
              booking={selectedBookingForFeedback}
              feedbackData={feedbackData}
              setFeedbackData={setFeedbackData}
              onSubmit={handleSubmitFeedback}
              onClose={() => setIsFeedbackModalOpen(false)}
              loading={feedbackLoading}
            />
          )}
        </main>
        <AIChatbot />
      </div>
  );
};

const FeedbackModal = ({ booking, feedbackData, setFeedbackData, onSubmit, onClose, loading }) => {
  if (!booking) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Session Review</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Optimization Feedback Interface</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full text-slate-400 transition-colors"><XCircle size={28} /></button>
        </div>
        
        <form onSubmit={onSubmit} className="p-10 space-y-8">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">
              {booking.trainer?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-[9px] font-black opacity-50 uppercase tracking-widest">Instructing Official</p>
              <p className="font-black uppercase text-slate-900 text-sm tracking-tight">{booking.trainer?.name}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Performance Rating</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                    className={`flex-1 py-4 rounded-2xl border transition-all ${
                      feedbackData.rating === star 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm font-black">{star}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Operational Comments</label>
              <textarea
                value={feedbackData.comment}
                onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                rows="4"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 resize-none"
                placeholder="Share your experience..."
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
          >
            {loading ? 'Transmitting...' : 'Commit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

const SubscriptionModal = ({ isOpen, onClose, plan, onSubmit, setFile, uploading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
          <div>
            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Tier Activation</h3>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">Commencing {plan.name} configuration</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/50 rounded-full text-slate-400 transition-colors"><XCircle size={32} /></button>
        </div>
        
        <form onSubmit={onSubmit} className="p-12 space-y-10">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 flex justify-between items-center shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Operational Cost</p>
              <p className="text-4xl font-black text-indigo-600 tracking-tighter italic">Rs.{plan.price}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Duration Volume</p>
              <p className="text-xl font-black text-slate-900 uppercase tracking-tight italic">{plan.durationMonths} Months</p>
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="text-[11px] font-black uppercase tracking-widest text-indigo-600 italic flex items-center gap-3">
              <CreditCard size={18} />
              Payment Logistics
            </h5>
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-[11px] text-slate-500 space-y-4 leading-relaxed font-bold uppercase tracking-wider">
              <p className="flex gap-4"><span className="text-indigo-600">01.</span> Transfer exact funds to: <span className="text-slate-900 font-black">ITP GYM - 1234567890 (Bank of Ceylon)</span></p>
              <p className="flex gap-4"><span className="text-indigo-600">02.</span> Capture digital image of the transaction receipt.</p>
              <p className="flex gap-4"><span className="text-indigo-600">03.</span> Upload data packet below for verification.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 block">Upload Evidence Packet</label>
            <div className="relative group">
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl px-6 py-4 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 file:mr-6 file:py-2 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer transition-all shadow-sm"
                accept="image/*,.pdf"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {uploading ? 'Transmitting Data...' : 'Finalize Activation Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MemberDashboard;
