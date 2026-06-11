import type { Categoria } from './categoria.interface';
import type { Marca } from './marca.interface';
import type { UnidadMedida } from './unidadMedida.interface';

export interface Producto {
	id: string;
	codigo_barras: string;
	nombre_comercial: string;
	descripcion?: string | null;
	id_categoria: string;
	id_marca: string;
	id_unidad_medida: string;
	precio_venta: number;
	stock_minimo: number;
	maneja_vencimiento: boolean;
	foto?: string | null;
	imagen_url?: string | null;
	estado: boolean;
	esta_activo?: boolean;
	createdAt: string;
	updatedAt: string;
	categoria?: {
		nombre: string;
	};
	marca?: {
		nombre: string;
	};
	unidad_medida?: {
		nombre: string;
		abreviatura: string;
	};
	proveedor?: {
		nombre: string;
	};
	ubicacion?: {
		nombre: string;
		tipo_area: string;
	};
	stock_actual: number;
	stock_actual_consolidado?: number;
	presentaciones?: Presentacion[];
	lotes?: Lote[];
}

export interface Lote {
	id: string;
	id_producto: string;
	id_proveedor: string;
	codigo_lote: string;
	costo_compra_unitario: string | number;
	precio_venta_sugerido: string | number;
	fecha_vencimiento: string | null;
	fecha_ingreso: string;
	createdAt: string;
	updatedAt: string;
	proveedor?: {
		nombre: string;
	};
	stock_distribuciones?: StockDistribucion[];
	stock_lote_total: number;
}

export interface StockDistribucion {
	id: string;
	id_lote: string;
	id_ubicacion: string;
	id_ubicacion_fisica: string;
	cantidad_actual: string | number;
	createdAt: string;
	updatedAt: string;
	ubicacion?: {
		nombre: string;
		tipo_area: string;
	};
}

export interface Presentacion {
	id: string;
	id_producto: string;
	id_unidad_medida: string | null;
	nombre: string;
	codigo_barras: string | null;
	sku: string | null;
	factor_conversion: string | number;
	precio_especial: string | number;
	esta_activo: boolean;
	unidad_medida?: {
		nombre: string;
		abreviatura: string;
	} | null;
}

export interface ProductosResponse {
	status: string;
	data: {
		productos: Producto[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
	extraData: {
		categorias: Categoria[];
		marcas: Marca[];
		unidades_medida: UnidadMedida[];
	};
}

export interface ProductoFilters {
	page?: number;
	perPage?: number;
	search?: string;
	id_categoria?: string;
	id_marca?: string;
	id_proveedor?: string;
}

export interface PresentacionDto {
	id_producto: string;
	id_unidad_medida?: string | null;
	nombre: string;
	factor_conversion: number;
	precio_especial?: number;
	sku?: string | null;
	codigo_barras?: string | null;
}

export interface CargaInicialDto {
	id_sucursal: string;
	id_ubicacion_destino: string;
	cantidad_base: number;
	costo_unitario: number;
	precio_venta: number | 0;
	id_proveedor: string;
	fecha_vencimiento?: string | null;
	distribuciones: {
		id_ubicacion: string | null;
		id_ubicacion_fisica: string | null;
		cantidad: number;
	}[];
}

export interface CreateLoteDto {
	id_producto: string;
	id_proveedor: string;
	costo_compra_unitario: number | string;
	fecha_vencimiento: string | null;
	fecha_ingreso: string;
	codigo_lote: string;
}

export interface UpdateLoteDto extends Partial<CreateLoteDto> {}

/**
 * DTO para crear un producto del catálogo.
 * Solo datos maestros + presentaciones + carga inicial.
 */
export interface CreateProductoDto {
	codigo_barras: string;
	nombre_comercial: string;
	descripcion?: string;
	id_categoria: string;
	id_marca: string;
	id_unidad_medida: string;
	stock_minimo: number;
	precio_venta: number;
	maneja_vencimiento: boolean;
	presentaciones?: PresentacionDto[];
	carga_inicial?: CargaInicialDto;
	foto?: File | string | null;
}

export interface TotalStockResponse {
	status: string;
	data: { total: number };
}

export interface StockPorUbicacionRaw {
	id_sucursal: string;
	sucursal: string;
	id_ubicacion: string;
	area: string;
	tipo_area: 'Venta' | 'Deposito' | 'Merma';
	id_ubicacion_fisica: string | null;
	estante: string | null;
	cantidad: number;
}

export interface StockPorUbicacionResponse {
	status: string;
	data: StockPorUbicacionRaw[];
}

export interface StockDistribucionResponse {
	status: string;
	data: {
		stockDistribucion: StockDistribucion[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
}

// DTO traslado
export interface TrasladoStockDto {
	id_lote: string;
	id_ubicacion_origen: string;
	id_ubicacion_fisica_origen?: string | null;
	id_ubicacion_destino: string;
	id_ubicacion_fisica_destino?: string | null;
	cantidad: number;
	observacion?: string;
}

export interface UpdateProductoDto extends Partial<CreateProductoDto> {
	esta_activo?: boolean;
}
