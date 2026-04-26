import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation, useRegisterLandlordWithDocsMutation } from '../../store/apiSlice';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Mail, Lock, User, Phone, MapPin, RefreshCw, AlertCircle, UploadCloud } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  
  // Shared state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState('');

  // Seeker state
  const [fullName, setFullName] = useState('');

  // Landlord state
  const [propertyName, setPropertyName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [location, setLocation] = useState('');
  const [verificationDoc, setVerificationDoc] = useState<File | null>(null);

  const [register, { isLoading: isSeekerLoading }] = useRegisterMutation();
  const [registerLandlord, { isLoading: isLandlordLoading }] = useRegisterLandlordWithDocsMutation();
  const navigate = useNavigate();

  const isLoading = isSeekerLoading || isLandlordLoading;

  // Email Regex Validation
  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  }, [email]);

  const handleSeekerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) {
      toast.error('Please fix the email format before submitting.');
      return;
    }

    try {
      console.log('🚀 Submitting SEEKER registration for:', email);
      await register({
        fullName,
        email,
        password,
        phone: `+254${phone}`,
        role: 'tenant',
        accountStatus: 'approved',
      }).unwrap();
      
      toast.success('Registration successful! Welcome to FindNest.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.data?.error || 'Registration failed');
    }
  };

  const handleLandlordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) {
      toast.error('Please fix the email format before submitting.');
      return;
    }

    if (!verificationDoc) {
      toast.error('Please upload a verification document (PDF, JPG, PNG).');
      return;
    }

    // Validate file size (e.g. max 5MB) and type
    if (verificationDoc.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.');
      return;
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(verificationDoc.type)) {
      toast.error('File must be a PDF, JPG, or PNG.');
      return;
    }

    try {
      console.log('🚀 Submitting LANDLORD registration for:', email, 'with property:', propertyName);
      const formData = new FormData();
      formData.append('fullName', propertyName); // Landlords use property/agency name as primary ID
      formData.append('agencyName', propertyName);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('phone', `+254${phone}`);
      formData.append('nationalId', nationalId);
      formData.append('region', location);
      formData.append('verificationDocument', verificationDoc);

      await registerLandlord(formData).unwrap();
      
      toast.success('Registration successful! Your account is pending admin authorization.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.data?.error || 'Landlord registration failed');
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

        {role === 'tenant' ? (
          <form onSubmit={handleSeekerSubmit} className="space-y-5">
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

            <div className="flex">
              <div className="flex items-center justify-center bg-surface-container-highest border border-surface-container-highest rounded-l-2xl px-4 text-sm font-bold text-on-surface">
                +254
              </div>
              <input
                type="text"
                placeholder="700 000 000"
                maxLength={9}
                className="w-full bg-surface-container-lowest border border-surface-container-highest border-l-0 rounded-r-2xl py-4 pl-4 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
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
              {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Register as Seeker'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLandlordSubmit} className="space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant opacity-40" />
              <input
                type="text"
                placeholder="Property Name"
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
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
              <div className="flex">
                <div className="flex items-center justify-center bg-surface-container-highest border border-surface-container-highest rounded-l-2xl px-4 text-sm font-bold text-on-surface">
                  +254
                </div>
                <input
                  type="text"
                  placeholder="700 000 000"
                  maxLength={9}
                  className="w-full bg-surface-container-lowest border border-surface-container-highest border-l-0 rounded-r-2xl py-4 pl-4 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant opacity-40" />
                <input
                  type="text"
                  placeholder="National ID Number"
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
                placeholder="Property Location (e.g. Nairobi)"
                className="w-full bg-surface-container-lowest border border-surface-container-highest rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="relative border border-dashed border-surface-container-highest bg-surface-container-lowest rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setVerificationDoc(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <UploadCloud className="h-8 w-8 text-on-surface-variant opacity-40 mb-2" />
              <p className="text-sm font-bold text-on-surface">Upload Verification Document</p>
              <p className="text-xs text-on-surface-variant mt-1 text-center">Accept: PDF, JPG, PNG <br/>(e.g., Title deed, Lease agreement, Utility bill)</p>
              {verificationDoc && (
                <p className="text-xs text-primary font-bold mt-2 truncate w-full text-center px-4">
                  Selected: {verificationDoc.name}
                </p>
              )}
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
              {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Register as Landlord'}
            </button>
          </form>
        )}

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
