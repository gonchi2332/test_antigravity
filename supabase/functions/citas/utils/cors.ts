// Get allowed origin from environment variable, default to '*' for development
const getAllowedOrigin = (origin?: string | null) => {
    const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN')
    // For production, restrict to specific domains
    // For development, allow all origins (can be changed to specific localhost)
    return allowedOrigin || origin || '*'
}

export const corsHeaders = (origin?: string | null) => ({
    'Access-Control-Allow-Origin': getAllowedOrigin(origin),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400', // 24 hours
})

export const corsResponse = (body: any, status: number = 200, origin?: string | null) => {
    return new Response(
        typeof body === 'string' ? body : JSON.stringify(body),
        {
            status,
            headers: {
                ...corsHeaders(origin),
                'Content-Type': 'application/json',
            }
        }
    )
}

