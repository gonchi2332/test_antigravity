import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Check if user is an employee
        const { data: employee } = await supabaseClient
            .from('employees')
            .select('*')
            .eq('email', user.email)
            .single()

        const isEmployee = !!employee

        if (req.method === 'POST') {
            const { empresa, tipo_consulta, descripcion, fecha_consulta, modalidad, direccion, employee_id } = await req.json()

            if (!fecha_consulta || !employee_id) {
                return new Response(
                    JSON.stringify({ error: 'Date and Employee are required' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const startDate = new Date(fecha_consulta)
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour duration

            // Conflict Check: Check for APPROVED appointments for this employee that overlap
            const { data: conflicts, error: conflictError } = await supabaseClient
                .from('citas')
                .select('id')
                .eq('employee_id', employee_id)
                .eq('status', 'approved')
                .lt('fecha_consulta', endDate.toISOString())
                .gt('end_time', startDate.toISOString())

            if (conflictError) throw conflictError

            if (conflicts && conflicts.length > 0) {
                return new Response(
                    JSON.stringify({ error: 'This time slot is already booked.' }),
                    { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const { data, error } = await supabaseClient
                .from('citas')
                .insert([
                    {
                        user_id: user.id,
                        empresa,
                        tipo_consulta,
                        descripcion,
                        fecha_consulta: startDate.toISOString(),
                        end_time: endDate.toISOString(),
                        modalidad,
                        direccion,
                        employee_id,
                        status: 'pending'
                    },
                ])
                .select()
                .single()

            if (error) throw error

            return new Response(
                JSON.stringify(data),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (req.method === 'GET') {
            let query = supabaseClient
                .from('citas')
                .select('*, employees(full_name)')
                .order('fecha_consulta', { ascending: true })

            // If not employee, only show own appointments
            if (!isEmployee) {
                query = query.eq('user_id', user.id)
            }

            const { data, error } = await query

            if (error) throw error

            return new Response(
                JSON.stringify({ appointments: data, isEmployee }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (req.method === 'PUT') {
            // Only employees can update status
            if (!isEmployee) {
                return new Response(
                    JSON.stringify({ error: 'Forbidden' }),
                    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const { id, status } = await req.json()

            if (!id || !status) {
                return new Response(
                    JSON.stringify({ error: 'ID and Status are required' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            const { data, error } = await supabaseClient
                .from('citas')
                .update({ status })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            return new Response(
                JSON.stringify(data),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (req.method === 'DELETE') {
            const url = new URL(req.url)
            const id = url.searchParams.get('id')

            if (!id) {
                return new Response(
                    JSON.stringify({ error: 'ID is required' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // If employee, can delete any. If user, only own pending.
            let query = supabaseClient.from('citas').delete().eq('id', id)

            if (!isEmployee) {
                query = query.eq('user_id', user.id).eq('status', 'pending')
            }

            const { error } = await query

            if (error) throw error

            return new Response(
                JSON.stringify({ message: 'Deleted successfully' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
