import { useState, useEffect } from 'react';
import { Users, UserPlus, ArrowLeft, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/admin';
import EmployeeList from './admin/EmployeeList';
import EmployeeProfile from './admin/EmployeeProfile';
import UsersView from './admin/UsersView';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'employees', 'employee-detail', 'users', 'user-detail'
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            if (!user) return;
            try {
                const role = await adminService.getUserRole();
                setUserRole(role);
                
                // Only admins can access
                if (role !== 'admin') {
                    setCurrentView(null);
                }
            } catch (error) {
                console.error('Error checking role:', error);
            } finally {
                setLoading(false);
            }
        };
        checkRole();
    }, [user]);

    useEffect(() => {
        const loadStats = async () => {
            if (userRole === 'admin') {
                try {
                    setStatsLoading(true);
                    const dashboardStats = await adminService.getDashboardStats();
                    setStats(dashboardStats);
                } catch (error) {
                    console.error('Error loading dashboard stats:', error);
                } finally {
                    setStatsLoading(false);
                }
            }
        };
        loadStats();
    }, [userRole]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mineral-green"></div>
            </div>
        );
    }

    // Only admins can access the admin dashboard
    if (!user || userRole !== 'admin') {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Acceso Denegado</h2>
                    <p className="text-gray-600 dark:text-gray-400">Solo los administradores pueden acceder a esta área.</p>
                </div>
            </div>
        );
    }

    // Handle view navigation
    const handleViewChange = (view, id = null) => {
        setCurrentView(view);
        if (view === 'employee-detail') {
            setSelectedEmployeeId(id);
        } else if (view === 'user-detail') {
            setSelectedUserId(id);
        } else {
            setSelectedEmployeeId(null);
            setSelectedUserId(null);
        }
    };

    // Render based on current view
    if (currentView === 'employees') {
        return (
            <EmployeeList 
                onBack={() => handleViewChange('dashboard')}
                onEmployeeClick={(employeeId) => handleViewChange('employee-detail', employeeId)}
                canAddEmployee={userRole === 'admin'}
                canDelete={userRole === 'admin'}
            />
        );
    }

    if (currentView === 'employee-detail' && selectedEmployeeId) {
        return (
            <EmployeeProfile 
                employeeId={selectedEmployeeId}
                onBack={() => handleViewChange('employees')}
            />
        );
    }

    if (currentView === 'users') {
        return (
            <UsersView 
                onBack={() => handleViewChange('dashboard')}
                onUserClick={(userId) => handleViewChange('user-detail', userId)}
                canDelete={userRole === 'admin'}
            />
        );
    }

    if (currentView === 'user-detail' && selectedUserId) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => handleViewChange('users')}
                        className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver a Usuarios
                    </button>
                    <UsersView 
                        selectedUserId={selectedUserId}
                        onBack={() => handleViewChange('users')}
                    />
                </div>
            </div>
        );
    }

    // Dashboard view (default)
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Panel de Administración</h1>
                    <p className="text-gray-600 dark:text-gray-400">Gestiona empleados, usuarios y visualiza estadísticas del sistema</p>
                </div>

                {/* Statistics Cards */}
                {statsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Total Users Card */}
                        <button
                            onClick={() => handleViewChange('users')}
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-left group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors">
                                    <Users className="w-6 h-6 text-blue-500" />
                                </div>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                {stats?.totalUsers ?? 0}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Usuarios</p>
                            {stats?.recentUsers > 0 && (
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    +{stats.recentUsers} nuevos esta semana
                                </p>
                            )}
                            <p className="text-xs text-blue-500 mt-3 group-hover:underline">Ver detalles →</p>
                        </button>

                        {/* Total Employees Card */}
                        <button
                            onClick={() => handleViewChange('employees')}
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-left group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-mineral-green/10 dark:bg-mineral-green/20 rounded-xl group-hover:bg-mineral-green/20 dark:group-hover:bg-mineral-green/30 transition-colors">
                                    <UserPlus className="w-6 h-6 text-mineral-green" />
                                </div>
                                <Activity className="w-5 h-5 text-mineral-green" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                {stats?.totalEmployees ?? 0}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Empleados</p>
                            {stats?.recentEmployees > 0 && (
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    +{stats.recentEmployees} nuevos esta semana
                                </p>
                            )}
                            <p className="text-xs text-mineral-green mt-3 group-hover:underline">Ver detalles →</p>
                        </button>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Accesos Rápidos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Employees Management Card */}
                        <button
                            onClick={() => handleViewChange('employees')}
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-left group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-4 bg-mineral-green/10 dark:bg-mineral-green/20 rounded-xl group-hover:bg-mineral-green/20 dark:group-hover:bg-mineral-green/30 transition-colors">
                                    <Users className="w-8 h-8 text-mineral-green" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Gestionar Empleados</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                Ver, agregar y administrar empleados y especialistas
                            </p>
                            <div className="flex items-center text-mineral-green text-sm font-medium group-hover:underline">
                                Ir a Empleados
                                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </div>
                        </button>

                        {/* Users Management Card */}
                        <button
                            onClick={() => handleViewChange('users')}
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-left group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-4 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors">
                                    <UserPlus className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Gestionar Usuarios</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                Ver y administrar todos los usuarios del sistema
                            </p>
                            <div className="flex items-center text-blue-500 text-sm font-medium group-hover:underline">
                                Ir a Usuarios
                                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </div>
                        </button>

                        {/* System Overview Card */}
                        <div className="bg-gradient-to-br from-mineral-green/5 to-mineral-green/10 dark:from-mineral-green/10 dark:to-mineral-green/20 p-6 rounded-2xl border border-mineral-green/20 dark:border-mineral-green/30">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-4 bg-mineral-green/20 dark:bg-mineral-green/30 rounded-xl">
                                    <BarChart3 className="w-8 h-8 text-mineral-green" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Vista General</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Estadísticas y métricas del sistema en tiempo real
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Summary */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Resumen del Sistema</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Usuarios Registrados</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.totalUsers ?? 0}</p>
                            {stats?.recentUsers > 0 && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    +{stats.recentUsers} nuevos esta semana
                                </p>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Equipo Activo</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.totalEmployees ?? 0}</p>
                            {stats?.recentEmployees > 0 && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    +{stats.recentEmployees} nuevos esta semana
                                </p>
                            )}
                            {!stats?.recentEmployees && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Empleados en el sistema
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

