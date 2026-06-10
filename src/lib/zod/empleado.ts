import { z } from 'zod';
export const UsuarioSchema = z.object({
	rol_id: z
		.string()
		.uuid({
			message: 'El rol_id debe ser un UUID válido'
		})
		.optional(),
	name_user: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').optional(),
	email: z.string().email('Email inválido').optional(),
	password: z
		.string()
		.min(8, 'La contraseña debe tener al menos 8 caracteres')
		.regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
		.regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
		.regex(/[0-9]/, 'Debe contener al menos un número')
		.optional()
});

export const EmpleadoRegisterSchema = z.object({
	ci: z.preprocess(
		(val) => (val === '' || val === undefined ? null : val),
		z.string().min(6, 'CI inválido').max(15, 'CI demasiado largo').nullable().optional()
	),

	nombre: z.string().min(2, 'Nombre muy corto'),
	apellido_paterno: z.string().min(2, 'Apellido paterno muy corto'),
	apellido_materno: z.preprocess(
		(val) => (val === '' || val === undefined ? null : val),
		z.string().min(2, 'Apellido materno muy corto').nullable().optional()
	),

	cargo: z.preprocess(
		(val) => (val === '' || val === undefined ? null : val),
		z.string().min(3, 'Cargo inválido').nullable().optional()
	),

	fecha_nacimiento: z.preprocess(
		(val) => {
			if (val === '' || val === undefined || val === null) return null;
			if (typeof val === 'string' || val instanceof Date) return new Date(val);
			return val;
		},
		z.date({ message: 'La fecha de nacimiento no es válida' }).nullable().optional()
	),

	fecha_contratacion: z.preprocess(
		(val) => {
			if (val === '' || val === undefined || val === null) return null;
			if (typeof val === 'string' || val instanceof Date) return new Date(val);
			return val;
		},
		z.date({ message: 'La fecha de contratación no es válida' }).nullable().optional()
	),

	salario_base: z.preprocess(
		(val) => (val === 0 || val === '' || val === undefined ? null : val),
		z.number().positive('El salario debe ser mayor a 0').nullable().optional()
	),

	telefono: z.preprocess(
		(val) => (val === '' || val === undefined ? null : val),
		z.string().min(7, 'Teléfono inválido').max(15, 'Teléfono inválido').nullable().optional()
	),

	direccion: z.preprocess(
		(val) => (val === '' || val === undefined ? null : val),
		z.string().min(5, 'Dirección muy corta').nullable().optional()
	)

	// usuario: UsuarioSchema.optional()
});
