export interface Zona {
	id: string;
	nombre: string;
	provincia: string;
}

export interface ZonasResponse {
	status: string;
	data: {
		zonas: Zona[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
	extraData: Record<string, unknown>;
}

export interface ZonaFilters {
	page?: number;
	perPage?: number;
	search?: string;
}

export interface CreateZonaDto {
	nombre: string;
	provincia: string;
}

export interface UpdateZonaDto extends Partial<CreateZonaDto> {
	esta_activo?: boolean;
}
