
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User } from '../types';
import { MVM_LOGO_URL } from '../utils/helpers';

const LoginView: React.FC = () => {
    const { dispatch } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Dummy Login Logic
        if (email.toLowerCase() === 'admin' && password === 'password') {
            const user: User = {
                id: 'u-1',
                name: 'Admin User',
                email: 'admin@recruithub.com',
                role: 'Admin',
                avatarUrl: MVM_LOGO_URL,
            };
            dispatch({ type: 'LOGIN', payload: user });
        } else {
            setError('Invalid credentials. Try "admin" and "password".');
        }
    };

    const handleDummyLogin = () => {
        const user: User = {
            id: 'u-test',
            name: 'Test Recruiter',
            email: 'recruiter@recruithub.com',
            role: 'Recruiter',
            avatarUrl: 'https://ui-avatars.com/api/?name=Test+Recruiter&background=random',
        };
        dispatch({ type: 'LOGIN', payload: user });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-center mb-6">
                    <img src={MVM_LOGO_URL} alt="Logo" className="h-12" />
                </div>
                <h2 className="text-2xl font-bold text-center text-brand-charcoal mb-6">Recruitment Hub Login</h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-brand-gray-dark">Username / Email</label>
                        <input 
                            type="text" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent p-2 border"
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-brand-gray-dark">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent p-2 border"
                            placeholder="password"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-brand-green text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors shadow-md"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">For Testing Purposes</span>
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <button 
                            onClick={handleDummyLogin}
                            className="text-brand-accent hover:text-yellow-600 font-medium text-sm hover:underline"
                        >
                            Quick Login as Test Recruiter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
