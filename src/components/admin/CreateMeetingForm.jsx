import { useState, useEffect, useRef } from 'react';
import { Search, User, Mail, Calendar, Clock, FileText, X, Check, Building2, MapPin } from 'lucide-react';
import { adminService } from '../../services/admin';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { sanitizeString } from '../../utils/validation';
import { showError } from '../../utils/notifications';

export default function CreateMeetingForm({ employeeId, employeeInfo, onMeetingCreated }) {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [showClientSearch, setShowClientSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [tiposConsulta, setTiposConsulta] = useState([]);
    const [modalidades, setModalidades] = useState([]);
    const [employee, setEmployee] = useState(employeeInfo || null);
    const searchRef = useRef(null);

    const [formData, setFormData] = useState({
        fecha: '',
        hora: '',
        duracion: '30',
        descripcion: '',
        empresa: '',
        direccion: '',
        tipo_consulta_id: '',
        modalidad_id: ''
    });

    useEffect(() => {
        loadClients();
        loadTiposConsulta();
        loadModalidades();
        if (!employee && employeeId) {
            loadEmployeeInfo();
        }
    }, [employeeId]);

    const loadEmployeeInfo = async () => {
        try {
            const employees = await adminService.getAllEmployees();
            const foundEmployee = employees.find(emp => emp.id === employeeId);
            setEmployee(foundEmployee || null);
        } catch (err) {
            console.error('Error loading employee info:', err);
        }
    };

    useEffect(() => {
        if (searchTerm) {
            const filtered = clients.filter(client =>
                client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredClients(filtered);
        } else {
            setFilteredClients(clients);
        }
    }, [searchTerm, clients]);

    // Cerrar el dropdown cuando se hace click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowClientSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setClients(data || []);
            setFilteredClients(data || []);
        } catch (err) {
            console.error('Error loading clients:', err);
            setError('Error al cargar clientes');
        } finally {
            setLoading(false);
        }
    };

    const loadTiposConsulta = async () => {
        try {
            const { data, error } = await supabase
                .from('tipos_consulta')
                .select('id, name')
                .order('name');

            if (error) throw error;
            setTiposConsulta(data || []);
            
            // Seleccionar el primero por defecto
            if (data && data.length > 0 && !formData.tipo_consulta_id) {
                setFormData(prev => ({ ...prev, tipo_consulta_id: data[0].id }));
            }
        } catch (err) {
            console.error('Error loading tipos consulta:', err);
        }
    };

    const loadModalidades = async () => {
        try {
            const { data, error } = await supabase
                .from('modalidades')
                .select('id, name')
                .order('name');

            if (error) throw error;
            setModalidades(data || []);
            
            // Seleccionar el primero por defecto
            if (data && data.length > 0 && !formData.modalidad_id) {
                setFormData(prev => ({ ...prev, modalidad_id: data[0].id }));
            }
        } catch (err) {
            console.error('Error loading modalidades:', err);
        }
    };

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setShowClientSearch(false);
        setSearchTerm('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClient) {
            setError('Por favor selecciona un cliente');
            return;
        }

        if (!formData.tipo_consulta_id || !formData.modalidad_id) {
            setError('Por favor completa todos los campos requeridos');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // Combinar fecha y hora
            const fechaHora = new Date(`${formData.fecha}T${formData.hora}`);
            
            // Obtener sesión de autenticación
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('No hay sesión activa');
            }

            // Sanitize string inputs
            const sanitizedDescripcion = formData.descripcion ? sanitizeString(formData.descripcion) : undefined;
            const sanitizedEmpresa = formData.empresa ? sanitizeString(formData.empresa) : undefined;
            const sanitizedDireccion = formData.direccion ? sanitizeString(formData.direccion) : undefined;
            
            // Preparar payload para la Edge Function
            const payload = {
                user_id: selectedClient.id,
                employee_id: employeeId || user.id,
                fecha_consulta: fechaHora.toISOString(),
                duracion_consulta: parseInt(formData.duracion),
                descripcion: sanitizedDescripcion,
                tipo_consulta_id: formData.tipo_consulta_id,
                modalidad_id: formData.modalidad_id,
                empresa: sanitizedEmpresa,
                direccion: sanitizedDireccion
            };

            // Llamar a la Edge Function de Supabase
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const response = await fetch(`${supabaseUrl}/functions/v1/citas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al crear la reunión');
            }

            setSuccess(true);
            
            // Aquí podrías agregar lógica para enviar el email al cliente
            // Por ahora solo mostramos el mensaje de éxito
            // TODO: Implementar envío de email cuando tengas el servicio configurado
            
            // Reset form
            setFormData({
                fecha: '',
                hora: '',
                duracion: '30',
                descripcion: '',
                empresa: '',
                direccion: '',
                tipo_consulta_id: tiposConsulta[0]?.id || '',
                modalidad_id: modalidades[0]?.id || ''
            });
            setSelectedClient(null);

            if (onMeetingCreated) {
                onMeetingCreated();
            }

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error creating meeting:', err);
            // Don't expose internal error details
            const userFriendlyMessage = err.message?.includes('Unauthorized')
                ? 'No tienes permiso para realizar esta acción'
                : err.message?.includes('Validation')
                ? 'Los datos ingresados no son válidos. Por favor, verifica e intenta nuevamente.'
                : 'Error al crear la reunión. Por favor, intenta nuevamente.';
            setError(userFriendlyMessage);
            showError(userFriendlyMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Crear Reunión para Cliente
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Information Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Remitente (Employee) */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                            📧 Remitente (De)
                        </label>
                        {employee ? (
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {employee.full_name}
                                </p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    {employee.email}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Cargando información del empleado...
                            </p>
                        )}
                    </div>

                    {/* Destinatario (Client) */}
                    <div className={`p-4 rounded-lg border ${
                        selectedClient 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}>
                        <label className={`block text-xs font-medium mb-2 ${
                            selectedClient
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}>
                            📬 Destinatario (Para)
                        </label>
                        {selectedClient ? (
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {selectedClient.full_name}
                                </p>
                                <p className={`text-sm ${
                                    selectedClient
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                    {selectedClient.email}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Selecciona un cliente de la lista
                            </p>
                        )}
                    </div>
                </div>

                {/* Client Search/Select */}
                <div className="relative" ref={searchRef}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cliente *
                    </label>
                    {selectedClient ? (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-mineral-green text-white flex items-center justify-center font-bold">
                                    {selectedClient.full_name?.charAt(0)?.toUpperCase() || 'C'}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {selectedClient.full_name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedClient.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedClient(null)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar cliente por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowClientSearch(true);
                                }}
                                onFocus={() => setShowClientSearch(true)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            
                            {showClientSearch && filteredClients.length > 0 && (
                                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredClients.map((client) => (
                                        <button
                                            key={client.id}
                                            type="button"
                                            onClick={() => handleClientSelect(client)}
                                            className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-left transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-mineral-green/10 text-mineral-green flex items-center justify-center font-bold">
                                                {client.full_name?.charAt(0)?.toUpperCase() || 'C'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {client.full_name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {client.email}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {showClientSearch && filteredClients.length === 0 && searchTerm && (
                                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center text-gray-500 dark:text-gray-400">
                                    No se encontraron clientes
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Fecha *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Clock className="w-4 h-4 inline mr-2" />
                            Hora *
                        </label>
                        <input
                            type="time"
                            required
                            value={formData.hora}
                            onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none"
                        />
                    </div>
                </div>

                {/* Duration and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Duración (minutos) *
                        </label>
                        <select
                            required
                            value={formData.duracion}
                            onChange={(e) => setFormData({ ...formData, duracion: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none"
                        >
                            <option value="15">15 minutos</option>
                            <option value="30">30 minutos</option>
                            <option value="45">45 minutos</option>
                            <option value="60">1 hora</option>
                            <option value="90">1.5 horas</option>
                            <option value="120">2 horas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de Consulta *
                        </label>
                        <select
                            required
                            value={formData.tipo_consulta_id}
                            onChange={(e) => setFormData({ ...formData, tipo_consulta_id: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none"
                        >
                            <option value="">Seleccionar tipo...</option>
                            {tiposConsulta.map((tipo) => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Modality */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Modalidad *
                    </label>
                    <select
                        required
                        value={formData.modalidad_id}
                        onChange={(e) => setFormData({ ...formData, modalidad_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none"
                    >
                        <option value="">Seleccionar modalidad...</option>
                        {modalidades.map((modalidad) => (
                            <option key={modalidad.id} value={modalidad.id}>
                                {modalidad.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Company (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Building2 className="w-4 h-4 inline mr-2" />
                        Empresa (opcional)
                    </label>
                    <input
                        type="text"
                        value={formData.empresa}
                        onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                        placeholder="Nombre de la empresa..."
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>

                {/* Address (for in-person) */}
                {formData.modalidad_id && modalidades.find(m => m.id === formData.modalidad_id)?.name === 'In-Person' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Dirección
                        </label>
                        <input
                            type="text"
                            value={formData.direccion}
                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            placeholder="Dirección de la reunión..."
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>
                )}

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Descripción (opcional)
                    </label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        rows={3}
                        placeholder="Agregar notas sobre la reunión..."
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none resize-none placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">Reunión creada exitosamente</span>
                        </div>
                        {employee && selectedClient && (
                            <p className="text-sm mt-2">
                                Un email de confirmación será enviado a <strong>{selectedClient.email}</strong> desde <strong>{employee.email}</strong>
                            </p>
                        )}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting || !selectedClient}
                    className="w-full bg-mineral-green text-white px-6 py-3 rounded-lg font-medium hover:bg-mineral-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Creando reunión...
                        </>
                    ) : (
                        <>
                            <Calendar className="w-5 h-5" />
                            Crear Reunión
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

