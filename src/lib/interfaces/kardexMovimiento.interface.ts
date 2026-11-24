export type TipoMovimientoKardex =
	| 'INGRESO'
	| 'VENTA'
	| 'TRASLADO'
	| 'AJUSTE'
	| 'DEVOLUCION'
	| 'ANULACION';

export type NaturalezaKardex = 'ENTRADA' | 'SALIDA' | 'NEUTRO';

export interface UbicacionKardex {
	id: string;
	nombre: string;
	tipo_area: 'VENTA' | 'DEPOSITO' | 'MERMA' | null;
	sucursal: { id: string; nombre: string } | null;
	ubicacion_fisica: { id: string; nombre: string } | null;
	/** "Sucursal › Ubicación › Estante" */
	descripcion: string;
}

export interface KardexMovimiento {
	id: string;
	fecha: string;
	tipo_movimiento: TipoMovimientoKardex;
	naturaleza: NaturalezaKardex;
	cantidad: number;
	entrada: number;
	salida: number;
	cantidad_signada: number;
	costo_unitario: number;
	valor_total: number;
	producto: {
		id: string;
		nombre: string;
		sku: string | null;
		codigo_producto: string | null;
		codigo_barras: string | null;
		marca: string | null;
		categoria: string | null;
		unidad: string | null;
	};
	lote: {
		id: string;
		codigo: string;
		fecha_vencimiento: string | null;
		proveedor: { id: string; nombre: string } | null;
	};
	origen: UbicacionKardex | null;
	destino: UbicacionKardex | null;
	usuario: { id: string; nombre: string } | null;
	documento: { tipo: string; numero: string } | null;
	observacion: string | null;
	/** Solo en la tarjeta kardex */
	saldo?: number;
	saldo_valorizado?: number;
}

export interface KardexResumenListado {
	entradas: number;
	salidas: number;
	neutros: number;
	valor_entradas: number;
	valor_salidas: number;
}

export interface KardexPaginatedData {
	kardexMovimientos: KardexMovimiento[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
	resumen: KardexResumenListado;
}

export interface KardexApiResponse {
	status: string;
	data: KardexPaginatedData;
}

export interface KardexFilters {
	page?: number;
	perPage?: number;
	search?: string;
	desde?: string;
	hasta?: string;
	tipo_movimiento?: string;
	naturaleza?: NaturalezaKardex | '';
	id_sucursal?: string;
	id_ubicacion?: string;
	id_producto?: string;
	id_lote?: string;
	id_usuario?: string;
	sortBy?: 'fecha' | 'cantidad' | 'producto' | 'tipo_movimiento';
	sortOrder?: 'ASC' | 'DESC';
}

export interface TarjetaKardexFilters {
	page?: number;
	perPage?: number;
	desde?: string;
	hasta?: string;
	tipo_movimiento?: string;
	naturaleza?: NaturalezaKardex | '';
	id_sucursal?: string;
	id_ubicacion?: string;
	id_lote?: string;
	sortOrder?: 'ASC' | 'DESC';
}

export interface TarjetaKardex {
	producto: {
		id: string;
		nombre: string;
		sku: string | null;
		codigo_producto: string | null;
		codigo_barras: string | null;
		imagen_url: string | null;
		stock_minimo: number | null;
		maneja_vencimiento: boolean;
		marca: string | null;
		categoria: string | null;
		unidad: string | null;
	};
	lotes: { id: string; codigo: string; fecha_vencimiento: string | null; esta_activo: boolean }[];
	periodo: { desde: string | null; hasta: string | null };
	resumen: {
		saldo_inicial: number;
		total_entradas: number;
		total_salidas: number;
		saldo_final: number;
		valor_inicial: number;
		valor_entradas: number;
		valor_salidas: number;
		valor_final: number;
		movimientos: number;
	};
	cuadre: {
		saldo_kardex: number;
		stock_sistema: number;
		diferencia: number;
		cuadra: boolean;
	};
	movimientos: KardexMovimiento[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
}
