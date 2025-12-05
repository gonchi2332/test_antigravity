import { supabase } from '../lib/supabase';

export const employeeService = {
    // Get current employee's Calendly URL
    async getMyCalendlyUrl() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('calendly_url')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return profile?.calendly_url || null;
    },

    // Get all customers (users with role 'user')
    async getAllCustomers() {
        const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'user')
            .single();

        if (roleError) throw roleError;
        if (!roleData) return [];

        const { data: customers, error: customersError } = await supabase
            .from('profiles')
            .select(`
                id,
                email,
                full_name,
                created_at
            `)
            .eq('role_id', roleData.id)
            .order('full_name', { ascending: true });

        if (customersError) throw customersError;
        return customers || [];
    },

    // Get customer by ID
    async getCustomerById(customerId) {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                email,
                full_name,
                created_at
            `)
            .eq('id', customerId)
            .single();

        if (error) throw error;
        return data;
    },

    // Get current employee profile
    async getMyProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
                id,
                email,
                full_name,
                calendly_url
            `)
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return profile;
    },

    // Update employee's Calendly URL
    async updateCalendlyUrl(calendlyUrl) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('profiles')
            .update({ 
                calendly_url: calendlyUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

