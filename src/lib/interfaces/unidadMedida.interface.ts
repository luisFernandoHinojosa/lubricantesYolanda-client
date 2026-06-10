export interface UnidadMedida {
	id: string;
	esta_activo: boolean;
	nombre: string;
	abreviatura: string;
	updatedAt: string;
	createdAt: string;
}

export interface UnidadMedidaResponse {
	status: string;
	data: {
		unidadMedidas: UnidadMedida[] | [];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
}

export interface UnidadMedidaFilters {
	page?: number;
	perPage?: number;
	search?: string;
}

export interface CreateUnidadMedidaDto {
	nombre: string;
	abreviatura: string;
}

export interface UpdateUnidadMedidaDto extends Partial<CreateUnidadMedidaDto> {
	esta_activo?: boolean;
}
