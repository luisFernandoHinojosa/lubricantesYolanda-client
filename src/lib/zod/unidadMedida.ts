import { z } from 'zod';

export const UnidadMedidaRegisterSchema = z.object({
	nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
	abreviatura: z.string().min(1, 'La abreviatura es requerida.'),
	codigo_fact: z.coerce.number().min(1, 'El código de facturación es requerido y debe ser mayor a 0.')
});
