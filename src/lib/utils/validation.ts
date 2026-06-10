export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
	return password.length >= 6; // Ajusta según tus requisitos
};

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

export const validateLoginForm = (email: string, password: string): ValidationResult => {
	const errors: string[] = [];

	if (!email.trim()) {
		errors.push('El email es requerido');
	} else if (!validateEmail(email)) {
		errors.push('El email no tiene un formato válido');
	}

	if (!password.trim()) {
		errors.push('La contraseña es requerida');
	} else if (!validatePassword(password)) {
		errors.push('La contraseña debe tener al menos 6 caracteres');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
};
