import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const data1 = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
    { name: 'Jul', value: 1000 },
];

const data2 = [
    { name: 'A', value: 4000 },
    { name: 'B', value: 3000 },
    { name: 'C', value: 2000 },
    { name: 'D', value: 2780 },
    { name: 'E', value: 1890 },
    { name: 'F', value: 2390 },
];

const data3 = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 },
];

const COLORS = ['#0D4D4D', '#1A6666', '#4FD1C5', '#E6FFFA'];

const slides = [
    {
        id: 1,
        title: "Real-Time Metrics",
        description: "Monitor system performance and throughput in real-time.",
        chart: (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data1}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        cursor={{ stroke: '#0D4D4D', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#0D4D4D" strokeWidth={3} dot={{ r: 4, fill: '#0D4D4D', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        )
    },
    {
        id: 2,
        title: "Operational Flow",
        description: "Visualize request volume across different segments.",
        chart: (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data2}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#0D4D4D" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        )
    },
    {
        id: 3,
        title: "Intelligent Routing",
        description: "Distribution of tasks handled by AI agents.",
        chart: (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data3}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data3.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                </PieChart>
            </ResponsiveContainer>
        )
    }
];

export default function ChartSlideshow() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <section className="py-20 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Visualized Intelligence
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Gain deep insights into your operations with our advanced real-time dashboards.
                    </p>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden aspect-[16/9] sm:aspect-[2/1]">
                        <div className="absolute inset-0 flex flex-col md:flex-row">
                            {/* Chart Area */}
                            <div className="w-full md:w-2/3 p-6 sm:p-10 flex items-center justify-center bg-white">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full"
                                    >
                                        {slides[currentSlide].chart}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Info Area */}
                            <div className="w-full md:w-1/3 bg-gray-50 p-6 sm:p-10 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                            {slides[currentSlide].title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {slides[currentSlide].description}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>

                                <div className="mt-8 flex items-center space-x-4">
                                    <button
                                        onClick={prevSlide}
                                        className="p-2 rounded-full border border-gray-200 hover:bg-white hover:shadow-sm transition-all text-gray-600"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex space-x-2">
                                        {slides.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentSlide(idx)}
                                                className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-mineral-green w-6' : 'bg-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={nextSlide}
                                        className="p-2 rounded-full border border-gray-200 hover:bg-white hover:shadow-sm transition-all text-gray-600"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
