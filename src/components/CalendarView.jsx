import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { appointmentService } from '../services/appointments';
import { useAuth } from '../context/AuthContext';

export default function CalendarView({ refreshTrigger }) {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const data = await appointmentService.getAppointments();
                // Filter only approved appointments for the calendar
                const approved = (data.appointments || []).filter(app => app.status === 'approved');
                setAppointments(approved);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [user, refreshTrigger]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const getAppointmentsForDay = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return appointments.filter(app => isSameDay(new Date(app.fecha_consulta), date));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mineral-green"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-mineral-green" />
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-white min-h-[100px]" />
                ))}

                {Array.from({ length: days }).map((_, i) => {
                    const day = i + 1;
                    const dayAppointments = getAppointmentsForDay(day);
                    const isToday = isSameDay(new Date(), new Date(currentDate.getFullYear(), currentDate.getMonth(), day));

                    return (
                        <div key={day} className={`bg-white min-h-[100px] p-2 transition-colors hover:bg-gray-50 ${isToday ? 'bg-blue-50/30' : ''}`}>
                            <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                                {day}
                            </div>
                            <div className="space-y-1">
                                {dayAppointments.map(app => (
                                    <div
                                        key={app.id}
                                        className="text-xs p-1.5 rounded bg-green-50 text-green-800 border border-green-100 truncate group relative cursor-help"
                                        title={`${new Date(app.fecha_consulta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${app.empresa}`}
                                    >
                                        <div className="font-medium flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(app.fecha_consulta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="truncate">{app.empresa}</div>

                                        {/* Tooltip */}
                                        <div className="hidden group-hover:block absolute z-10 left-0 bottom-full mb-1 w-48 bg-gray-900 text-white p-2 rounded shadow-lg text-xs whitespace-normal">
                                            <div className="font-bold mb-1">{app.empresa}</div>
                                            <div className="mb-1">{app.tipo_consulta}</div>
                                            <div className="flex items-center gap-1 text-gray-300">
                                                <User className="w-3 h-3" />
                                                {app.employees?.full_name}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
