import { z } from 'zod';

export const CategoriaMovimientoRegisterSchema = z.object({
	nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
	descripcion: z.string().max(1000).optional().nullable()
});

export const UpdateCategoriaMovimientoSchema = CategoriaMovimientoRegisterSchema.partial().extend({
	esta_activo: z.boolean().optional()
});
