export interface AppointmentCreatePayload {
    empresa?: string
    tipo_consulta_id: string
    descripcion?: string
    fecha_consulta: string
    modalidad_id: string
    direccion?: string
    employee_id?: string
    user_id?: string
    duracion_consulta?: number
}

export interface AppointmentUpdatePayload {
    id: string
    status_name: string
}

export interface UserRole {
    role_id: string
    role: {
        name: string
    }
}

