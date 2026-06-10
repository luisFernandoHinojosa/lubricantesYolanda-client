import type { TIPO_MOVIMIENTO } from '$lib/types';

export interface CategoriaExtra {
	id: string;
	nombre: string;
	tipo: TIPO_MOVIMIENTO;
}

export interface Movimiento {
	id: string;
	nombre: string;
	monto: string;
	descripcion: string;
	fecha: string;
	tipo: TIPO_MOVIMIENTO;
	tipoPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'QR' | 'CHEQUE' | 'OTRO';
	divisa: string;
	categoriaMovimientoId: string;
	sucursalId: string;
	empleadoId: string;
	esta_activo: boolean;
	createdAt: string;
	updatedAt: string;
	categoria_movimiento?: {
		id: string;
		nombre: string;
	};
	sucursal?: {
		id: string;
		nombre: string;
	};
	empleado?: {
		id: string;
		nombre: string;
		apellido_paterno: string;
	};
}

export interface MovimientoResponse {
	status: string;
	data: {
		movimientos: Movimiento[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
		extraData: {
			categoriasMovimientos: CategoriaExtra[];
		};
	};
}

export interface MovimientoFilters {
	page?: number;
	perPage?: number;
	search?: string;
	tipo?: TIPO_MOVIMIENTO;
	tipoPago?: string;
	divisa?: string;
	categoriaMovimientoId?: string;
	sucursalId?: string;
	sortBy?: string;
	sortOrder?: 'ASC' | 'DESC';
}

export interface CreateMovimientoDto {
	nombre: string;
	monto: number;
	descripcion: string;
	fecha: string;
	tipo: TIPO_MOVIMIENTO;
	tipoPago: string;
	divisa: string;
	categoriaMovimientoId: string;
}

export interface UpdateMovimientoDto extends Partial<CreateMovimientoDto> {
	esta_activo?: boolean;
}

export interface ReporteMovimientoFilters {
	page?: number;
	perPage?: number;
	startDate: string;
	endDate: string;
	search?: string;
}

export interface EstadisticasMovimiento {
	totalIngresos: number;
	totalEgresos: number;
	balance: number;
	cantidadIngresos: number;
	cantidadEgresos: number;
	totalMovimientos: number;
}

export interface ReporteMovimientoResponse {
	status: string;
	data: {
		movimientos: Movimiento[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
		estadisticas: EstadisticasMovimiento;
	};
}
