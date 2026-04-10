import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

// ── localStorage keys ──────────────────────────────────────────────────────────
const REMEMBER_KEY = 'gym_remember_me';
const SAVED_EMAIL_KEY = 'gym_saved_email';
const SAVED_PASSWORD_KEY = 'gym_saved_password';

/**
 * Call this utility from your logout handler anywhere in the app.
 * It clears the password but keeps the email if the user had "Remember Me" on.
 */
export const handleLogoutRememberMe = () => {
  const remembered = localStorage.getItem(REMEMBER_KEY) === 'true';
  localStorage.removeItem(SAVED_PASSWORD_KEY);
  if (!remembered) {
    localStorage.removeItem(SAVED_EMAIL_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }
};

function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  // ── On mount: restore saved credentials ─────────────────────────────────────
  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBER_KEY) === 'true';
    if (remembered) {
      const savedEmail    = localStorage.getItem(SAVED_EMAIL_KEY) || '';
      const savedPassword = localStorage.getItem(SAVED_PASSWORD_KEY) || '';
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Persist or clear credentials based on checkbox
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, 'true');
      localStorage.setItem(SAVED_EMAIL_KEY, email);
      localStorage.setItem(SAVED_PASSWORD_KEY, password);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(SAVED_EMAIL_KEY);
      localStorage.removeItem(SAVED_PASSWORD_KEY);
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'trainer') {
        navigate('/trainer');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[100px]"></div>

      <div className="max-w-md w-full bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-xl shadow-indigo-500/5 z-10 transition-all">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-3 font-medium">Login to your gym portal</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-slate-600 text-[11px] font-black uppercase tracking-widest mb-2 px-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
              placeholder="admin@gmail.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-600 text-[11px] font-black uppercase tracking-widest mb-2 px-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={() => setRememberMe((prev) => !prev)}
              className={`relative w-10 h-6 rounded-full transition-all duration-300 focus:outline-none flex-shrink-0 ${
                rememberMe ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                  rememberMe ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-slate-600 text-sm font-semibold select-none">Remember me</span>
            {rememberMe && (
              <span className="ml-auto text-indigo-500 text-[10px] font-black uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full">
                Saved
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 text-xs uppercase tracking-widest"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 text-center text-slate-500 text-sm font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
