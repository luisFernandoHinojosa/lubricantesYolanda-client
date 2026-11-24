import type { Page, Route } from '@playwright/test';
import {
	CATALOGOS,
	CLIENTE_REGISTRADO,
	CREDENCIALES,
	PRODUCTOS_INVENTARIO,
	PRODUCTOS_POS,
	RESUMEN_SESION,
	SESION,
	usuario,
	type Rol
} from './datos';

const USER_KEY = 'lby::auth::ud';
const AT_KEY = 'lby::auth::at';
const RT_KEY = 'lby::auth::rt';
const CARRITO_KEY = 'lby::pos::carrito';

export interface OpcionesMock {
	rol?: Rol;
	/** Si hay una caja abierta al entrar al POS */
	cajaAbierta?: boolean;
}

/** Lo que la app envió a la API simulada, para verificarlo en los tests */
export interface RegistroApi {
	ventas: Record<string, unknown>[];
	aperturas: Record<string, unknown>[];
	cierres: Record<string, unknown>[];
	busquedasProductos: string[];
}

const json = (route: Route, body: unknown, status = 200) =>
	route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

/**
 * Intercepta todas las llamadas a la API (`…/api/v1/…`) y responde con datos de prueba.
 * Devuelve un registro de lo que la app envió.
 */
export async function mockApi(page: Page, opciones: OpcionesMock = {}): Promise<RegistroApi> {
	const rol = opciones.rol ?? 'SADM';
	let cajaAbierta = opciones.cajaAbierta ?? true;
	let correlativo = 101;
	const registro: RegistroApi = { ventas: [], aperturas: [], cierres: [], busquedasProductos: [] };

	// El POS imprime el ticket con window.print(): en los tests no debe abrir el diálogo
	await page.addInitScript(() => {
		window.print = () => {};
	});

	await page.route(/\/api\/v1\//, async (route) => {
		const req = route.request();
		const url = new URL(req.url());
		const path = url.pathname.replace(/^.*\/api\/v1/, '');
		const method = req.method();
		const body = (() => {
			try {
				return req.postDataJSON() ?? {};
			} catch {
				return {};
			}
		})();

		// ── Autenticación
		if (path === '/auth/login' && method === 'POST') {
			if (body.email === CREDENCIALES.email && body.password === CREDENCIALES.password) {
				return json(route, {
					status: 'success',
					accessToken: 'at-prueba',
					refreshToken: 'rt-prueba'
				});
			}
			return json(route, { status: 'error', message: 'Credenciales inválidas' }, 401);
		}
		if (path === '/auth/me') return json(route, { status: 'success', data: usuario(rol) });

		// ── Caja
		if (path === '/session_caja/activa') {
			return cajaAbierta
				? json(route, { status: 'success', data: SESION })
				: json(route, { status: 'error', message: 'Sin sesión activa' }, 404);
		}
		if (path === '/session_caja/abrir' && method === 'POST') {
			registro.aperturas.push(body);
			cajaAbierta = true;
			return json(route, {
				status: 'success',
				data: { ...SESION, monto_apertura: String(body.monto_apertura) }
			});
		}
		if (/^\/session_caja\/[^/]+\/cerrar$/.test(path) && method === 'PATCH') {
			registro.cierres.push(body);
			cajaAbierta = false;
			return json(route, {
				status: 'success',
				data: { ...RESUMEN_SESION, monto_cierre: body.monto_cierre }
			});
		}
		if (/^\/ventas\/sesion\/[^/]+\/resumen$/.test(path)) {
			return json(route, { status: 'success', data: RESUMEN_SESION });
		}

		// ── Catálogo del POS
		if (path === '/productos/pos/buscar') {
			const q = (url.searchParams.get('q') ?? '').toLowerCase();
			registro.busquedasProductos.push(q);
			const data = PRODUCTOS_POS.filter(
				(p) => !q || p.nombre_comercial.toLowerCase().includes(q) || p.codigo_barras?.includes(q)
			);
			return json(route, { status: 'success', data });
		}
		if (path.startsWith('/productos/pos/barcode/')) {
			const codigo = decodeURIComponent(path.split('/').pop() ?? '');
			const unidad = PRODUCTOS_POS.find((p) => p.codigo_barras === codigo);
			if (unidad)
				return json(route, { status: 'success', data: { ...unidad, _tipo_scan: 'unidad' } });
			const conPres = PRODUCTOS_POS.find((p) =>
				p.presentaciones.some((x) => x.codigo_barras === codigo)
			);
			if (conPres) {
				const pres = conPres.presentaciones.find((x) => x.codigo_barras === codigo)!;
				return json(route, {
					status: 'success',
					data: { ...conPres, _tipo_scan: 'presentacion', id_presentacion: pres.id }
				});
			}
			return json(route, { status: 'error', message: 'Producto no encontrado' }, 404);
		}

		// ── Ventas
		if (path === '/ventas' && method === 'POST') {
			registro.ventas.push(body);
			return json(route, { status: 'success', data: ventaDesdeDto(body, correlativo++) });
		}

		// ── Clientes
		if (path.startsWith('/clientes/ci/')) {
			const ci = decodeURIComponent(path.split('/').pop() ?? '');
			return ci === CLIENTE_REGISTRADO.ci
				? json(route, { status: 'success', data: CLIENTE_REGISTRADO })
				: json(route, { status: 'error', message: 'Cliente no encontrado' }, 404);
		}

		// ── Inventario
		if (path === '/productos' && method === 'GET') {
			const search = (url.searchParams.get('search') ?? '').toLowerCase();
			const marca = url.searchParams.get('id_marca');
			const productos = PRODUCTOS_INVENTARIO.filter(
				(p) =>
					(!search ||
						p.nombre_comercial.toLowerCase().includes(search) ||
						p.codigo_barras.includes(search)) &&
					(!marca || p.id_marca === marca)
			);
			return json(route, {
				status: 'success',
				data: { productos, total: productos.length, page: 1, perPage: 15, totalPages: 1 },
				extraData: {
					categorias: CATALOGOS.categorias,
					marcas: CATALOGOS.marcas,
					unidades_medida: CATALOGOS.unidades_medida
				}
			});
		}
		if (path === '/proveedores/catalogo')
			return json(route, { status: 'success', data: CATALOGOS.proveedores });
		if (path === '/sucursales') return json(route, { status: 'success', data: { sucursales: [] } });
		if (path === '/ubicaciones/catalogo' || path === '/ubicaciones_fisicas/catalogo') {
			return json(route, { status: 'success', data: [] });
		}

		// Cualquier otro endpoint: respuesta vacía pero válida
		return json(route, { status: 'success', data: [] });
	});

	return registro;
}

