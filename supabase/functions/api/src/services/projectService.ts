import { getSupabaseClient } from "../utils/supabaseClient.ts";

export const projectService = {
    async getAll(req: Request) {
        const supabase = getSupabaseClient(req);
        const { data, error } = await supabase.from("projects").select("*");
        if (error) throw error;
        return data;
    },

    async getById(req: Request, id: string) {
        const supabase = getSupabaseClient(req);
        const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
        if (error) throw error;
        return data;
    },

    async create(req: Request, payload: any) {
        const supabase = getSupabaseClient(req);

        // Get current user to set user_id
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Unauthorized");

        const { data, error } = await supabase.from("projects").insert({
            ...payload,
            user_id: user.id
        }).select().single();

        if (error) throw error;
        return data;
    },

    async update(req: Request, id: string, payload: any) {
        const supabase = getSupabaseClient(req);
        const { data, error } = await supabase.from("projects").update(payload).eq("id", id).select().single();
        if (error) throw error;
        return data;
    },

    async delete(req: Request, id: string) {
        const supabase = getSupabaseClient(req);
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) throw error;
        return { success: true };
    }
};
