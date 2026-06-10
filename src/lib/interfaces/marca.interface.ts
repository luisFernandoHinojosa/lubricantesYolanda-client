export interface Marca {
	id: string;
	esta_activo: boolean;
	nombre: string;
	descripcion: string;
	updatedAt: string;
	createdAt: string;
}

export interface MarcaResponse {
	status: string;
	data: {
		marcas: Marca[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
}

export interface MarcaFilters {
	page?: number;
	perPage?: number;
	search?: string;
}

export interface CreateMarcaDto {
	nombre: string;
	descripcion: string;
}

export interface UpdateMarcaDto extends Partial<CreateMarcaDto> {
	esta_activo?: boolean;
}
