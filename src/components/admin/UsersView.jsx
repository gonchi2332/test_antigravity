import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Calendar, Search, Trash2, X, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/admin';
import { useAuth } from '../../context/AuthContext';
import { showError } from '../../utils/notifications';

export default function UsersView({ selectedUserId, onBack, onUserClick, canDelete }) {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            const user = users.find(u => u.id === selectedUserId);
            setSelectedUser(user);
        }
    }, [selectedUserId, users]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data || []);
            
            // If selectedUserId is provided, find and set that user
            if (selectedUserId) {
                const user = data.find(u => u.id === selectedUserId);
                setSelectedUser(user);
            }
        } catch (err) {
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (userId) => {
        const user = users.find(u => u.id === userId);
        setSelectedUser(user);
        if (onUserClick) {
            onUserClick(userId);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        setDeleting(true);
        setDeleteError(null);

        try {
            await adminService.deleteUser(userToDelete.id);
            setUserToDelete(null);
            await loadUsers(); // Reload users list
        } catch (err) {
            console.error('Error deleting user:', err);
            // Don't expose internal error details
            const userFriendlyMessage = 'Error al eliminar usuario. Por favor, intenta nuevamente.';
            setDeleteError(userFriendlyMessage);
            showError(userFriendlyMessage);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteClick = (e, user) => {
        e.stopPropagation(); // Prevent triggering the card click
        if (user.id === currentUser?.id) {
            setDeleteError('No puedes eliminar tu propia cuenta');
            return;
        }
        setUserToDelete(user);
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If viewing a specific user's details
    if (selectedUser) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => {
                                setSelectedUser(null);
                                if (onBack) onBack();
                            }}
                            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver a Usuarios
                        </button>

                        {/* User Info Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                            <div className="flex items-start gap-6">
                                <div className="p-4 bg-blue-500/10 rounded-xl">
                                    <User className="w-12 h-12 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedUser.full_name}</h1>
                                    <div className="space-y-2 text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-5 h-5" />
                                            <span>{selectedUser.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            <span>Miembro desde {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Users List View
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver
                        </button>
                    )}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Usuarios</h1>
                    <p className="text-gray-600 dark:text-gray-400">Ver y gestionar usuarios</p>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-mineral-green/20 focus:border-mineral-green outline-none placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mineral-green"></div>
                    </div>
                ) : (
                    /* Users Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group relative"
                            >
                                <button
                                    onClick={() => handleUserClick(user.id)}
                                    className="w-full text-left"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                            <User className="w-8 h-8 text-blue-500" />
                                        </div>
                                        {canDelete && user.id !== currentUser?.id && (
                                            <button
                                                onClick={(e) => handleDeleteClick(e, user)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Eliminar usuario"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{user.full_name}</h3>
                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Miembro desde {new Date(user.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredUsers.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No hay usuarios</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">No se encontraron usuarios</p>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {userToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Eliminar Usuario</h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Esta acción no se puede deshacer</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setUserToDelete(null);
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
                                    ¿Estás seguro de que deseas eliminar a <span className="font-semibold">{userToDelete.full_name}</span>?
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Se eliminarán todos los datos asociados a este usuario.
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
                                        setUserToDelete(null);
                                        setDeleteError(null);
                                    }}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteUser}
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
        </div>
    );
}
