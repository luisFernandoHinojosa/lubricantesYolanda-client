import z from 'zod';

export const zonaRegisterSchema = z.object({
	nombre: z.string().min(3, 'El nombre de la zona es requerido.'),
	provincia: z.string().optional()
});
