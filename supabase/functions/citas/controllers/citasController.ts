import { CitasService } from "../services/citasService.ts"
import { corsResponse } from "../utils/cors.ts"

export class CitasController {
    static async create(req: Request, service: CitasService, origin?: string | null) {
        try {
            const body = await req.json()
            const data = await service.createAppointment(body)
            return corsResponse(data, 201, origin)
        } catch (e: any) {
            if (e.message) {
                return corsResponse({ error: e.message }, 400, origin)
            }
            return corsResponse({ error: 'Invalid JSON in request body' }, 400, origin)
        }
    }

    static async getAll(req: Request, service: CitasService, origin?: string | null) {
        try {
            const url = new URL(req.url)
            const requestedEmployeeId = url.searchParams.get('employee_id')
            const data = await service.getAppointments(requestedEmployeeId)
            return corsResponse(data, 200, origin)
        } catch (error: any) {
            throw error
        }
    }

    static async update(req: Request, service: CitasService, origin?: string | null) {
        try {
            const body = await req.json()
            const data = await service.updateAppointment(body)
            return corsResponse(data, 200, origin)
        } catch (e: any) {
            if (e.message) {
                const status = e.message.includes('Forbidden') ? 403 : 400
                return corsResponse({ error: e.message }, status, origin)
            }
            return corsResponse({ error: 'Invalid JSON in request body' }, 400, origin)
        }
    }

    static async delete(req: Request, service: CitasService, origin?: string | null) {
        try {
            let id: string | null = null
            try {
                const body = await req.json()
                id = body?.id
            } catch (e) {
                const url = new URL(req.url)
                id = url.searchParams.get('id')
            }

            if (!id) {
                return corsResponse({ error: 'ID is required' }, 400, origin)
            }

            const data = await service.deleteAppointment(id)
            return corsResponse(data, 200, origin)
        } catch (e: any) {
            const status = e.message?.includes('Forbidden') ? 403 : 400
            return corsResponse({ error: e.message || 'Failed to delete appointment' }, status, origin)
        }
    }
}

