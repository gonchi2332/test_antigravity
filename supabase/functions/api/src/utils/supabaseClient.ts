import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export const getSupabaseClient = (req: Request) => {
    // Create a Supabase client with the Auth context of the user that called the function.
    // This enables RLS to work correctly.
    return createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        {
            global: {
                headers: { Authorization: req.headers.get("Authorization")! },
            },
        }
    );
};

export const getServiceRoleClient = () => {
    return createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
};
