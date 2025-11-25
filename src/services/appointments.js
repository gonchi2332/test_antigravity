import { supabase } from '../lib/supabase';

export const appointmentService = {
    async createAppointment(appointment) {
        const { data, error } = await supabase.functions.invoke('citas', {
            body: appointment,
            method: 'POST',
        });
        if (error) throw error;
        return data;
    },

    async getAppointments() {
        const { data, error } = await supabase.functions.invoke('citas', {
            method: 'GET',
        });
        if (error) throw error;
        return data; // Returns { appointments: [], isEmployee: bool }
    },

    async updateStatus(id, status) {
        const { data, error } = await supabase.functions.invoke('citas', {
            body: { id, status },
            method: 'PUT',
        });
        if (error) throw error;
        return data;
    },

    async deleteAppointment(id) {
        const { data, error } = await supabase.functions.invoke(`citas?id=${id}`, {
            method: 'DELETE',
        });
        if (error) throw error;
        return data;
    },

    async getEmployees() {
        const { data, error } = await supabase
            .from('employees')
            .select('*');
        if (error) throw error;
        return data;
    }
};
