import { z } from 'zod';

const detalleCompraSchema = z.object({
	producto_id: z.string().uuid('ID de producto inválido.'),
	cantidad_cajas: z.coerce.number().min(0, 'La cantidad de cajas no puede ser negativa.'),
	peso_bruto: z.coerce.number().positive('El peso bruto debe ser un número positivo.'),
	peso_cajas_tara: z.coerce.number().min(0, 'El peso de tara no puede ser negativo.'),
	cantidad_unidades: z.coerce.number().int().positive('La cantidad de unidades debe ser un entero positivo.'),
	costo_unitario: z.coerce.number().positive('El costo unitario debe ser un número positivo.')
});

export const compraPolloRegisterSchema = z.object({
	proveedor_id: z.string().uuid('ID de proveedor inválido.'),
	chofer_id: z.string().uuid('ID de chofer inválido.'),
	ayudante_id: z.string().uuid('ID de ayudante inválido.').optional().nullable(),
	fecha_compra: z.preprocess(
		(val) => (typeof val === 'string' || val instanceof Date ? new Date(val) : val),
		z
			.date({
				message: 'La fecha de compra es obligatoria'
			})
			.refine((val) => !isNaN(Date.parse(val.toString())), {
				message: 'La fecha debe ser una fecha válida'
			})
	),
	precio_por_kg: z.coerce.number().positive('El precio por kilogramo debe ser un número positivo.'),
	monto_pagado: z.coerce.number().min(0, 'El monto pagado no puede ser negativo.'),
	detalles: z
		.array(detalleCompraSchema)
		.min(1, 'Debe haber al menos un detalle en la compra.')
});
