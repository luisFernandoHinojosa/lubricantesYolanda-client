import { z } from 'zod';

export const MovimientoRegisterSchema = z.object({
	nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
	monto: z.number().positive('El monto debe ser mayor a 0'),
	descripcion: z.string().max(1000).optional().nullable(),
	fecha: z.string().min(1, 'La fecha es requerida'),
	tipo: z.enum(['INGRESO', 'EGRESO']),
	tipoPago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'QR', 'CHEQUE', 'OTRO']),
	divisa: z.string().min(1, 'La divisa es requerida'),
	categoriaMovimientoId: z.string().uuid('Categoría inválida')
});

export const UpdateMovimientoSchema = MovimientoRegisterSchema.partial().extend({
	esta_activo: z.boolean().optional()
});
