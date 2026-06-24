import { posService } from '$lib/services/pos.service';
import { alert } from '$lib/utils';
import type {
	ProductoPOS,
	CartItem,
	SesionCaja,
	ClientePOS,
	VentaResponse,
	ResumenCierre,
	ResumenVentasSesion,
	CreateVentaDto
} from '$lib/interfaces/venta.interface';
import { SvelteDate } from 'svelte/reactivity';
import { POS_CARRITO_KEY } from '$lib/constants';

export class VentasState {
	sesionActiva = $state<SesionCaja | null>(null);
	cargandoSesion = $state(true);

	modalApertura = $state(true);
	modalCierre = $state(false);
	modalPago = $state(false);
	modalRecibo = $state(false);
	modalCliente = $state(false);
	modalDescuento = $state(false);
	modalCantidad = $state(false);

	pendingProduct = $state<{ producto: ProductoPOS; id_presentacion: string | null } | null>(null);
	cantidadManual = $state('1');

	modoBusqueda = $state<'ESCANER' | 'TEXTO'>('ESCANER');
	resumenCierrePrevio = $state<ResumenVentasSesion | null>(null);
	cargandoCierre = $state(false);

	montoApertura = $state('');
	montoCierre = $state('');
	resumenCierre = $state<ResumenCierre | null>(null);
	guardandoCaja = $state(false);

	busqueda = $state('');
	productos = $state<ProductoPOS[]>([]);
	buscando = $state(false);
	mostrarDropdown = $state(false);

	private _carrito = $state<CartItem[]>([]);

	get carrito(): CartItem[] {
		return this._carrito;
	}

