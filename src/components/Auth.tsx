import React from 'react';
import { supabase } from '../lib/supabase';

export const Auth: React.FC = () => {
    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) console.error('Error logging in:', error.message);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-gray-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="card max-w-md w-full mx-4 text-center p-8 border-none shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
                <h1 className="text-5xl font-light text-gray-800 dark:text-gray-100 mb-4 tracking-tight">
                    Just Notes
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-10 font-light text-lg">
                    Simple, collaborative note-taking
                </p>

                <button
                    onClick={handleLogin}
                    className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm hover:shadow-md font-medium text-lg group"
                >
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Sign in with Google
                </button>

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-10 uppercase tracking-widest font-semibold">
                    Now powered by Supabase ✨
                </p>
            </div>
        </div>
    );
};
