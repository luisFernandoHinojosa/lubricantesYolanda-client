import z from 'zod';

export const clienteRegisterSchema = z.object({
	// zona_id: z.string().uuid('ID de zona inválido.'),
	nombre: z.string().min(3, { message: 'minimo como 3 caracteres' }),
	apellido_paterno: z.preprocess(
		(val) => (val === '' || val === undefined ? null : val),
		z.string().max(50, { message: 'no puede tener más de 50 caracteres' }).nullable().optional()
	),
	apellido_materno: z
		.string()
		.max(50, { message: 'no puede tener más de 50 caracteres' })
		.optional(),
	telefono: z.string().max(20, { message: 'no puede tener más de 20 caracteres' }).optional(),
	direccion: z.preprocess(
		(val) => (val === '' || val === 'undefined' || val === undefined ? null : val),
		z.string().max(1000, { message: 'no puede tener más de 1000 caracteres' }).nullable()
	),
	puntos: z.number({ message: 'Requiere dato de tipo entero' }).optional(),

	correo_electronico: z
		.string()
		.email('El correo electrónico no es válido')
		.max(100, 'El correo no puede superar los 100 caracteres')
		.nullable()
		.optional(),

	tipo_cliente: z
		.enum(['MAY', 'MIN'], {
			message: 'El tipo de cliente debe ser MAY o MIN'
		})
		.default('MIN'),

	fecha_nacimiento: z.preprocess(
		(val) => {
			if (val === '' || val === undefined || val === null) return null;
			if (typeof val === 'string' || val instanceof Date) return new Date(val);
			return val;
		},
		z.date({ message: 'La fecha de nacimiento no es válida' }).nullable().optional()
	),

	genero: z.preprocess(
		(val) =>
			val === 'null' || val === '' || val === 'undefined' || val === undefined ? null : val,
		z.enum(['M', 'F', 'O']).nullable().optional()
	)
});
