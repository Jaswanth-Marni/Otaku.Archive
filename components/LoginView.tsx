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
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-transparent border-2 border-off-black dark:border-white p-3 font-sans text-off-black dark:text-white focus:outline-none focus:border-accent-red transition-colors placeholder-gray-400"
              placeholder="••••••••"
              required
            />
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
