export default function ProductCard({ label = "Product visualization" }) {
    return (
        <div className="relative w-full aspect-square max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-[2rem] shadow-sm overflow-hidden border border-white/50 dark:border-gray-600/50">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-mineral-green rounded-2xl shadow-lg mb-6 flex items-center justify-center">
                        {/* Placeholder icon */}
                        <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                </div>

                {/* Decorative elements to make it look more like a glassmorphism card */}
                <div className="absolute top-0 left-0 w-full h-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
        </div>
    )
}
