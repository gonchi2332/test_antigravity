import { ArrowRight } from 'lucide-react';

export default function CTAButtons() {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-mineral-green text-white rounded-full font-medium hover:bg-mineral-green-dark transition-colors duration-200 flex items-center justify-center gap-2 group shadow-sm hover:shadow-md">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-full font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
                Watch Demo
            </button>
        </div>
    )
}
