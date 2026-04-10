import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, ArrowLeft, Loader2, LogIn, LogOut, User, Mail, Phone, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

const AttendanceScanner = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const markAttendance = async () => {
      try {
        const response = await api.patch(`/attendance/mark/${userId}`);
        const result = response.data;
        
        setAttendanceData(result.data);
        setUserData(result.user);
        setMessage(result.message);
        setStatus('success');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to mark attendance. Please try again.');
        // Even on error, we might have user details if the backend sent them
        if (error.response?.data?.user) {
          setUserData(error.response.data.user);
        }
      }
    };

    if (userId) {
      markAttendance();
    }
  }, [userId]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-0 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl relative z-10"
      >
        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-20 px-8"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-6" />
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Verifying Checkystem...</h2>
              <p className="text-slate-400 mt-2">Processing your QR entry</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              {/* Status Header */}
              <div className={`p-8 text-center relative ${attendanceData?.checkOut ? 'bg-orange-500/10' : 'bg-emerald-500/10'}`}>
                 <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${attendanceData?.checkOut ? 'bg-orange-500/20 border-orange-500/50' : 'bg-emerald-500/20 border-emerald-500/50'} border`}>
                    {attendanceData?.checkOut ? (
                      <LogOut className="w-10 h-10 text-orange-500" />
                    ) : (
                      <LogIn className="w-10 h-10 text-emerald-500" />
                    )}
                 </div>
                 <h2 className={`text-3xl font-black tracking-tighter ${attendanceData?.checkOut ? 'text-orange-500' : 'text-emerald-500'}`}>
                    {attendanceData?.checkOut ? 'CHECKED OUT' : 'CHECKED IN'}
                 </h2>
                 <p className="text-slate-300 mt-1 font-medium">{message}</p>
                 <CheckCircle2 className="w-6 h-6 text-emerald-500 absolute top-6 right-6" />
              </div>

              {/* User Identity Card */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-900/20">
                    {userData?.name?.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{userData?.name || 'Member'}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold uppercase tracking-wider mt-0.5">
                      <ShieldCheck size={14} />
                      {userData?.role || 'GYM MEMBER'}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3.5 bg-slate-900/30 rounded-xl border border-slate-800/50">
                    <Mail size={18} className="text-slate-500" />
                    <span className="text-sm text-slate-300 truncate">{userData?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 bg-slate-900/30 rounded-xl border border-slate-800/50">
                    <Phone size={18} className="text-slate-500" />
                    <span className="text-sm text-slate-300">{userData?.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 bg-slate-900/30 rounded-xl border border-slate-800/50">
                    <Clock size={18} className="text-slate-500" />
                    <span className="text-sm text-slate-300">
                      {new Date(attendanceData?.checkOut || attendanceData?.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>

                {attendanceData?.duration > 0 && (
                  <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-center">
                    <span className="text-xs text-blue-400 font-bold uppercase tracking-widest block mb-1">Session Duration</span>
                    <span className="text-2xl font-black text-blue-400">{attendanceData.duration} Mins</span>
                  </div>
                )}

                <button 
                  onClick={() => navigate('/login')}
                  className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all shadow-xl shadow-white/5 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                >
                  <ArrowLeft size={20} />
                  GO TO PORTAL
                </button>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col p-8 text-center"
            >
              <div className="mx-auto w-20 h-20 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-black text-red-500 mb-2">SCAN FAILED</h2>
              <p className="text-slate-300 mb-8 font-medium">{message}</p>
              
              {userData && (
                <div className="mb-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 text-left flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 font-bold">
                    {userData.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{userData.name}</p>
                    <p className="text-xs text-slate-500 uppercase">{userData.role}</p>
                  </div>
                </div>
              )}

              <button 
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                RETURN HOME
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-12 flex flex-col items-center gap-4 z-10 opacity-50">
        <div className="flex items-center gap-2 text-xs font-black tracking-[0.2em] text-slate-400">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          ITP GYM CORE • SECURE SCANNER
        </div>
      </div>
    </div>
  );
};

export default AttendanceScanner;
