import { z } from 'zod';

export const UnidadMedidaRegisterSchema = z.object({
	nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
	abreviatura: z.string().min(1, 'La abreviatura es requerida.')
});
