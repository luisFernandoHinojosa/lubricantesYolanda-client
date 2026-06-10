import { z } from 'zod';

export const MarcaRegisterSchema = z.object({
	nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
	descripcion: z.string().max(1000, 'La descripción es muy larga').optional()
});
