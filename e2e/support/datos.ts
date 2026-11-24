/**
 * Datos de prueba para los tests E2E. Imitan las respuestas reales de la API
 * de Lubricantes Yolanda, sin tocar el backend.
 */

export const CREDENCIALES = { email: 'cajero@yolanda.bo', password: 'Clave-Segura-1' };

export type Rol = 'SADM' | 'ADM' | 'CAJ';

const NOMBRES_ROL: Record<Rol, string> = {
	SADM: 'Super administrador',
	ADM: 'Administrador',
	CAJ: 'Cajero'
};

export function usuario(rol: Rol = 'SADM') {
	return {
		id: 'u-1',
		rol_id: `r-${rol}`,
		id_sucursal: 's-1',
		name_user: 'yolanda',
		email: CREDENCIALES.email,
		esta_activo: true,
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		Empleado: {
			id: 'e-1',
			usuario_id: 'u-1',
			ci: '1234567',
			fecha_despido: null,
			nombre: 'Yolanda',
			apellido_paterno: 'Quispe',
			apellido_materno: 'Mamani',
			cargo: 'Encargada',
			fecha_nacimiento: '1985-04-12',
			fecha_contratacion: '2020-02-01',
			salario_base: '4500',
			telefono: '72123855',
			direccion: 'Av. Principal',
			esta_activo: true,
			createdAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-01-01T00:00:00.000Z'
		},
		Role: {
			id: `r-${rol}`,
			code_rol: rol,
			nombre_rol: NOMBRES_ROL[rol],
			descripcion: '',
			createdAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-01-01T00:00:00.000Z'
		}
	};
}

export const SESION = {
	id: 'caja-1',
	monto_apertura: '200.00',
	estado: 'ABIERTA',
	fecha_apertura: '2026-11-21T12:15:00.000Z',
	id_sucursal: 's-1',
	id_usuario: 'u-1'
};

/** Productos tal como los devuelve /productos/pos/buscar */
export const PRODUCTOS_POS = [
	{
		id: 'p-motul',
		codigo_barras: '3374650247434',
		nombre_comercial: 'Aceite Motul 5100 15W-50 1 L',
		maneja_serie: false,
		maneja_vencimiento: false,
		stock_minimo: 6,
		precio_venta: 95,
		stock_disponible: 24,
		disponible: true,
		stock_bajo: false,
		alerta_vencimiento: false,
		lotes_proximos_vencer: [],
		imagen_url: null,
		unidad_medida_abreviatura: 'L',
		unidad_medida_nombre: 'Litro',
		presentaciones: [
			{
				id: 'pres-motul-caja',
				nombre: 'Caja x12',
				factor_conversion: 12,
				precio_especial: 1080,
				codigo_barras: '3374650247999',
				stock_disponible: 2
			}
		]
	},
	{
		id: 'p-castrol',
		codigo_barras: '7702094123456',
		nombre_comercial: 'Castrol GTX 20W-50 4 L',
		maneja_serie: false,
		maneja_vencimiento: false,
		stock_minimo: 4,
		precio_venta: 210,
		stock_disponible: 3,
		disponible: true,
		stock_bajo: true,
		alerta_vencimiento: false,
		lotes_proximos_vencer: [],
		imagen_url: null,
		unidad_medida_abreviatura: 'Bid',
		unidad_medida_nombre: 'Bidón',
		presentaciones: []
	},
	{
		id: 'p-filtro',
		codigo_barras: '4047024710551',
		nombre_comercial: 'Filtro de aceite Bosch 0 986 AF0 051',
		maneja_serie: false,
		maneja_vencimiento: false,
		stock_minimo: 5,
		precio_venta: 48.5,
		stock_disponible: 0,
		disponible: false,
		stock_bajo: true,
		alerta_vencimiento: false,
		lotes_proximos_vencer: [],
		imagen_url: null,
		unidad_medida_abreviatura: 'Und',
		unidad_medida_nombre: 'Unidad',
		presentaciones: []
	}
];