	set carrito(value: CartItem[]) {
		this._carrito = value;
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(POS_CARRITO_KEY, JSON.stringify(value));
			} catch (e) {
				console.error('Error guardando carrito en localStorage', e);
			}
		}
	}
	itemRecienAgregado = $state<string | null>(null);

	clienteSeleccionado = $state<ClientePOS | null>(null);
	busquedaCliente = $state('');
	resultadosCliente = $state<ClientePOS[]>([]);
	buscandoCliente = $state(false);

	descuentoTarget = $state<'global' | string>('global');
	descuentoTipo = $state<'PORCENTAJE' | 'FIJO'>('FIJO');
	descuentoValor = $state(0);
	descuentoGlobal = $state({
		tipo: 'FIJO' as 'PORCENTAJE' | 'FIJO' | 'NINGUNO',
		valor: 0
	});

	metodoPago = $state<'EFECTIVO' | 'QR' | 'TARJETA' | 'TRANSFERENCIA'>('EFECTIVO');
	montoPagado = $state('');
	notasVenta = $state('');
	procesandoVenta = $state(false);
	ultimaVenta = $state<VentaResponse | null>(null);

	horaActual = $state(
		new SvelteDate().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
	);

	private searchTimeout: unknown;
	private clienteTimeout: unknown;

	// ─── DERIVADOS ─────────────────────────────────────────────────────────────
	subtotalItems = $derived(this.carrito.reduce((acc, i) => acc + i.subtotal, 0));

	montoDescuentoGlobal = $derived(() => {
		if (this.descuentoGlobal.valor <= 0) return 0;
		if (this.descuentoGlobal.tipo === 'PORCENTAJE')
			return (this.subtotalItems * this.descuentoGlobal.valor) / 100;
		return this.descuentoGlobal.valor;
	});

	totalFinal = $derived(Math.max(0, this.subtotalItems - this.montoDescuentoGlobal()));

	cambio = $derived(
		this.montoPagado ? Math.max(0, parseFloat(this.montoPagado) - this.totalFinal) : 0
	);

	pagoSuficiente = $derived(
		!!this.montoPagado && parseFloat(this.montoPagado) >= this.totalFinal && this.totalFinal > 0
	);

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem(POS_CARRITO_KEY);
			if (saved) {
				try {
					this._carrito = JSON.parse(saved);
				} catch (e) {
					console.error('Error al restaurar el carrito', e);
				}
			}
		}
		this.init();
		this.startTime();
	}

	async init() {
		try {
			this.sesionActiva = await posService.getSesionActiva();
			if (this.sesionActiva) {
				this.modalApertura = false;
				await this.buscarProductos('');
			}
		} catch {
			this.sesionActiva = null;
		} finally {
			this.cargandoSesion = false;
		}
	}

	private startTime() {
		setInterval(() => {
			this.horaActual = new SvelteDate().toLocaleTimeString('es-BO', {
				hour: '2-digit',
				minute: '2-digit'
			});
		}, 30000);
	}

	// ─── ACCIONES DE CAJA ──────────────────────────────────────────────────────
	async abrirCaja() {
		if (!this.montoApertura || parseFloat(this.montoApertura) < 0) {
			alert('error', 'Ingrese un monto de apertura válido');
			return;
		}
		this.guardandoCaja = true;
		try {
			this.sesionActiva = await posService.abrirCaja({
				monto_apertura: parseFloat(this.montoApertura)
			});
			this.modalApertura = false;
			this.montoApertura = '';
			alert('success', 'Caja abierta correctamente');
			await this.buscarProductos('');
		} catch {
			alert('error', 'Error al abrir la caja');
		} finally {
			this.guardandoCaja = false;
		}
	}

	async abrirModalCierre() {
		if (!this.sesionActiva) return;
		this.cargandoCierre = true;
		this.modalCierre = true;
		try {
			this.resumenCierrePrevio = await posService.getResumenSesion(this.sesionActiva.id);
		} catch {
			alert('error', 'No se pudo cargar el resumen previo.');
			this.modalCierre = false;
		} finally {
			this.cargandoCierre = false;
		}
	}

	async cerrarCaja() {
		if (!this.sesionActiva || this.montoCierre === '') return;
		this.guardandoCaja = true;
		try {
			this.resumenCierre = await posService.cerrarCaja(this.sesionActiva.id, {
				monto_cierre: parseFloat(this.montoCierre)
			});
			this.sesionActiva = null;
			this.carrito = [];
			this.productos = [];
			this.modalCierre = false;
			this.montoCierre = '';
			this.modalApertura = true;
			alert('success', 'Caja cerrada. Turno finalizado.');
		} catch {
			alert('error', 'Error al cerrar la caja');
		} finally {
			this.guardandoCaja = false;
		}
	}

	// ─── BÚSQUEDA DE PRODUCTOS ────────────────────────────────────────────────
	async buscarProductos(q: string) {
		this.buscando = true;
		try {
			this.productos = await posService.buscarProductos(q);
			console.log('productos::', this.productos);
		} catch {
			this.productos = [];
		} finally {
			this.buscando = false;
		}
	}

	onBusqueda(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		this.busqueda = val;
		clearTimeout(this.searchTimeout);
		if (this.modoBusqueda === 'ESCANER') {
			if (val.trim()) this.searchTimeout = setTimeout(() => this.procesarEscanerManual(val), 150);
		} else {
			this.mostrarDropdown = true;
			this.searchTimeout = setTimeout(() => this.buscarProductos(val), 300);
		}
	}

	async procesarEscanerManual(codigoOriginal: string) {
		const codigo = codigoOriginal.trim();
		if (!codigo) return;
		this.busqueda = '';
		const inputEl = document.getElementById('scan-input') as HTMLInputElement;
		if (inputEl) inputEl.value = '';
		try {
			const p = await posService.buscarPorBarcode(codigo);
			//	console.log('product::', p);
			this.agregarAlCarrito(p, p.id_presentacion ?? null);
			this.productos = [];
		} catch {
			alert('error', `Código "${codigo}" no encontrado`);
			this.busqueda = codigo;
			if (inputEl) inputEl.value = codigo;
		} finally {
			if (inputEl) inputEl.focus();
		}
	}

	async onBarcode(e: KeyboardEvent) {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		const codigo = this.busqueda.trim();
		if (!codigo) return;
		clearTimeout(this.searchTimeout);
		await this.procesarEscanerManual(codigo);
	}

	// ─── GESTIÓN DEL CARRITO ──────────────────────────────────────────────────
	agregarAlCarrito(producto: ProductoPOS, id_presentacion: string | null) {
		const pres = id_presentacion
			? producto.presentaciones.find((p) => p.id === id_presentacion)
			: null;
		const precio = pres ? pres.precio_especial : (producto.precio_venta ?? 0);
		const factor = pres ? pres.factor_conversion : 1;
		const stockDisp = pres ? pres.stock_disponible : producto.stock_disponible;
		const nombrePres = pres ? pres.nombre : null;
		const unidadMedidaAbreviatura = producto.unidad_medida_abreviatura ?? 'S/N';
		const unidadMedidaNombre = producto.unidad_medida_nombre ?? 'S/N';

		const existente = this.carrito.find(
			(i) => i.id_producto === producto.id && i.id_presentacion === id_presentacion
		);

		if (existente) {
			if (existente.cantidad + 1 > stockDisp) {
				alert('error', `Stock insuficiente. Máximo: ${stockDisp}`);
				return;
			}
			this.carrito = this.carrito.map((i) => {
				if (i.cartId === existente.cartId) {
					const nueva_cant = i.cantidad + 1;
					return {
						...i,
						cantidad: nueva_cant,
						subtotal: Math.max(0, precio * nueva_cant - i.monto_descuento)
					};
				}
				return i;
			});
			this.itemRecienAgregado = existente.cartId;
			setTimeout(() => (this.itemRecienAgregado = null), 600);
		} else {
			if (stockDisp <= 0) {
				alert('error', 'Sin stock disponible');
				return;
			}
			const newId = `${producto.id}::${id_presentacion ?? 'unidad'}-${Date.now()}`;
			this.carrito = [
				...this.carrito,
				{
					cartId: newId,
					id_producto: producto.id,
					id_presentacion,
					nombre_comercial: producto.nombre_comercial,
					nombre_presentacion: nombrePres,
					precio_unitario: precio,
					cantidad: 1,
					factor,
					monto_descuento: 0,
					subtotal: precio,
					maneja_serie: producto.maneja_serie,
					numero_serie: producto.numero_serie_scaneado ?? '',
					stock_disponible: stockDisp,
					unidad_medida_abreviatura: unidadMedidaAbreviatura,
					unidad_medida_nombre: unidadMedidaNombre
				}
			];
			console.log('carrito::', this.carrito);
			this.itemRecienAgregado = newId;
			setTimeout(() => (this.itemRecienAgregado = null), 600);
		}
		this.mostrarDropdown = false;
	}

	cambiarCantidad(cartId: string, delta: number) {
		this.carrito = this.carrito
			.map((i) => {
				if (i.cartId !== cartId) return i;
				const nueva = i.cantidad + delta;
				if (nueva <= 0) return null as any;
				if (nueva > i.stock_disponible) {
					alert('error', `Máximo disponible: ${i.stock_disponible}`);
					return i;
				}
				return {
					...i,
					cantidad: nueva,
					subtotal: Math.max(0, i.precio_unitario * nueva - i.monto_descuento)
				};
			})
			.filter(Boolean);
	}

	setCantidad(cartId: string, nueva: number) {
		if (isNaN(nueva) || nueva < 0) return;
		this.carrito = this.carrito
			.map((i) => {
				if (i.cartId !== cartId) return i;
				if (nueva === 0) return null as any;
				if (nueva > i.stock_disponible) {
					alert('error', `Máximo disponible: ${i.stock_disponible}`);
					const max = i.stock_disponible;
					return {
						...i,
						cantidad: max,
						subtotal: Math.max(0, i.precio_unitario * max - i.monto_descuento)
					};
				}
				return {
					...i,
					cantidad: nueva,
					subtotal: Math.max(0, i.precio_unitario * nueva - i.monto_descuento)
				};
			})
			.filter(Boolean);
	}

	eliminarItem(cartId: string) {
		this.carrito = this.carrito.filter((i) => i.cartId !== cartId);
	}

	actualizarSerie(cartId: string, serie: string) {
		this.carrito = this.carrito.map((i) =>
			i.cartId === cartId ? { ...i, numero_serie: serie } : i
		);
	}

	confirmarCantidadManual() {
		if (!this.pendingProduct) return;
		const cant = parseFloat(this.cantidadManual);
		if (!cant || cant <= 0) return;
		const { producto, id_presentacion } = this.pendingProduct;
		const pres = id_presentacion
			? producto.presentaciones.find((p) => p.id === id_presentacion)
			: null;
		const precio = pres ? pres.precio_especial : (producto.precio_venta ?? 0);
		const factor = pres ? pres.factor_conversion : 1;
		const stockDisp = pres ? pres.stock_disponible : producto.stock_disponible;
		const nombrePres = pres ? pres.nombre : null;

		if (cant > stockDisp) {
			alert('error', `Stock insuficiente. Máximo: ${stockDisp}`);
			return;
		}

		const newId = `${producto.id}::${id_presentacion ?? 'unidad'}-${Date.now()}`;
		this.carrito = [
			...this.carrito,
			{
				cartId: newId,
				id_producto: producto.id,
				id_presentacion,
				nombre_comercial: producto.nombre_comercial,
				nombre_presentacion: nombrePres,
				precio_unitario: precio,
				cantidad: cant,
				factor,
				monto_descuento: 0,
				subtotal: precio * cant,
				maneja_serie: producto.maneja_serie,
				numero_serie: '',
				stock_disponible: stockDisp,
				unidad_medida_abreviatura: producto.unidad_medida_abreviatura ?? 'S/N',
				unidad_medida_nombre: producto.unidad_medida_nombre ?? 'S/N'
			}
		];
		this.modalCantidad = false;
		this.pendingProduct = null;
		this.mostrarDropdown = false;
	}

	// ─── DESCUENTOS Y PAGOS ────────────────────────────────────────────────────
	abrirDescuento(target: 'global' | string) {
		this.descuentoTarget = target;
		this.descuentoTipo = 'PORCENTAJE';
		this.descuentoValor = 0;
		this.modalDescuento = true;
	}

	aplicarDescuento() {
		if (this.descuentoTarget === 'global') {
			this.descuentoGlobal = { tipo: this.descuentoTipo, valor: this.descuentoValor };
		} else {
			this.carrito = this.carrito.map((i) => {
				if (i.cartId !== this.descuentoTarget) return i;
				const base = i.precio_unitario * i.cantidad;
				const monto =
					this.descuentoTipo === 'PORCENTAJE'
						? (base * this.descuentoValor) / 100
						: this.descuentoValor;
				return { ...i, monto_descuento: monto, subtotal: Math.max(0, base - monto) };
			});
		}
		this.modalDescuento = false;
		alert('success', 'Descuento aplicado');
	}

	irACobrar() {
		if (this.carrito.length === 0) return;
		const sinSerie = this.carrito.find((i) => i.maneja_serie && !i.numero_serie.trim());
		if (sinSerie) {
			alert('error', `Ingrese número de serie para: ${sinSerie.nombre_comercial}`);
			return;
		}
		this.montoPagado = '';
		this.modalPago = true;
	}

	async finalizarVenta() {
		if (!this.sesionActiva || !this.pagoSuficiente) return;
		this.procesandoVenta = true;
		try {
			const dto: CreateVentaDto = {
				id_sesion_caja: this.sesionActiva.id,
				id_cliente: this.clienteSeleccionado?.id ?? null,
				items: this.carrito.map((i) => ({
					id_producto: i.id_producto,
					id_presentacion: i.id_presentacion,
					cantidad: i.cantidad,
					monto_descuento: i.monto_descuento,
					numero_serie: i.numero_serie || null
				})),
				tipo_descuento_global:
					this.descuentoGlobal.valor > 0 ? this.descuentoGlobal.tipo : 'NINGUNO',
				valor_descuento_global: this.descuentoGlobal.valor,
				metodo_pago: this.metodoPago,
				monto_pagado: parseFloat(this.montoPagado),
				notas: this.notasVenta || undefined
			};
			this.ultimaVenta = await posService.crearVenta(dto);
			this.modalPago = false;
			this.modalRecibo = true;
			this.carrito = [];
			this.descuentoGlobal = { tipo: 'PORCENTAJE', valor: 0 };
			this.notasVenta = '';
			this.clienteSeleccionado = null;
			setTimeout(() => window.print(), 500);
		} catch (e: any) {
			alert('error', e?.message ?? 'Error al registrar la venta');
		} finally {
			this.procesandoVenta = false;
		}
	}

	// ─── GESTIÓN DE CLIENTES ──────────────────────────────────────────────────
	onBusquedaCliente(e: Event) {
		this.busquedaCliente = (e.target as HTMLInputElement).value;
		clearTimeout(this.clienteTimeout);
		if (!this.busquedaCliente.trim()) {
			this.resultadosCliente = [];
			return;
		}
		this.clienteTimeout = setTimeout(async () => {
			this.buscandoCliente = true;
			this.resultadosCliente = await posService.buscarClientes(this.busquedaCliente);
			this.buscandoCliente = false;
		}, 300);
	}

	// ─── HELPERS ──────────────────────────────────────────────────────────────
	fmt(n: number) {
		return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(n);
	}

	fmtDate(d: string) {
		return new Intl.DateTimeFormat('es-BO', { dateStyle: 'short', timeStyle: 'short' }).format(
			new Date(d)
		);
	}

	fmtPrec(n: number) {
		return new Intl.NumberFormat('es-BO', {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1
		}).format(n); // sin style:'currency', solo el número
	}

	handleGlobalKeydown(e: KeyboardEvent) {
		if (e.key === 'F2') {
			e.preventDefault();
			if (
				this.carrito.length > 0 &&
				!this.modalPago &&
				!this.modalRecibo &&
				!this.modalCierre &&
				!this.modalApertura &&
				!this.modalCliente &&
				!this.modalDescuento &&
				!this.modalCantidad
			)
				this.irACobrar();
		}
		if (e.key === 'Escape') {
			this.modalPago = false;
			this.modalCliente = false;
			this.modalDescuento = false;
			this.modalCierre = false;
			this.modalCantidad = false;
			this.mostrarDropdown = false;
		}
		if (e.key === 'Enter' && this.modalPago && this.pagoSuficiente && !this.procesandoVenta) {
			const activeTag = document.activeElement?.tagName.toLowerCase();
			if (activeTag !== 'button') {
				e.preventDefault();
				this.finalizarVenta();
			}
		}
	}
}
