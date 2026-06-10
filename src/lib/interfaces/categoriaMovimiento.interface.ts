export interface CategoriaMovimiento {
	id: string;
	nombre: string;
	descripcion: string;
	tipo: 'INGRESO' | 'EGRESO';
	esta_activo: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CategoriaMovimientoResponse {
	status: string;
	data: {
		categoriasMovimientos: CategoriaMovimiento[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
}

export interface CategoriaMovimientoFilters {
	page?: number;
	perPage?: number;
	search?: string;
	tipo?: 'INGRESO' | 'EGRESO';
}

export interface CreateCategoriaMovimientoDto {
	nombre: string;
	descripcion: string;
	tipo: 'INGRESO' | 'EGRESO';
}

export interface UpdateCategoriaMovimientoDto extends Partial<CreateCategoriaMovimientoDto> {
	esta_activo?: boolean;
}
