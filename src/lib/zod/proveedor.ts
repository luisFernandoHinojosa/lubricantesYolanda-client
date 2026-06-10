import { z } from 'zod';

export const ProveedorRegisterSchema = z.object({
	nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),

	apellido_paterno: z.preprocess(
		(val) => (val === '' || val === undefined ? null : val),
		z.string().nullable().optional()
	),

	apellido_materno: z.preprocess(
		(val) => (val === '' || val === undefined ? null : val),
		z.string().nullable().optional()
	),

	empresa: z.string().min(2, 'El nombre de la empresa es muy corto'),

	// zona_id: z.string().uuid('La zona debe ser un UUID válido'),

	telefono: z.preprocess(
		(val) => (val === '' || val === undefined ? null : val),
		z.string().nullable().optional()
	),

	direccion: z.preprocess(
		(val) => (val === '' || val === undefined ? null : val),
		z.string().nullable().optional()
	)
});
