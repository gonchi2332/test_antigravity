export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400', // 24 hours
}

export const corsResponse = (body: any, status: number = 200) => {
    return new Response(
        typeof body === 'string' ? body : JSON.stringify(body),
        {
            status,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            }
        }
    )
}

