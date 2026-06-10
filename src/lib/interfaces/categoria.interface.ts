export interface Categoria {
	id: string;
	esta_activo: boolean;
	nombre: string;
	descripcion: string;
	updatedAt: string;
	createdAt: string;
}

export interface CategoriaResponse {
	status: string;
	data: {
		categorias: Categoria[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
}

export interface CategoriaFilters {
	page?: number;
	perPage?: number;
	search?: string;
}

export interface CreateCategoriaDto {
	nombre: string;
	descripcion: string;
}

export interface UpdateCategoriaDto extends Partial<CreateCategoriaDto> {
	esta_activo?: boolean;
}
