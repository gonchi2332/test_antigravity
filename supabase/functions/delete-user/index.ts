import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Get allowed origin from environment variable, default to '*' for development
const getAllowedOrigin = () => {
    const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN')
    // For production, restrict to specific domains
    // For development, allow all origins (can be changed to specific localhost)
    return allowedOrigin || '*'
}

const corsHeaders = (origin?: string) => ({
    'Access-Control-Allow-Origin': origin || getAllowedOrigin(),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
})

serve(async (req) => {
    const origin = req.headers.get('Origin')
    const headers = corsHeaders(origin)
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers
        })
    }

    try {
        const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('VITE_SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseAnonKey) {
            return new Response(
                JSON.stringify({ error: 'Missing required environment variables' }),
                { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
            )
        }

        // Get authenticated user
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
            )
        }

        // Create client with user's token
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        })

        // Verify user is authenticated
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
            )
        }

        // Verify user is admin
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select(`
                role_id,
                role:roles!profiles_role_id_fkey(name)
            `)
            .eq('id', user.id)
            .single()

        const roleName = profile?.role?.name || 'user'
        if (roleName !== 'admin') {
            return new Response(
                JSON.stringify({ error: 'Forbidden: Only admins can delete users' }),
                { status: 403, headers: { ...headers, 'Content-Type': 'application/json' } }
            )
        }

        // Get target user ID from request body
        const { userId } = await req.json()
        if (!userId) {
            return new Response(
                JSON.stringify({ error: 'User ID is required' }),
                { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
            )
        }

        // Prevent self-deletion
        if (userId === user.id) {
            return new Response(
                JSON.stringify({ error: 'Cannot delete your own account' }),
                { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
            )
        }

        // Create admin client with service role key to delete user
        if (!supabaseServiceKey) {
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
            )
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // Delete user from auth (this will cascade delete the profile due to foreign key)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (deleteError) {
            console.error('Error deleting user:', deleteError)
            return new Response(
                JSON.stringify({ error: deleteError.message || 'Error deleting user' }),
                { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ message: 'User deleted successfully' }),
            { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('Edge Function Error:', error)
        return new Response(
            JSON.stringify({ error: 'An internal error occurred. Please try again later.' }),
            { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
        )
    }
})

