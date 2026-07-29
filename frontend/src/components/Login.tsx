import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, KeyRound, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://barbershop-app-4lof.onrender.com//api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Giriş xətası');

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userPhone', data.phone);

      if (data.role === 'admin' || data.role === 'barber') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
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
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Xoş Gəldiniz</h2>
          <p className="text-gray-500 mt-2">Hesabınıza daxil olun</p>
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
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
            Daxil Ol
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Hesabınız yoxdur? <Link to="/signup" className="text-amber-600 font-bold hover:underline">Qeydiyyatdan keçin</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;