/** Deja la sesión iniciada antes de cargar la app (como si el usuario ya hubiera entrado) */
export async function iniciarSesion(page: Page, rol: Rol = 'SADM') {
	await page.addInitScript(
		([u, keys]) => {
			// Solo en la primera carga: si el test cierra sesión, no se vuelve a iniciar sola
			if (sessionStorage.getItem('e2e::sesion-sembrada')) return;
			sessionStorage.setItem('e2e::sesion-sembrada', '1');
			localStorage.setItem(keys.at, 'at-prueba');
			localStorage.setItem(keys.rt, 'rt-prueba');
			localStorage.setItem(keys.user, JSON.stringify(u));
			localStorage.removeItem(keys.carrito);
		},
		[usuario(rol), { at: AT_KEY, rt: RT_KEY, user: USER_KEY, carrito: CARRITO_KEY }] as const
	);
}

function ventaDesdeDto(dto: Record<string, any>, correlativo: number) {
	const detalles = (dto.items ?? []).map((item: any, i: number) => {
		const prod = PRODUCTOS_POS.find((p) => p.id === item.id_producto)!;
		const pres = prod.presentaciones.find((p) => p.id === item.id_presentacion) ?? null;
		const precio = pres ? pres.precio_especial : (prod.precio_venta ?? 0);
		const subtotal = precio * item.cantidad - (item.monto_descuento ?? 0);
		return {
			id: `det-${i}`,
			producto: {
				id: prod.id,
				nombre_comercial: prod.nombre_comercial,
				codigo_barras: prod.codigo_barras,
				unidad_medida: {
					id: 'um',
					nombre: prod.unidad_medida_nombre,
					abreviatura: prod.unidad_medida_abreviatura
				}
			},
			presentacion: pres
				? { id: pres.id, nombre: pres.nombre, factor_conversion: pres.factor_conversion }
				: null,
			numero_serie: item.numero_serie ?? null,
			cantidad: item.cantidad,
			precio_unitario: precio,
			monto_descuento: item.monto_descuento ?? 0,
			subtotal,
			cantidad_devuelta: 0,
			cantidad_disponible: item.cantidad
		};
	});
	const subtotal = detalles.reduce((a: number, d: any) => a + d.subtotal, 0);
	const pagado = (dto.pagos ?? []).reduce((a: number, p: any) => a + Number(p.monto), 0);
	return {
		id: `venta-${correlativo}`,
		numero_comprobante: `V-${String(correlativo).padStart(6, '0')}`,
		fecha: '2026-11-21T15:30:00.000Z',
		estado: 'COMPLETADA',
		id_sesion_caja: dto.id_sesion_caja,
		cliente: null,
		cajero: { id: 'u-1', nombre_completo: 'Yolanda Quispe' },
		sucursal: { id: 's-1', nombre: 'Sucursal principal' },
		pagos: (dto.pagos ?? []).map((p: any) => ({ ...p, referencia: p.referencia ?? null })),
		subtotal,
		tipo_descuento_global: dto.tipo_descuento_global ?? 'NINGUNO',
		valor_descuento_global: dto.valor_descuento_global ?? 0,
		monto_descuento_global: 0,
		porcentaje_recargo_iva: 0,
		monto_recargo_iva: 0,
		total: subtotal,
		monto_devuelto: 0,
		diferencia_cambio: 0,
		total_neto: subtotal,
		monto_pagado: pagado,
		cambio_entregado: Math.max(0, pagado - subtotal),
		notas: dto.notas ?? null,
		detalles,
		devoluciones: [],
		factura: null,
		facturas_anuladas: [],
		resultado_facturacion: null
	};
}
