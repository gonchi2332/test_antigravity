import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import LoginModal from './LoginModal';
import { useAuth } from '../context/AuthContext';

export default function CTAButtons() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    
    const handleClick = () => {
        if (user) {
            // If user is logged in, scroll to appointments section
            const appointmentsSection = document.getElementById('appointments');
            if (appointmentsSection) {
                appointmentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // If user is not logged in, open login modal
            setIsModalOpen(true);
        }
    };
    
    return (
        <>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                    onClick={handleClick}
                    className="w-full sm:w-auto px-6 py-3 bg-mineral-green text-white rounded-full font-medium hover:bg-mineral-green-dark transition-colors duration-200 flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
                >
                    {user ? 'Book Appointment' : 'Get Started Free'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            <LoginModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                initialMode="login"
            />
        </>
    )
}
