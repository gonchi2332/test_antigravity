/**
 * Password validation utility
 * Validates password strength according to security requirements
 */
export const validatePassword = (password) => {
    if (!password) {
        return 'La contraseña es requerida';
    }

    if (password.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!/[A-Z]/.test(password)) {
        return 'La contraseña debe contener al menos una letra mayúscula';
    }

    if (!/[a-z]/.test(password)) {
        return 'La contraseña debe contener al menos una letra minúscula';
    }

    if (!/[0-9]/.test(password)) {
        return 'La contraseña debe contener al menos un número';
    }

    // Optional: Add special character requirement
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    //     return 'La contraseña debe contener al menos un carácter especial';
    // }

    return null; // Password is valid
};

/**
 * Email validation utility
 */
export const validateEmail = (email) => {
    if (!email) {
        return 'El email es requerido';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'El email no tiene un formato válido';
    }

    return null; // Email is valid
};

/**
 * Sanitize string input to prevent XSS
 */
export const sanitizeString = (str) => {
    if (typeof str !== 'string') {
        return str;
    }

    // Remove potentially dangerous characters
    return str
        .trim()
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers like onclick=
};

/**
 * Validate full name
 */
export const validateFullName = (name) => {
    if (!name) {
        return 'El nombre completo es requerido';
    }

    if (name.trim().length < 2) {
        return 'El nombre debe tener al menos 2 caracteres';
    }

    if (name.trim().length > 100) {
        return 'El nombre no puede exceder 100 caracteres';
    }

    // Allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-']+$/.test(name)) {
        return 'El nombre solo puede contener letras, espacios, guiones y apostrofes';
    }

    return null; // Name is valid
};

