export type TipoCliente = 'MIN' | 'MAY';
export type GeneroCliente = 'M' | 'F' | 'O';

export interface Cliente {
	id: string;
	ci: string;
	/** 1=CI, 2=CEX, 3=PAS, 4=OD, 5=NIT */
	tipo_documento: number;
	complemento: string | null;
	nombre: string;
	/** Hoy guarda los apellidos completos */
	apellido_paterno: string | null;
	/** @deprecated El backend ya no lo usa; se mantiene por compatibilidad de lectura */
	apellido_materno: string | null;
	correo_electronico: string;
	fecha_nacimiento: string | null;
	telefono: string;
	direccion: string | null;
	puntos: number;
	genero: GeneroCliente | null;
	tipo_cliente: TipoCliente;
	esta_activo: boolean;
	createdAt?: string;
	updatedAt?: string;
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
	extraData?: Record<string, unknown>;
}

export type ClienteSortBy = 'createdAt' | 'nombre' | 'puntos' | 'apellido_paterno';
export type ClienteSortOrder = 'asc' | 'desc';

export interface ClienteFilters {
	page?: number;
	perPage?: number;
	search?: string;
	tipo_cliente?: TipoCliente | '';
	/** Sin valor se listan activos e inactivos */
	esta_activo?: 'true' | 'false' | '';
	sortBy?: ClienteSortBy;
	sortOrder?: ClienteSortOrder;
}

export interface ClienteTop {
	id: string;
	nombre: string;
	puntos: number;
	apellido_paterno: string | null;
	apellido_materno: string | null;
}

export interface CreateClienteDto {
	ci: string;
	tipo_documento?: number;
	complemento?: string | null;
	nombre: string;
	apellido_paterno?: string | null;
	correo_electronico?: string;
	fecha_nacimiento?: string | null;
	telefono: string;
	direccion?: string | null;
	genero?: GeneroCliente | null;
	tipo_cliente?: TipoCliente;
}

/**
 * Actualización parcial y estricta: cualquier campo desconocido (id, puntos, createdAt…)
 * es rechazado con 422. Los puntos solo se cambian con `ajustarPuntos`.
 */
export interface UpdateClienteDto extends Partial<CreateClienteDto> {
	esta_activo?: boolean;
}

export interface AjustePuntosDto {
	/** Entero distinto de 0: positivo suma, negativo resta */
	puntos: number;
	motivo?: string;
}
