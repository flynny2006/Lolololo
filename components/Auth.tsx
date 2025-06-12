import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import type { AuthComponentProps } from '../types';
import type { Provider } from '@supabase/supabase-js';

const AuthInputField: React.FC<{
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}> = ({ id, label, type, value, onChange, placeholder, required }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="block w-full bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-150 placeholder-neutral-500 caret-sky-500"
    />
  </div>
);


export const AuthComponent: React.FC<AuthComponentProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.session) onLoginSuccess(data.session);
      } else { // Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        if (data.session) {
          // This is the expected path if email confirmation is OFF in Supabase settings.
          // User is created and a session is immediately available.
          onLoginSuccess(data.session);
        } else if (data.user) {
          // This path implies Supabase created a user but did NOT provide a session.
          // This typically means email confirmation IS still considered required by Supabase for this user.
          // Since you've indicated confirmation is off and want to bypass this experience,
          // we avoid the "check your email" message.
          // You may need to log in manually if a session wasn't automatically provided.
          setMessage("Registration successful. Please proceed to login.");
        } else {
          // This case (successful signUp but no user and no session) is highly unlikely
          // and might indicate an unexpected response or issue with Supabase.
          setError("Registration completed, but user data not immediately available. Please try logging in.");
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.error_description || err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  // Example for social login, e.g. Google. You'd need to configure this in Supabase.
  // const handleSocialLogin = async (provider: Provider) => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const { error } = await supabase.auth.signInWithOAuth({ provider });
  //     if (error) throw error;
  //     // Supabase handles redirect and session establishment
  //   } catch (err: any) {
  //     console.error(`${provider} login error:`, err);
  //     setError(err.error_description || err.message || `Failed to login with ${provider}.`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-neutral-900 rounded-xl shadow-2xl border border-neutral-800">
      <h2 className="text-3xl font-bold text-center text-white">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <p className="text-center text-neutral-400">
        {isLogin ? "Sign in to continue to your dashboard." : "Sign up to start building amazing websites."}
      </p>
      
      <form onSubmit={handleAuth} className="space-y-6">
        <AuthInputField
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <AuthInputField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {message && <p className="text-sm text-green-500 text-center">{message}</p>}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </div>
      </form>

      {/* Example Social Login Button 
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-neutral-900 text-neutral-500">Or continue with</span>
        </div>
      </div>
      <div>
        <button
          onClick={() => handleSocialLogin('google')} // Example for Google
          disabled={loading}
          className="w-full flex items-center justify-center py-2.5 px-4 border border-neutral-700 rounded-md shadow-sm bg-neutral-800 text-sm font-medium text-neutral-300 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-sky-500 disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            Path for Google Icon or other provider
          </svg>
          Sign in with Google
        </button>
      </div>
      */}

      <p className="mt-8 text-center text-sm text-neutral-400">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}
        <button
          onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null);}}
          className="font-medium text-sky-500 hover:text-sky-400 ml-1 focus:outline-none"
        >
          {isLogin ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  );
};