import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL; // e.g., https://<project>.supabase.co/functions/v1

export const apiService = {
    async get(endpoint) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API Error');
        }

        return response.json();
    },

    async post(endpoint, body) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API Error');
        }

        return response.json();
    },

    // Add PUT, DELETE similarly
};
