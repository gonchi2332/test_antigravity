import { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Search, User, Mail, Plus, X, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/admin';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { validatePassword, validateEmail, validateFullName, sanitizeString } from '../../utils/validation';
import { showSuccess, showError } from '../../utils/notifications';

export default function EmployeeList({ onBack, onEmployeeClick, canAddEmployee, canDelete }) {
    const { user: currentUser } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        email: '',
        password: '',
        full_name: ''
    });
    const [error, setError] = useState(null);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllEmployees();
            setEmployees(data || []);
        } catch (err) {
            console.error('Error loading employees:', err);
            setError('Error al cargar empleados');
        } finally {
            setLoading(false);
        }
    };


    const handleAddEmployee = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Validate inputs
        const emailError = validateEmail(newEmployee.email);
        if (emailError) {
            setError(emailError);
            return;
        }

        const passwordError = validatePassword(newEmployee.password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        const nameError = validateFullName(newEmployee.full_name);
        if (nameError) {
            setError(nameError);
            return;
        }

        setAdding(true);

        try {
            // Sanitize inputs
            const sanitizedFullName = sanitizeString(newEmployee.full_name);
            
            // Note: Creating auth users requires admin privileges
            // For now, we'll create the user via signup and then update their role
            // In production, you should use an edge function with service role key
            
            // First, create the auth user via signup
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: newEmployee.email.trim().toLowerCase(),
                password: newEmployee.password,
                options: {
                    data: {
                        full_name: sanitizedFullName
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('No se pudo crear el usuario');

            // Wait a moment for the profile to be created by the trigger
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update profile with employee role
            await adminService.updateUserRole(
                authData.user.id,
                'employee'
            );

            // Close modal and reload
            setShowAddModal(false);
            setNewEmployee({ email: '', password: '', full_name: '' });
            await loadEmployees();
            
            showSuccess('Empleado creado exitosamente. El usuario recibirá un email de confirmación.');
        } catch (err) {
            console.error('Error adding employee:', err);
            // Don't expose internal error details to user
            const userFriendlyMessage = err.message?.includes('already registered') 
                ? 'Este email ya está registrado' 
                : err.message?.includes('Invalid email')
                ? 'El email no es válido'
                : 'Error al crear empleado. Por favor, verifica los datos e intenta nuevamente.';
            setError(userFriendlyMessage);
            showError(userFriendlyMessage);
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteEmployee = async () => {
        if (!employeeToDelete) return;

        setDeleting(true);
        setDeleteError(null);

        try {
            await adminService.deleteUser(employeeToDelete.id);
            setEmployeeToDelete(null);
            await loadEmployees(); // Reload employees list
        } catch (err) {
            console.error('Error deleting employee:', err);
            // Don't expose internal error details
            const userFriendlyMessage = 'Error al eliminar empleado. Por favor, intenta nuevamente.';
            setDeleteError(userFriendlyMessage);
            showError(userFriendlyMessage);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteClick = (e, employee) => {
        e.stopPropagation(); // Prevent triggering the card click
        if (employee.id === currentUser?.id) {
            setDeleteError('No puedes eliminar tu propia cuenta');
            return;
        }
        setEmployeeToDelete(employee);
    };

    const filteredEmployees = employees.filter(emp =>
        emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Empleados</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Gestiona empleados y especialistas</p>
                        </div>
                    </div>
                    {canAddEmployee && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-mineral-green text-white px-4 py-2 rounded-lg hover:bg-mineral-green-dark transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Agregar Empleado
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar empleado..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mineral-green"></div>
                    </div>
                ) : (
                    /* Employees Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEmployees.map((employee) => (
                            <div
                                key={employee.id}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group relative"
                            >
                                <button
                                    onClick={() => onEmployeeClick(employee.id)}
                                    className="w-full text-left"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-mineral-green/10 rounded-xl group-hover:bg-mineral-green/20 transition-colors">
                                            <User className="w-8 h-8 text-mineral-green" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                {employee.role?.name === 'admin' ? 'Admin' : 'Empleado'}
                                            </span>
                                            {canDelete && employee.id !== currentUser?.id && (
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, employee)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Eliminar empleado"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{employee.full_name}</h3>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{employee.email}</span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredEmployees.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No hay empleados</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {canAddEmployee ? 'Agrega tu primer empleado para comenzar' : 'No se encontraron empleados'}
                        </p>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {employeeToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Eliminar Empleado</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Esta acción no se puede deshacer</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setEmployeeToDelete(null);
                                        setDeleteError(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    disabled={deleting}
                                >
                                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700 dark:text-gray-300">
                                    ¿Estás seguro de que deseas eliminar a <span className="font-semibold">{employeeToDelete.full_name}</span>?
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Se eliminarán todos los datos asociados a este empleado.
                                </p>
                            </div>

                            {deleteError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                                    {deleteError}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setEmployeeToDelete(null);
                                        setDeleteError(null);
                                    }}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteEmployee}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Eliminando...
                                        </>
                                    ) : (
                                        'Eliminar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Agregar Empleado</h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setError(null);
                                    setNewEmployee({ email: '', password: '', full_name: '' });
                                }}
                                className="p-2 hover:bg-gray-100hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleAddEmployee} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newEmployee.full_name}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={newEmployee.email}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={newEmployee.password}
                                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setError(null);
                                        setNewEmployee({ email: '', password: '', full_name: '' });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                                    disabled={adding}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="flex-1 px-4 py-2 bg-mineral-green text-white rounded-lg hover:bg-mineral-green-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {adding ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creando...
                                        </>
                                    ) : (
                                        'Crear Empleado'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

