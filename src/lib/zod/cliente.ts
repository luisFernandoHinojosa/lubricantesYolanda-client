import z from 'zod';

/** Texto opcional: "" es válido (se guarda como null) */
const opcional = (max: number) =>
	z.string().max(max, { message: `no puede tener más de ${max} caracteres` }).optional().nullable();

/**
 * Valida el formulario de clientes con las reglas del backend (create y update).
 * Los campos opcionales vacíos son válidos; el DTO final se arma en el formulario.
 */
export const clienteRegisterSchema = z.object({
	ci: z
		.string()
		.trim()
		.min(5, { message: 'El CI/NIT debe tener al menos 5 caracteres' })
		.max(20, { message: 'El CI/NIT no puede tener más de 20 caracteres' })
		.refine((v) => v !== '000000', { message: 'Este CI está reservado' }),

	tipo_documento: z.coerce
		.number({ message: 'Tipo de documento inválido' })
		.int()
		.min(1, { message: 'Tipo de documento inválido' })
		.max(5, { message: 'Tipo de documento inválido' })
		.optional(),

	complemento: opcional(5),

	nombre: z
		.string()
		.trim()
		.min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
		.max(100, { message: 'El nombre no puede tener más de 100 caracteres' }),

	apellido_paterno: opcional(100),

	correo_electronico: z
		.union([
			z.literal(''),
			z
				.string()
				.email('El correo electrónico no es válido')
				.max(100, 'El correo no puede superar los 100 caracteres')
		])
		.optional()
		.nullable(),

	fecha_nacimiento: z
		.union([
			z.literal(''),
			z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha de nacimiento no es válida' })
		])
		.optional()
		.nullable(),

	telefono: z
		.string()
		.trim()
		.min(1, { message: 'El teléfono es obligatorio' })
		.max(20, { message: 'El teléfono no puede tener más de 20 caracteres' }),

	direccion: opcional(1000),

	genero: z
		.union([z.literal(''), z.enum(['M', 'F', 'O'], { message: 'Género inválido' })])
		.optional()
		.nullable(),

	tipo_cliente: z.enum(['MAY', 'MIN'], { message: 'El tipo de cliente debe ser MAY o MIN' })
});

/** Valida el ajuste de puntos */
export const ajustePuntosSchema = z.object({
	puntos: z
		.number({ message: 'Ingrese un número entero' })
		.int({ message: 'Debe ser un número entero' })
		.refine((v) => v !== 0, { message: 'Debe ser distinto de 0' }),
	motivo: z
		.string()
		.trim()
		.max(200, { message: 'El motivo no puede tener más de 200 caracteres' })
		.optional()
});
