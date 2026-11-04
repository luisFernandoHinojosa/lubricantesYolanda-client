import { posService } from '$lib/services/pos.service';
import { clienteService } from '$lib/services/cliente.service';
import { alert } from '$lib/utils';
import type {
	ProductoPOS,
	CartItem,
	SesionCaja,
	ClientePOS,
	VentaResponse,
	ResumenCierre,
	ResumenVentasSesion,
	CreateVentaDto,
	ClienteVentaDto,
	PagoVenta
} from '$lib/interfaces/venta.interface';
import { SvelteDate } from 'svelte/reactivity';
import { POS_CARRITO_KEY } from '$lib/constants';

export interface ClienteFormState {
	ci: string;
	// Código SIAT: 1=CI, 2=CEX, 3=PAS, 4=OD, 5=NIT
	tipo_documento: number;
	complemento: string;
	nombre: string;
	apellido_paterno: string;
	telefono: string;
	genero: 'M' | 'F' | 'O' | '';
}

const clienteFormVacio = (): ClienteFormState => ({
	ci: '',
	tipo_documento: 1, // CI por defecto
	complemento: '',
	nombre: '',
	apellido_paterno: '',
	telefono: '',
	genero: ''
});

export class VentasState {
	sesionActiva = $state<SesionCaja | null>(null);
	cargandoSesion = $state(true);

	modalApertura = $state(true);
	modalCierre = $state(false);
	modalRecibo = $state(false);
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

	// Facturación: la factura se emite con los datos del cliente (CI/NIT, nombre y tipo de documento)
	facturar = $state(false);
	// Recargo del IVA que se cobra al cliente cuando la venta es con factura (0 a 100)
	porcentajeRecargoIva = $state(13);

	// Cliente en la venta actual
	clienteActivo = $state(false);
	clienteEncontrado = $state<boolean | null>(null); // null = no buscado aún, true = existe, false = nuevo
	buscandoCi = $state(false);
	clienteForm = $state<ClienteFormState>(clienteFormVacio());

	// El backend registra el cliente si su CI no existe; en ese caso exige el teléfono
	esClienteNuevo = $derived(
		this.clienteActivo && this.clienteSeleccionado?.ci !== this.clienteForm.ci.trim()
	);

	// No se puede facturar a Público General: se requiere un cliente con CI/NIT
	clienteFacturable = $derived(this.clienteActivo && this.clienteForm.ci.trim().length > 0);

	descuentoGlobal = $state({
		tipo: 'FIJO' as 'PORCENTAJE' | 'FIJO' | 'NINGUNO',
		valor: 0
	});

	pagos = $state<PagoVenta[]>([{ metodo_pago: 'EFECTIVO', monto: 0 }]);
	// Mientras el cajero no edite los pagos, el único pago sigue al total de la venta
	pagoAutomatico = $state(true);
	notasVenta = $state('');
	procesandoVenta = $state(false);
	ultimaVenta = $state<VentaResponse | null>(null);

	horaActual = $state(
		new SvelteDate().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
	);

	private searchTimeout: unknown;

	// ─── DERIVADOS ─────────────────────────────────────────────────────────────
	subtotalItems = $derived(this.carrito.reduce((acc, i) => acc + i.subtotal, 0));

	montoDescuentoGlobal = $derived(() => {
		if (this.descuentoGlobal.valor <= 0) return 0;
		if (this.descuentoGlobal.tipo === 'PORCENTAJE')
			return (this.subtotalItems * this.descuentoGlobal.valor) / 100;
		return this.descuentoGlobal.valor;
	});

	descuentoExcedido = $derived(this.montoDescuentoGlobal() > this.subtotalItems);

	totalSinRecargo = $derived(Math.max(0, this.subtotalItems - this.montoDescuentoGlobal()));

	recargoIvaValido = $derived(
		this.porcentajeRecargoIva >= 0 && this.porcentajeRecargoIva <= 100
	);

