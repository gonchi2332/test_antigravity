import { useState, useEffect } from 'react';
import { Calendar, MapPin, Building, Trash2, Clock, Video, AlertCircle, CheckCircle, XCircle, User } from 'lucide-react';
import { appointmentService } from '../services/appointments';
import { useAuth } from '../context/AuthContext';

export default function AppointmentList({ refreshTrigger }) {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [isEmployee, setIsEmployee] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await appointmentService.getAppointments();
            setAppointments(data.appointments || []);
            setIsEmployee(data.isEmployee);
        } catch (err) {
            console.error(err);
            setError('Failed to load appointments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user, refreshTrigger]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this appointment?')) return;
        try {
            await appointmentService.deleteAppointment(id);
            setAppointments(appointments.filter(app => app.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete appointment.');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await appointmentService.updateStatus(id, status);
            setAppointments(appointments.map(app =>
                app.id === id ? { ...app, status } : app
            ));
        } catch (err) {
            console.error(err);
            alert('Failed to update status.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mineral-green"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
            </div>
        );
    }

    if (appointments.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No appointments yet</h3>
                <p className="text-gray-500 mt-1">
                    {isEmployee ? 'No pending appointments.' : 'Schedule your first consultation above.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex justify-between items-center">
                <span>{isEmployee ? 'All Appointments' : 'Your Appointments'}</span>
                {isEmployee && <span className="text-sm font-normal bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Employee View</span>}
            </h2>
            <div className="grid gap-4">
                {appointments.map((appointment) => (
                    <div
                        key={appointment.id}
                        className={`bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow relative group ${appointment.status === 'approved' ? 'border-green-200 bg-green-50/30' :
                                appointment.status === 'rejected' ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2 text-mineral-green font-semibold text-lg">
                                    <Building className="w-5 h-5" />
                                    {appointment.empresa}
                                    <span className={`text-xs px-2 py-1 rounded-full ml-2 ${appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {appointment.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    {new Date(appointment.fecha_consulta).toLocaleString()}
                                </div>

                                <div className="flex items-center gap-2 text-gray-600">
                                    <User className="w-4 h-4" />
                                    Specialist: {appointment.employees?.full_name || 'Unknown'}
                                </div>

                                <div className="flex items-center gap-2 text-gray-600">
                                    {appointment.modalidad === 'Virtual' ? (
                                        <Video className="w-4 h-4" />
                                    ) : (
                                        <MapPin className="w-4 h-4" />
                                    )}
                                    {appointment.modalidad}
                                    {appointment.modalidad !== 'Virtual' && ` - ${appointment.direccion}`}
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mt-2">
                                    <span className="font-medium block mb-1 text-gray-900">{appointment.tipo_consulta}</span>
                                    {appointment.descripcion}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                                {isEmployee && appointment.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(appointment.id, 'approved')}
                                            className="text-green-600 hover:bg-green-50 p-2 rounded-full transition-colors"
                                            title="Approve"
                                        >
                                            <CheckCircle className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(appointment.id, 'rejected')}
                                            className="text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                                            title="Reject"
                                        >
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                    </>
                                )}

                                {(isEmployee || appointment.status === 'pending') && (
                                    <button
                                        onClick={() => handleDelete(appointment.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
