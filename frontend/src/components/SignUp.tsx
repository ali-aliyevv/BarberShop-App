import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, User, KeyRound, Mail, Phone, ShieldCheck } from 'lucide-react';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(numericValue);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (phone.length !== 10) {
      setError('Telefon nömrəsi düz 10 rəqəmli olmalıdır! (Məs: 0506212485)');
      return;
    }

    const validPrefixes = ['050', '051', '055', '060', '070', '077', '099'];
    const prefix = phone.substring(0, 3);
    
    if (!validPrefixes.includes(prefix)) {
      setError('Zəhmət olmasa etibarlı operator nömrəsi daxil edin (məs: 050, 055, 070 və s.)');
      return;
    }

    try {
      const response = await fetch('https://barbershop-app-4lof.onrender.com/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Qeydiyyat xətası');

      setMessage('OTP kod e-poçtunuza göndərildi!');
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Naməlum xəta baş verdi');
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://barbershop-app-4lof.onrender.com/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Qeydiyyat xətası');

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userPhone', data.phone);
      
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Naməlum xəta baş verdi');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 bg-gray-50/50 py-12">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Qeydiyyat</h2>
          <p className="text-gray-500 mt-2">Deluxe BarberShop-a qoşulun</p>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium text-center">{error}</div>}
        {message && <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl text-sm font-medium text-center">{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Ad və Soyad</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Əli Məmmədov" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-amber-500 font-medium" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Telefon Nömrəsi (10 rəqəm)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" inputMode="numeric" value={phone} onChange={handlePhoneChange} placeholder="0506212485" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-amber-500 font-medium" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">E-poçt</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-amber-500 font-medium" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Şifrə</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-amber-500 font-medium" required />
              </div>
            </div>

            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-amber-500 transition-colors shadow-lg mt-2">
              Təsdiq Kodu Göndər
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">E-poçtunuza gələn 4 rəqəmli OTP Kod</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="1234" className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-amber-500 font-bold tracking-widest text-center text-xl" required />
              </div>
            </div>

            <button type="submit" className="w-full bg-amber-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-amber-700 transition-colors shadow-lg mt-2">
              Qeydiyyatı Tamamla
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Artıq hesabınız var? <Link to="/login" className="text-amber-600 font-bold hover:underline">Daxil olun</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;