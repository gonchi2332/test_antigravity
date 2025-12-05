import { useState, useEffect } from 'react';
import { X, Mail, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { validatePassword, validateEmail, validateFullName, sanitizeString } from '../utils/validation';
import { showError } from '../utils/notifications';

export default function LoginModal({ isOpen, onClose, initialMode = 'login' }) {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    const { signIn, signUp, user } = useAuth();

    // Update isLogin when initialMode changes
    useEffect(() => {
        setIsLogin(initialMode === 'login');
    }, [initialMode]);

    // Clear form when modal closes or user logs out
    useEffect(() => {
        if (!isOpen || !user) {
            setFormData({
                email: '',
                password: '',
                fullName: ''
            });
            setError(null);
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Validate email
        const emailError = validateEmail(formData.email);
        if (emailError) {
            setError(emailError);
            showError(emailError);
            return;
        }

        // Validate password
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setError(passwordError);
            showError(passwordError);
            return;
        }

        // Validate full name for signup
        if (!isLogin) {
            const nameError = validateFullName(formData.fullName);
            if (nameError) {
                setError(nameError);
                showError(nameError);
                return;
            }
        }

        setLoading(true);

        try {
            // Sanitize inputs
            const sanitizedEmail = formData.email.trim().toLowerCase();
            const sanitizedFullName = formData.fullName ? sanitizeString(formData.fullName) : '';
            
            if (isLogin) {
                await signIn(sanitizedEmail, formData.password);
            } else {
                await signUp(sanitizedEmail, formData.password, sanitizedFullName);
            }
            // Clear form on successful login/signup
            setFormData({
                email: '',
                password: '',
                fullName: ''
            });
            onClose();
        } catch (err) {
            // Don't expose internal error details
            const userFriendlyMessage = err.message?.includes('Invalid login credentials')
                ? 'Email o contraseña incorrectos'
                : err.message?.includes('already registered')
                ? 'Este email ya está registrado'
                : err.message?.includes('Email rate limit')
                ? 'Demasiados intentos. Por favor, espera un momento.'
                : 'Ocurrió un error. Por favor, intenta nuevamente.';
            setError(userFriendlyMessage);
            showError(userFriendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                        // Clear form when closing modal
                        setFormData({
                            email: '',
                            password: '',
                            fullName: ''
                        });
                        setError(null);
                        onClose();
                    }}
                    className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="p-6 sm:p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </h2>
                            <button 
                                onClick={() => {
                                    // Clear form when closing modal
                                    setFormData({
                                        email: '',
                                        password: '',
                                        fullName: ''
                                    });
                                    setError(null);
                                    onClose();
                                }} 
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green transition-colors outline-none placeholder-gray-400 dark:placeholder-gray-500"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green transition-colors outline-none placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                                        <div className="w-5 h-5 flex items-center justify-center font-mono text-lg">***</div>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green transition-colors outline-none placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-mineral-green text-white py-2.5 rounded-lg font-medium hover:bg-mineral-green-dark transition-colors shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    isLogin ? 'Sign In' : 'Create Account'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 flex items-center justify-between text-sm">
                            <button
                                type="button"
                                className="text-mineral-green hover:text-mineral-green-dark font-medium"
                            >
                                Forgot password?
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError(null);
                                    // Clear form when switching modes
                                    setFormData({
                                        email: '',
                                        password: '',
                                        fullName: ''
                                    });
                                }}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            >
                                {isLogin ? 'Create an account' : 'Already have an account?'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
