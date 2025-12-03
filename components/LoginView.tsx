import React, { useState, useEffect } from 'react';
import { Button } from './Button';

export const LoginView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const url = endpoint;

    try {
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Success
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.reload(); // Reload to update UI state (simple approach)

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-base-gray p-4 overflow-hidden perspective-[1000px]">
      <style>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
      `}</style>
      <div 
        className="w-full max-w-md bg-white dark:bg-black border-2 border-off-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 md:p-12 animate-slide-up transition-transform duration-100 ease-out"
        style={{ 
          transform: `
            translate(${mousePos.x * 10}px, ${mousePos.y * 10}px) 
            rotateY(${mousePos.x * 5}deg) 
            rotateX(${-mousePos.y * 5}deg)
          `
        }}
      >
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="font-display text-4xl md:text-5xl uppercase tracking-tighter text-off-black dark:text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join The Archive'}
          </h2>
          <p className="font-sans text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? 'Enter your credentials to access your collection.' : 'Create an account to start tracking your anime.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="font-condensed font-bold uppercase tracking-widest text-xs text-off-black dark:text-white">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-transparent border-2 border-off-black dark:border-white p-3 font-sans text-off-black dark:text-white focus:outline-none focus:border-accent-red transition-colors placeholder-gray-400"
                placeholder="OTAKU_KING"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="font-condensed font-bold uppercase tracking-widest text-xs text-off-black dark:text-white">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent border-2 border-off-black dark:border-white p-3 font-sans text-off-black dark:text-white focus:outline-none focus:border-accent-red transition-colors placeholder-gray-400"
              placeholder="USER@EXAMPLE.COM"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="font-condensed font-bold uppercase tracking-widest text-xs text-off-black dark:text-white">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent border-2 border-off-black dark:border-white p-3 pr-10 font-sans text-off-black dark:text-white focus:outline-none focus:border-accent-red transition-colors placeholder-gray-400"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-off-black dark:hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-500 text-red-700 text-sm font-sans">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="solid" 
            className="w-full !rounded-none border-2 border-transparent hover:border-off-black dark:hover:border-white"
            disabled={loading}
          >
            {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
          </Button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <p className="font-sans text-sm text-off-black dark:text-white">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold underline hover:text-accent-red transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
