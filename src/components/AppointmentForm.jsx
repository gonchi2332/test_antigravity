import { useState, useEffect } from 'react';
import { Calendar, MapPin, Building, FileText, Activity, Clock, Loader2, User } from 'lucide-react';
import { appointmentService } from '../services/appointments';
import { useAuth } from '../context/AuthContext';

export default function AppointmentForm({ onSuccess }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        empresa: '',
        tipo_consulta: 'General',
        descripcion: '',
        fecha_consulta: '',
        modalidad: 'Virtual',
        direccion: '',
        employee_id: ''
    });

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const data = await appointmentService.getEmployees();
                setEmployees(data || []);
                if (data && data.length > 0) {
                    setFormData(prev => ({ ...prev, employee_id: data[0].id }));
                }
            } catch (err) {
                console.error('Failed to load employees', err);
            }
        };
        loadEmployees();
    }, []);

    if (!user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await appointmentService.createAppointment({
                ...formData,
                fecha_consulta: new Date(formData.fecha_consulta).toISOString()
            });
            setFormData(prev => ({
                ...prev,
                empresa: '',
                tipo_consulta: 'General',
                descripcion: '',
                fecha_consulta: '',
                modalidad: 'Virtual',
                direccion: ''
            }));
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to schedule appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-mineral-green" />
                Schedule Appointment
            </h2>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Specialist
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <User className="w-5 h-5" />
                            </div>
                            <select
                                required
                                value={formData.employee_id}
                                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green transition-colors outline-none bg-white"
                            >
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.full_name} - {emp.specialty}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Building className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                required
                                value={formData.empresa}
                                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green transition-colors outline-none"
                                placeholder="Acme Corp"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Consultation Type
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Activity className="w-5 h-5" />
                            </div>
                            <select
                                value={formData.tipo_consulta}
                                onChange={(e) => setFormData({ ...formData, tipo_consulta: e.target.value })}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green transition-colors outline-none bg-white"
                            >
                                <option>General</option>
                                <option>Technical</option>
                                <option>Sales</option>
                                <option>Support</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date & Time
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <input
                                type="datetime-local"
                                required
                                value={formData.fecha_consulta}
                                onChange={(e) => setFormData({ ...formData, fecha_consulta: e.target.value })}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green transition-colors outline-none"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <textarea
                                required
                                rows={3}
                                value={formData.descripcion}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green transition-colors outline-none resize-none"
                                placeholder="Briefly describe what you'd like to discuss..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Modality
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <select
                                value={formData.modalidad}
                                onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green transition-colors outline-none bg-white"
                            >
                                <option>Virtual</option>
                                <option>In-Person</option>
                            </select>
                        </div>
                    </div>

                    {formData.modalidad === 'In-Person' && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green transition-colors outline-none"
                                    placeholder="123 Business St, City, Country"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-mineral-green text-white py-3 rounded-lg font-medium hover:bg-mineral-green-dark transition-colors shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Scheduling...
                            </>
                        ) : (
                            'Confirm Appointment'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
