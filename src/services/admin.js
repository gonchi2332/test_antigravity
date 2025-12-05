import { supabase } from '../lib/supabase';

export const adminService = {
    // Get current user role
    async getUserRole() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
                role_id,
                role:roles!profiles_role_id_fkey(name)
            `)
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return profile?.role?.name || 'user';
    },

    // Check if user is admin or employee
    async isAdminOrEmployee() {
        const role = await this.getUserRole();
        return role === 'admin' || role === 'employee';
    },

    // Check if user is admin
    async isAdmin() {
        const role = await this.getUserRole();
        return role === 'admin';
    },

    // Get all employees
    async getAllEmployees() {
        const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .in('name', ['employee', 'admin']);

        if (roleError) throw roleError;
        if (!roleData || roleData.length === 0) return [];

        const roleIds = roleData.map(r => r.id);
        
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select(`
                id,
                email,
                full_name,
                calendly_url,
                role:roles!profiles_role_id_fkey(name),
                created_at
            `)
            .in('role_id', roleIds)
            .order('full_name', { ascending: true });

        if (profileError) throw profileError;
        return profiles || [];
    },

    // Get all users (customers)
    async getAllUsers() {
        const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'user')
            .single();

        if (roleError) throw roleError;
        if (!roleData) return [];

        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select(`
                id,
                email,
                full_name,
                role:roles!profiles_role_id_fkey(name),
                created_at
            `)
            .eq('role_id', roleData.id)
            .order('full_name', { ascending: true });

        if (profileError) throw profileError;
        return profiles || [];
    },

    // Create a new employee (admin only - requires creating auth user first)
    // This is a helper that will be used after creating the auth user
    async updateUserRole(userId, roleName) {
        // Get role ID
        const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', roleName)
            .single();

        if (roleError) throw roleError;
        if (!roleData) throw new Error(`Role ${roleName} not found`);

        // Update profile with role
        const updateData = {
            role_id: roleData.id
        };

        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },


    // Delete user or employee (admin only)
    async deleteUser(userId) {
        // Verify current user is admin
        const isAdmin = await this.isAdmin();
        if (!isAdmin) {
            throw new Error('Solo los administradores pueden eliminar usuarios');
        }

        // Get session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            throw new Error('No hay sesión activa');
        }

        // Call Edge Function to delete user
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/delete-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ userId })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al eliminar usuario');
        }

        return result;
    },

    // Get dashboard statistics
    async getDashboardStats() {
        try {
            // Get total users count
            let totalUsers = 0;
            try {
                const { data: usersRoleData } = await supabase
                    .from('roles')
                    .select('id')
                    .eq('name', 'user')
                    .single();

                if (usersRoleData) {
                    const { count } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('role_id', usersRoleData.id);
                    totalUsers = count || 0;
                }
            } catch (e) {
                console.warn('Could not get total users:', e);
            }

            // Get total employees count (only employees, not admins)
            let totalEmployees = 0;
            try {
                const { data: employeesRoleData } = await supabase
                    .from('roles')
                    .select('id')
                    .eq('name', 'employee')
                    .single();

                if (employeesRoleData) {
                    const { count } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('role_id', employeesRoleData.id);
                    totalEmployees = count || 0;
                }
            } catch (e) {
                console.warn('Could not get total employees:', e);
            }

            // Get recent users (last 7 days)
            let recentUsers = 0;
            try {
                const { data: usersRoleData } = await supabase
                    .from('roles')
                    .select('id')
                    .eq('name', 'user')
                    .single();

                if (usersRoleData) {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    
                    const { count } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('role_id', usersRoleData.id)
                        .gte('created_at', sevenDaysAgo.toISOString());
                    recentUsers = count || 0;
                }
            } catch (e) {
                console.warn('Could not get recent users:', e);
            }

            // Get recent employees (last 7 days)
            let recentEmployees = 0;
            try {
                const { data: employeesRoleData } = await supabase
                    .from('roles')
                    .select('id')
                    .eq('name', 'employee')
                    .single();

                if (employeesRoleData) {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    
                    const { count } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('role_id', employeesRoleData.id)
                        .gte('created_at', sevenDaysAgo.toISOString());
                    recentEmployees = count || 0;
                }
            } catch (e) {
                console.warn('Could not get recent employees:', e);
            }

            return {
                totalUsers,
                totalEmployees,
                recentUsers,
                recentEmployees
            };
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            return {
                totalUsers: 0,
                totalEmployees: 0,
                recentUsers: 0,
                recentEmployees: 0
            };
        }
    },

    // Update Calendly URL for any user (admin can update any, employees can update their own)
    async updateCalendlyUrl(userId, calendlyUrl) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Check if user is admin or updating their own profile
        const role = await this.getUserRole();
        if (role !== 'admin' && user.id !== userId) {
            throw new Error('Unauthorized: You can only update your own Calendly URL');
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({ 
                calendly_url: calendlyUrl || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get Calendly URL for any user
    async getCalendlyUrl(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('calendly_url')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data?.calendly_url || null;
    }
};