/** Productos tal como los devuelve /productos (listado de inventario) */
export const PRODUCTOS_INVENTARIO = [
	{
		id: 'p-motul',
		codigo_barras: '3374650247434',
		nombre_comercial: 'Aceite Motul 5100 15W-50 1 L',
		id_categoria: 'c-aceites',
		id_marca: 'm-motul',
		id_unidad_medida: 'u-l',
		precio_venta: 95,
		stock_minimo: 6,
		maneja_vencimiento: false,
		imagen_url: null,
		estado: true,
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		categoria: { nombre: 'Aceites de motor' },
		marca: { nombre: 'Motul' },
		unidad_medida: { nombre: 'Litro', abreviatura: 'L' },
		proveedor: { nombre: 'Distribuidora El Motor' },
		ubicacion: { nombre: 'Estante A-3', tipo_area: 'Tienda' },
		stock_actual: 24,
		presentaciones: [
			{
				id: 'pres-motul-caja',
				nombre: 'Caja x12',
				factor_conversion: 12,
				precio_especial: 1080,
				codigo_barras: '3374650247999',
				sku: 'MOT-5100-12',
				esta_activo: true
			}
		]
	},
	{
		id: 'p-castrol',
		codigo_barras: '7702094123456',
		nombre_comercial: 'Castrol GTX 20W-50 4 L',
		id_categoria: 'c-aceites',
		id_marca: 'm-castrol',
		id_unidad_medida: 'u-bid',
		precio_venta: 210,
		stock_minimo: 4,
		maneja_vencimiento: false,
		imagen_url: null,
		estado: true,
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		categoria: { nombre: 'Aceites de motor' },
		marca: { nombre: 'Castrol' },
		unidad_medida: { nombre: 'Bidón', abreviatura: 'Bid' },
		proveedor: { nombre: 'Lubricantes del Sur' },
		ubicacion: { nombre: 'Estante A-1', tipo_area: 'Tienda' },
		stock_actual: 3,
		presentaciones: []
	},
	{
		id: 'p-refrigerante',
		codigo_barras: '0079285000123',
		nombre_comercial: 'Refrigerante Prestone 50/50 1 gal',
		id_categoria: 'c-refrigerantes',
		id_marca: 'm-prestone',
		id_unidad_medida: 'u-gal',
		precio_venta: 130,
		stock_minimo: 3,
		maneja_vencimiento: true,
		imagen_url: null,
		estado: true,
		createdAt: '2026-01-01T00:00:00.000Z',
		updatedAt: '2026-01-01T00:00:00.000Z',
		categoria: { nombre: 'Refrigerantes' },
		marca: { nombre: 'Prestone' },
		unidad_medida: { nombre: 'Galón', abreviatura: 'gal' },
		proveedor: { nombre: 'Distribuidora El Motor' },
		ubicacion: { nombre: 'Depósito 2', tipo_area: 'Almacén' },
		stock_actual: 0,
		presentaciones: []
	}
];

export const CATALOGOS = {
	categorias: [
		{ id: 'c-aceites', nombre: 'Aceites de motor' },
		{ id: 'c-refrigerantes', nombre: 'Refrigerantes' }
	],
	marcas: [
		{ id: 'm-motul', nombre: 'Motul' },
		{ id: 'm-castrol', nombre: 'Castrol' },
		{ id: 'm-prestone', nombre: 'Prestone' }
	],
	unidades_medida: [
		{ id: 'u-l', nombre: 'Litro', abreviatura: 'L' },
		{ id: 'u-gal', nombre: 'Galón', abreviatura: 'gal' }
	],
	proveedores: [
		{ id: 'prov-motor', nombre: 'Distribuidora El Motor' },
		{ id: 'prov-sur', nombre: 'Lubricantes del Sur' }
	]
};

export const CLIENTE_REGISTRADO = {
	id: 'cli-1',
	nombre: 'Carlos',
	apellido_paterno: 'Mendoza',
	apellido_materno: 'Rojas',
	ci: '6543210',
	tipo_documento: 1,
	complemento: '',
	telefono: '70011223',
	genero: 'M',
	direccion: '',
	puntos: 120
};

export const RESUMEN_SESION = {
	cantidad_ventas: 7,
	total_efectivo: 845.5,
	total_qr: 300,
	total_tarjeta: 0,
	totales_por_metodo: {
		EFECTIVO: 845.5,
		QR: 300,
		TARJETA: 0,
		DEPOSITO: 0,
		CHEQUE: 0,
		VALES: 0,
		OTROS: 0
	},
	total_descuentos: 15,
	gran_total: 1145.5,
	cantidad_anuladas: 0,
	cantidad_devoluciones: 1,
	cantidad_cambios: 0,
	total_reembolsado: 48.5,
	total_diferencias_cobradas: 0
};
