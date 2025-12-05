import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Calendar, Save } from 'lucide-react';
import { adminService } from '../../services/admin';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeProfile({ employeeId, onBack }) {
    const { user } = useAuth();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [calendlyUrl, setCalendlyUrl] = useState('');
    const [editingCalendly, setEditingCalendly] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadEmployeeData();
    }, [employeeId]);

    const loadEmployeeData = async () => {
        try {
            setLoading(true);
            
            // Load employee info
            const employees = await adminService.getAllEmployees();
            const foundEmployee = employees.find(emp => emp.id === employeeId);
            setEmployee(foundEmployee);
            setCalendlyUrl(foundEmployee?.calendly_url || '');
        } catch (err) {
            console.error('Error loading employee data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mineral-green"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Empleado no encontrado</h2>
                        <button
                            onClick={onBack}
                            className="text-mineral-green hover:text-mineral-green-dark"
                        >
                            Volver a la lista
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver a Empleados
                    </button>

                    {/* Employee Info Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="flex items-start gap-6">
                            <div className="p-4 bg-mineral-green/10 rounded-xl">
                                <User className="w-12 h-12 text-mineral-green" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{employee.full_name}</h1>
                                <div className="space-y-2 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-5 h-5" />
                                        <span>{employee.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                            {employee.role?.name === 'admin' ? 'Administrador' : 'Empleado'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calendly URL Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-mineral-green/10 rounded-lg">
                                    <Calendar className="w-6 h-6 text-mineral-green" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">URL de Calendly</h2>
                                    <p className="text-sm text-gray-600">Configura la URL de Calendly para este empleado</p>
                                </div>
                            </div>
                            {!editingCalendly && (
                                <button
                                    onClick={() => setEditingCalendly(true)}
                                    className="px-4 py-2 text-sm font-medium text-mineral-green hover:bg-mineral-green/10 rounded-lg transition-colors"
                                >
                                    {employee.calendly_url ? 'Editar' : 'Agregar URL'}
                                </button>
                            )}
                        </div>

                        {editingCalendly ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        URL de Calendly
                                    </label>
                                    <input
                                        type="url"
                                        value={calendlyUrl}
                                        onChange={(e) => setCalendlyUrl(e.target.value)}
                                        placeholder="https://calendly.com/usuario/evento"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-mineral-green focus:border-transparent"
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        Ingresa la URL completa de Calendly del empleado
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={async () => {
                                            try {
                                                setSaving(true);
                                                await adminService.updateCalendlyUrl(employeeId, calendlyUrl);
                                                const employees = await adminService.getAllEmployees();
                                                const updatedEmployee = employees.find(emp => emp.id === employeeId);
                                                setEmployee(updatedEmployee);
                                                setCalendlyUrl(updatedEmployee?.calendly_url || '');
                                                setEditingCalendly(false);
                                                alert('URL de Calendly actualizada correctamente');
                                            } catch (error) {
                                                console.error('Error updating Calendly URL:', error);
                                                alert('Error al actualizar la URL de Calendly');
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2 bg-mineral-green text-white rounded-lg font-medium hover:bg-mineral-green-dark transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? 'Guardando...' : 'Guardar'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCalendlyUrl(employee?.calendly_url || '');
                                            setEditingCalendly(false);
                                        }}
                                        disabled={saving}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                {employee.calendly_url ? (
                                    <div className="flex items-center justify-between">
                                        <a
                                            href={employee.calendly_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-mineral-green hover:text-mineral-green-dark font-medium break-all"
                                        >
                                            {employee.calendly_url}
                                        </a>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No se ha configurado una URL de Calendly</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
