import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../store/apiSlice';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Mail, Lock, User, Phone, MapPin, RefreshCw, BadgeCheck, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [region, setRegion] = useState('');
  const [emailError, setEmailError] = useState('');

  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  // Email Regex Validation
  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  }, [email]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) {
      toast.error('Please fix the email format before submitting.');
      return;
    }

    try {
      await register({
        fullName,
        email,
        password,
        phone,
        nationalId,
        role,
        region,
        accountStatus: role === 'landlord' ? 'pending' : 'active',
      }).unwrap();
      
      toast.success(
        role === 'landlord' 
          ? 'Registration successful! Your account is pending admin authorization.' 
          : 'Registration successful! Welcome to FindNest.'
      );
      navigate('/login');
    } catch (err: any) {
      toast.error(err.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-lg bg-surface p-8 rounded-3xl border border-surface-container-highest shadow-xl">
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="font-headline text-3xl font-black text-on-surface">Join FindNest-KE</h1>
          <p className="text-on-surface-variant mt-2">Secure properties, verified by GavaConnect.</p>
        </div>

        {/* Role Selector */}
        <div className="flex p-1 bg-surface-container-high rounded-2xl mb-8">
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'tenant' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setRole('tenant')}
          >
            I'm a Seeker
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'landlord' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setRole('landlord')}
          >
            I'm a Landlord
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant opacity-40" />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${emailError ? 'text-error' : 'text-on-surface-variant'} opacity-40`} />
              <input
                type="email"
                placeholder="Email Address"
                className={`w-full bg-surface-container-lowest border ${emailError ? 'border-error' : 'border-surface-container-highest'} rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {emailError && <p className="text-[10px] font-bold text-error pl-4 flex items-center gap-1 uppercase tracking-wider"><AlertCircle className="h-3 w-3" /> {emailError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant opacity-40" />
              <input
                type="text"
                placeholder="Phone (254...)"
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant opacity-40" />
              <input
                type="text"
                placeholder="National ID"
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant opacity-40" />
            <input
              type="text"
              placeholder="Primary Region (e.g. Nairobi)"
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
            />
          </div>


          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant opacity-40" />
            <input
              type="password"
              placeholder="Create Password"
              className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
