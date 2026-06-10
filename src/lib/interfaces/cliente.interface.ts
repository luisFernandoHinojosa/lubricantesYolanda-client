export interface Cliente {
	id: string;
	ci: string;
	nombre: string;
	apellido_paterno: string;
	apellido_materno: string;
	correo_electronico: string;
	fecha_nacimiento: string;
	telefono: string;
	direccion: string;
	puntos: number;
	genero: 'M' | 'F';
	tipo_cliente: 'MIN' | 'MAY';
	esta_activo: boolean;
}

export interface ClientesResponse {
	status: string;
	data: {
		clientes: Cliente[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
	extraData: Record<string, unknown>;
}

export interface ClienteFilters {
	page?: number;
	perPage?: number;
	search?: string;
	tipo_cliente?: 'MIN' | 'MAY' | '';
}

export interface CreateClienteDto {
	ci: string;
	// zona_id: string;
	nombre: string;
	apellido_paterno: string;
	apellido_materno: string;
	correo_electronico: string;
	fecha_nacimiento: string;
	telefono: string;
	direccion: string;
	genero: 'M' | 'F';
	tipo_cliente: 'MIN' | 'MAY';
}

export interface UpdateClienteDto extends Partial<CreateClienteDto> {
	esta_activo?: boolean;
}
