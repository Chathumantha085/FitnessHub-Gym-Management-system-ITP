import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

// ── Validation rules ──────────────────────────────────────────────────────────
const validate = (name, value, allValues) => {
  switch (name) {
    case 'name': {
      if (!value.trim()) return 'Full name is required.';
      if (value.trim().length < 3) return 'Name must be at least 3 characters.';
      if (!/^[a-zA-Z\s'-]+$/.test(value.trim()))
        return 'Name can only contain letters, spaces, hyphens, or apostrophes.';
      return '';
    }
    case 'email': {
      if (!value.trim()) return 'Email address is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
        return 'Please enter a valid email address.';
      return '';
    }
    case 'password': {
      if (!value) return 'Password is required.';
      if (value.length < 8) return 'Password must be at least 8 characters.';
      if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.';
      if (!/[0-9]/.test(value)) return 'Password must contain at least one number.';
      return '';
    }
    case 'contactNumber': {
      if (!value.trim()) return 'Contact number is required.';
      if (!/^\+?[0-9\s\-()]{7,15}$/.test(value.trim()))
        return 'Enter a valid phone number (7–15 digits).';
      return '';
    }
    case 'address': {
      if (!value.trim()) return 'Physical address is required.';
      if (value.trim().length < 10) return 'Please enter a complete address (min 10 characters).';
      return '';
    }
    default:
      return '';
  }
};

const validateFile = (file) => {
  if (!file) return 'Please upload your payment slip.';
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowed.includes(file.type))
    return 'Only JPG, PNG, WEBP, or PDF files are accepted.';
  if (file.size > 5 * 1024 * 1024)
    return 'File size must not exceed 5 MB.';
  return '';
};
// ─────────────────────────────────────────────────────────────────────────────

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
  });

  // Per-field inline errors
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
    paymentSlip: '',
  });

  // Track which fields have been touched (blurred) so we don't show errors on load
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    contactNumber: false,
    address: false,
    paymentSlip: false,
  });

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4

  const [paymentSlip, setPaymentSlip] = useState(null);
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation once field is touched
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value, formData) }));
    }

    // Password strength meter
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value, formData) }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPaymentSlip(file || null);
    setTouched((prev) => ({ ...prev, paymentSlip: true }));
    setFieldErrors((prev) => ({ ...prev, paymentSlip: validateFile(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setMessage('');

    // Touch all fields and run full validation
    const allTouched = { name: true, email: true, password: true, contactNumber: true, address: true, paymentSlip: true };
    setTouched(allTouched);

    const newErrors = {
      name:          validate('name',          formData.name,          formData),
      email:         validate('email',         formData.email,         formData),
      password:      validate('password',      formData.password,      formData),
      contactNumber: validate('contactNumber', formData.contactNumber, formData),
      address:       validate('address',       formData.address,       formData),
      paymentSlip:   validateFile(paymentSlip),
    };
    setFieldErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) return;

    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('contactNumber', formData.contactNumber);
    data.append('address', formData.address);
    data.append('paymentSlip', paymentSlip);

    try {
      const response = await api.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Sub-components ────────────────────────────────────────────────────────────
  const FieldError = ({ name }) =>
    touched[name] && fieldErrors[name] ? (
      <p className="mt-1.5 px-1 text-[11px] font-semibold text-red-500 flex items-center gap-1">
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        {fieldErrors[name]}
      </p>
    ) : null;

  const inputClass = (name) =>
    `w-full bg-slate-50 border rounded-2xl px-5 py-3.5 text-slate-900 text-sm focus:outline-none focus:ring-2 transition-all ${
      touched[name] && fieldErrors[name]
        ? 'border-red-400 focus:ring-red-500/10 focus:border-red-400'
        : 'border-slate-200 focus:ring-indigo-500/10 focus:border-indigo-500/50'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden py-12">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-15%] left-[-15%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]"></div>

      <div className="max-w-5xl w-full grid lg:grid-cols-5 gap-0 bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-indigo-500/10 z-10 overflow-hidden">
        {/* ── Left Panel: Form ── */}
        <div className="lg:col-span-3 p-10 lg:p-14">
          <div className="mb-10">
            <h2 className="text-4xl font-black tracking-tight text-slate-900">Join Our Gym</h2>
            <p className="text-slate-500 mt-3 font-medium">Create your account to start your fitness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Row 1: Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-600 text-[11px] font-black uppercase tracking-widest mb-2 px-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass('name')}
                />
                <FieldError name="name" />
              </div>
              <div>
                <label className="block text-slate-600 text-[11px] font-black uppercase tracking-widest mb-2 px-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass('email')}
                />
                <FieldError name="email" />
              </div>
            </div>

            {/* Row 2: Password + Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-600 text-[11px] font-black uppercase tracking-widest mb-2 px-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className={`${inputClass('password')} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Password strength bar */}
                {formData.password && (
                  <div className="mt-2 px-1">
                    <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className="flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor:
                              passwordStrength >= level
                                ? strengthColor[passwordStrength]
                                : '#e2e8f0',
                          }}
                        />
                      ))}
                    </div>
                    <p
                      className="text-[10px] font-bold mt-1"
                      style={{ color: strengthColor[passwordStrength] || '#94a3b8' }}
                    >
                      {strengthLabel[passwordStrength] || 'Too weak'}
                    </p>
                  </div>
                )}
                <FieldError name="password" />
              </div>
              <div>
                <label className="block text-slate-600 text-[11px] font-black uppercase tracking-widest mb-2 px-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+94 77 123 4567"
                  className={inputClass('contactNumber')}
                />
                <FieldError name="contactNumber" />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-slate-600 text-[11px] font-black uppercase tracking-widest mb-2 px-1">
                Physical Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                rows="2"
                placeholder="House no, street, city..."
                className={`${inputClass('address')} resize-none`}
              />
              <FieldError name="address" />
            </div>

            {/* Payment Slip Upload */}
            <div>
              <label className="block text-slate-600 text-[11px] font-black uppercase tracking-widest mb-3 px-1">
                Upload Payment Slip
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  id="payment-slip"
                />
                <label
                  htmlFor="payment-slip"
                  className={`flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed rounded-[2rem] cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-50/30 transition-all ${
                    touched.paymentSlip && fieldErrors.paymentSlip
                      ? 'border-red-400 bg-red-50/20'
                      : paymentSlip
                      ? 'border-indigo-400 bg-indigo-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  {paymentSlip ? (
                    <div className="text-indigo-600 text-sm font-bold flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate max-w-[200px]">{paymentSlip.name}</span>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-white rounded-full shadow-sm mb-2 border border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Tap to upload slip</span>
                      <span className="text-slate-300 text-[10px] mt-0.5">JPG, PNG, WEBP or PDF · Max 5 MB</span>
                    </>
                  )}
                </label>
                {touched.paymentSlip && fieldErrors.paymentSlip && (
                  <p className="mt-1.5 px-1 text-[11px] font-semibold text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {fieldErrors.paymentSlip}
                  </p>
                )}
              </div>
            </div>

            {/* Global success / API error banners */}
            {message && (
              <div className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-2xl text-xs font-bold flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {apiError && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-[1.5rem] hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 shadow-xl shadow-indigo-600/20 text-xs uppercase tracking-widest flex items-center justify-center gap-3"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
              ) : 'Complete Registration'}
            </button>
          </form>
        </div>

        {/* ── Right Panel: Payment Info ── */}
        <div className="lg:col-span-2 bg-slate-50 border-l border-slate-100 p-10 flex flex-col items-center justify-center text-center">
          <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Payment Hub</h3>
          <p className="text-slate-500 text-sm mb-4 leading-relaxed">Scan the QR or use the banking details below. Your membership activates post verification.</p>

          {/* Membership Fee Badge */}
          <div className="w-full bg-indigo-600 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between shadow-lg shadow-indigo-600/20">
            <div className="text-left">
              <span className="block text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">Membership Fee</span>
              <span className="text-white font-black text-2xl tracking-tight">Rs. 1,000</span>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-1.5">
              <span className="text-white text-[10px] font-black uppercase tracking-wider">One Time</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] mb-10 shadow-xl shadow-indigo-500/5 border border-slate-100 group transition-all hover:scale-105">
            <img src="/qr-code.png" alt="Payment QR Code" className="w-48 h-48 object-contain" />
          </div>

          <div className="w-full space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 text-left shadow-sm">
              <span className="block text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Bank Institution</span>
              <span className="text-slate-700 font-bold">Bank of Ceylon (BOC)</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 text-left shadow-sm">
              <span className="block text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Account Number</span>
              <span className="text-indigo-600 font-mono font-bold text-lg">1234 - 5678 - 9012 - 3456</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 text-left shadow-sm">
              <span className="block text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Account Holder</span>
              <span className="text-slate-800 font-black uppercase tracking-tight">GYM ADMIN HQ</span>
            </div>
          </div>

          <p className="mt-10 text-slate-500 text-sm font-medium">
            Joined already?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