	montoRecargoIva = $derived(
		this.facturar && this.recargoIvaValido && this.porcentajeRecargoIva > 0
			? Math.round(this.totalSinRecargo * this.porcentajeRecargoIva) / 100
			: 0
	);

	totalFinal = $derived(this.totalSinRecargo + this.montoRecargoIva);

	totalPagado = $derived(this.pagos.reduce((acc, p) => acc + (Number(p.monto) || 0), 0));

	cambio = $derived(
		this.totalPagado > 0 ? Math.max(0, this.totalPagado - this.totalFinal) : 0
	);

	pagoSuficiente = $derived(
		this.totalPagado >= this.totalFinal && this.totalFinal > 0
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
		$effect(() => {
			if (this.pagoAutomatico && this.pagos.length === 1) {
				this.pagos[0].monto = this.totalFinal;
			}
		});
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
					return this.conCantidad(i, nueva_cant);
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

	// El descuento del ítem es un monto fijo en Bs: si baja la cantidad no puede superar el nuevo total
	private conCantidad(i: CartItem, cantidad: number): CartItem {
		const base = i.precio_unitario * cantidad;
		const monto_descuento = Math.min(i.monto_descuento, base);
		return { ...i, cantidad, monto_descuento, subtotal: base - monto_descuento };
	}

	cambiarCantidad(cartId: string, delta: number) {
		this.carrito = this.carrito
			.map((i) => {
				if (i.cartId !== cartId) return i;
				const nueva = Math.max(0, i.cantidad + delta);
				if (nueva > i.stock_disponible) {
					alert('error', `Máximo disponible: ${i.stock_disponible}`);
					return i;
				}
				return this.conCantidad(i, nueva);
			});
	}

	setCantidad(cartId: string, nueva: number) {
		const cantidadFinal = isNaN(nueva) || nueva < 0 ? 0 : nueva;
		this.carrito = this.carrito
			.map((i) => {
				if (i.cartId !== cartId) return i;
				if (cantidadFinal > i.stock_disponible) {
					alert('error', `Máximo disponible: ${i.stock_disponible}`);
					return this.conCantidad(i, i.stock_disponible);
				}
				return this.conCantidad(i, cantidadFinal);
			});
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
	// Descuento del ítem en Bs, editado directamente en la fila del carrito
	setDescuentoItem(cartId: string, monto: number) {
		this.carrito = this.carrito.map((i) => {
			if (i.cartId !== cartId) return i;
			const base = i.precio_unitario * i.cantidad;
			let monto_descuento = isNaN(monto) || monto < 0 ? 0 : Math.round(monto * 100) / 100;
			if (monto_descuento > base) {
				alert('error', 'El descuento no puede ser mayor al total del producto.');
				monto_descuento = base;
			}
			return { ...i, monto_descuento, subtotal: base - monto_descuento };
		});
	}

	// El nuevo pago se propone con lo que falta cubrir, para que el cajero solo elija el método
	agregarPago() {
		this.pagoAutomatico = false;
		const falta = Math.max(0, Math.round((this.totalFinal - this.totalPagado) * 100) / 100);
		this.pagos = [...this.pagos, { metodo_pago: 'QR', monto: falta }];
	}

	// Al volver a un solo pago, este vuelve a seguir el total de la venta
	removerPago(index: number) {
		this.pagos = this.pagos.filter((_, i) => i !== index);
		if (this.pagos.length === 1) this.pagoAutomatico = true;
	}

	marcarPagoManual() {
		this.pagoAutomatico = false;
	}

	private validarCarrito(): boolean {
		if (this.carrito.length === 0) return false;
		const productoConCero = this.carrito.find((i) => i.cantidad <= 0);
		if (productoConCero) {
			alert('error', `El producto "${productoConCero.nombre_comercial}" no puede tener cantidad cero.`);
			return false;
		}
		const sinSerie = this.carrito.find((i) => i.maneja_serie && !i.numero_serie.trim());
		if (sinSerie) {
			alert('error', `Ingrese número de serie para: ${sinSerie.nombre_comercial}`);
			return false;
		}
		return true;
	}

	async finalizarVenta() {
		if (!this.sesionActiva || !this.validarCarrito() || !this.pagoSuficiente) return;

		if (this.descuentoExcedido) {
			alert('error', 'El descuento no puede ser mayor al subtotal de la venta.');
			return;
		}

		// Validaciones de Facturación
		if (this.facturar && !this.clienteFacturable) {
			alert('error', 'Para facturar asigne un cliente con CI o NIT. No se puede facturar a Público General.');
			return;
		}

		if (this.facturar && !this.recargoIvaValido) {
			alert('error', 'El recargo del IVA debe estar entre 0 y 100%.');
			return;
		}

		// Validaciones de Cliente si se asigna un cliente
		if (this.clienteActivo) {
			if (!this.clienteForm.ci.trim()) {
				alert('error', 'Ingrese y busque el CI o NIT del cliente.');
				return;
			}
			if (!this.clienteForm.nombre.trim()) {
				alert('error', 'El nombre del cliente es obligatorio.');
				return;
			}
			if (this.esClienteNuevo && !this.clienteForm.telefono.trim()) {
				alert('error', 'El teléfono es obligatorio para registrar un cliente nuevo.');
				return;
			}
			if (this.esClienteNuevo && !this.clienteForm.genero) {
				alert('error', 'Seleccione el género para registrar un cliente nuevo.');
				return;
			}
		}

		this.procesandoVenta = true;
		try {
			const dto: CreateVentaDto = {
				id_sesion_caja: this.sesionActiva.id,
				tipo_descuento_global:
					this.descuentoGlobal.valor > 0 ? this.descuentoGlobal.tipo : 'NINGUNO',
				// El input vacío deja el valor en null
				valor_descuento_global: Number(this.descuentoGlobal.valor) || 0,
				items: this.carrito.map((i) => ({
					id_producto: i.id_producto,
					id_presentacion: i.id_presentacion,
					cantidad: i.cantidad,
					monto_descuento: i.monto_descuento,
					numero_serie: i.numero_serie || null
				})),
				pagos: this.pagos.filter(p => p.monto > 0),
				notas: this.notasVenta || undefined,
				facturar: this.facturar,
				porcentaje_recargo_iva: this.facturar ? Number(this.porcentajeRecargoIva) || 0 : 0
			};

			// Si la venta es con cliente, se envía el atributo "cliente"; si es sin cliente, NO se envía
			if (this.clienteActivo && this.clienteForm.ci.trim() && this.clienteForm.nombre.trim()) {
				dto.cliente = {
					ci: this.clienteForm.ci.trim(),
					tipo_documento: Number(this.clienteForm.tipo_documento) || 1,
					complemento: this.clienteForm.complemento.trim() || undefined,
					nombre: this.clienteForm.nombre.trim(),
					apellido_paterno: this.clienteForm.apellido_paterno.trim() || undefined,
					telefono: this.clienteForm.telefono.trim() || undefined,
					genero: this.clienteForm.genero || undefined
				};
			}

			const venta = await posService.crearVenta(dto);
			this.ultimaVenta = venta;
			this.modalRecibo = true;
			this.carrito = [];
			this.descuentoGlobal = { tipo: 'FIJO', valor: 0 };
			this.pagos = [{ metodo_pago: 'EFECTIVO', monto: 0 }];
			this.pagoAutomatico = true;
			this.notasVenta = '';
			this.seleccionarClientePublicoGeneral();
			setTimeout(() => {
				window.print();
				// Se muestra después de imprimir para que la alerta no salga en el recibo
				if (venta.resultado_facturacion?.success === false) {
					alert(
						'error',
						`La venta ${venta.numero_comprobante} se registró, pero ocurrió un error al emitir la factura. Puede intentar facturarla nuevamente desde la sección Historial de ventas.`,
						{ x: 'center', y: 'top' },
						{ permanent: true }
					);
				}
			}, 500);
		} catch (e: any) {
			alert('error', e?.message ?? 'Error al registrar la venta');
		} finally {
			this.procesandoVenta = false;
		}
	}

	// ─── GESTIÓN DE CLIENTES Y FACTURACIÓN ──────────────────────────────────
	async buscarClientePorCi(ciIngresado?: string) {
		const ci = (ciIngresado ?? this.clienteForm.ci).trim();
		if (!ci) {
			alert('error', 'Ingrese un número de CI o NIT');
			return;
		}

		this.buscandoCi = true;
		try {
			const cliente = await clienteService.getClienteByCi(ci);
			if (cliente) {
				this.clienteActivo = true;
				this.clienteEncontrado = true;
				this.clienteForm = {
					ci: cliente.ci,
					tipo_documento: cliente.tipo_documento ?? 1,
					complemento: cliente.complemento || '',
					nombre: cliente.nombre,
					apellido_paterno: cliente.apellido_paterno || '',
					telefono: cliente.telefono || '',
					genero: cliente.genero || ''
				};
				this.clienteSeleccionado = {
					id: cliente.id,
					nombre: cliente.nombre,
					apellido_paterno: cliente.apellido_paterno || '',
					apellido_materno: cliente.apellido_materno || '',
					ci: cliente.ci,
					nit: (cliente as any).nit || cliente.ci,
					tipo_documento: cliente.tipo_documento,
					complemento: cliente.complemento,
					telefono: cliente.telefono || '',
					direccion: cliente.direccion || '',
					puntos: cliente.puntos || 0
				};

				const nombreCompleto = [cliente.nombre, cliente.apellido_paterno, cliente.apellido_materno]
					.filter(Boolean)
					.join(' ');
				alert('success', `Cliente encontrado: ${nombreCompleto}`);
			} else {
				this.clienteActivo = true;
				this.clienteEncontrado = false;
				this.clienteSeleccionado = null;
				this.clienteForm = { ...clienteFormVacio(), ci };
				alert('info', 'Cliente no registrado. Complete sus datos para registrarlo con esta venta.');
			}
		} catch (e: any) {
			alert('error', e?.message ?? 'No se pudo buscar el cliente');
		} finally {
			this.buscandoCi = false;
		}
	}

	seleccionarClientePublicoGeneral() {
		this.clienteActivo = false;
		this.clienteSeleccionado = null;
		this.clienteEncontrado = null;
		this.clienteForm = clienteFormVacio();
		// A Público General no se le puede facturar
		this.facturar = false;
	}

	// "Cambiar" cliente: sigue siendo venta con cliente, pero vuelve a la búsqueda
	nuevaBusquedaCliente() {
		this.clienteActivo = true;
		this.clienteSeleccionado = null;
		this.clienteEncontrado = null;
		this.clienteForm = clienteFormVacio();
	}

	// Cliente nuevo: se registra junto con la venta
	registrarClienteNuevo(datos: Partial<Pick<ClienteFormState, 'ci' | 'nombre'>> = {}) {
		this.clienteActivo = true;
		this.clienteSeleccionado = null;
		this.clienteEncontrado = false;
		this.clienteForm = { ...clienteFormVacio(), ...datos };
	}

	toggleFacturacion(forzarValor?: boolean) {
		const nuevoValor = forzarValor !== undefined ? forzarValor : !this.facturar;
		this.facturar = nuevoValor;

		// Para facturar se necesita un cliente con CI/NIT: si aún no hay, se pasa a "Cliente" para asignarlo
		if (nuevoValor && !this.clienteFacturable) {
			this.clienteActivo = true;
		}
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
				!this.procesandoVenta &&
				!this.modalRecibo &&
				!this.modalCierre &&
				!this.modalApertura &&
				!this.modalCantidad
			)
				this.finalizarVenta();
		}
		if (e.key === 'Escape') {
			this.modalCierre = false;
			this.modalCantidad = false;
			this.mostrarDropdown = false;
		}
	}
}
