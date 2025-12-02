const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUUID(str: string): boolean {
    return UUID_REGEX.test(str)
}

export function validateStringLength(str: string | undefined, maxLength: number, fieldName: string): string | null {
    if (str === undefined || str === null) return null
    if (typeof str !== 'string') {
        return `${fieldName} must be a string`
    }
    if (str.length > maxLength) {
        return `${fieldName} exceeds maximum length of ${maxLength} characters`
    }
    return null
}

export function sanitizeString(str: string | undefined): string | undefined {
    if (!str) return str
    // Remove potentially dangerous characters but keep basic punctuation
    return str.trim().replace(/[<>]/g, '')
}

export function validateAppointmentDate(fecha_consulta: string): string | null {
    const appointmentDateTime = new Date(fecha_consulta)
    const now = new Date()
    
    // Check if date is in the past
    const appointmentDate = new Date(appointmentDateTime.getFullYear(), appointmentDateTime.getMonth(), appointmentDateTime.getDate())
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    if (appointmentDate < today) {
        return 'Appointment date cannot be in the past'
    }
    
    // If appointment is today, check if time is in the future (with 15 min buffer)
    if (appointmentDate.getTime() === today.getTime()) {
        const appointmentTime = appointmentDateTime.getHours() * 60 + appointmentDateTime.getMinutes()
        const currentTime = now.getHours() * 60 + now.getMinutes()
        
        if (appointmentTime <= currentTime + 15) {
            return 'Appointment time must be at least 15 minutes in the future'
        }
    }
    
    return null
}

export function validateDuration(duracion_consulta: any): { valid: boolean, minutes: number, error?: string } {
    if (duracion_consulta === undefined || duracion_consulta === null) {
        return { valid: true, minutes: 60 }
    }
    
    const parsed = parseInt(String(duracion_consulta), 10)
    if (isNaN(parsed) || parsed < 15 || parsed > 240) {
        return { valid: false, minutes: 60, error: 'Duration must be between 15 and 240 minutes' }
    }
    
    return { valid: true, minutes: parsed }
}

