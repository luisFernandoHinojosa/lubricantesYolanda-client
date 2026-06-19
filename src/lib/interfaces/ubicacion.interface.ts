// export interface Ubicacion {
// 	id: string;
// 	nombre: string;
// }

export interface UbicacionesResponse {
	status: string;
	data: {
		ubicaciones: Ubicacion[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
}

export interface Ubicacion {
	id?: string;
	id_sucursal: string;
	nombre: string;
	descripcion?: string | null;
	tipo_area: 'Venta' | 'Deposito' | 'Merma';
	esta_activo?: boolean;
	createdAt?: string;
}

export interface UbicacionResponse {
	status: string;
	data: {
		ubicaciones: Ubicacion[];
		total: number;
		page?: number;
		perPage?: number;
		totalPages?: number;
	};
}

export interface CreateUbicacionDto {
	id_sucursal: string;
	nombre: string;
	descripcion?: string;
	tipo_area?: 'VENTA' | 'DEPOSITO' | 'MERMA';
}

export interface UpdateUbicacionDto extends Partial<CreateUbicacionDto> {
	esta_activo?: boolean;
}

export interface UbicacionCatalogo {
	id: string;
	nombre: string;
	id_sucursal: string;
}

export interface UbicacionCatalogoResponse {
	status: string;
	data: Ubicacion[];
}

// --- Ubicaciones Físicas (hijas de Ubicación Macro) ---

export interface UbicacionFisica {
	id?: string;
	id_ubicacion: string;
	nombre: string;
	descripcion?: string | null;
	esta_activo?: boolean;
	createdAt?: string;
	ubicacion?: {
		id: string;
		nombre: string;
		tipo_area: string;
	};
}

export interface UbicacionesFisicasResponse {
	status: string;
	data: UbicacionFisica[];
}

export interface CreateUbicacionFisicaDto {
	id_ubicacion: string;
	nombre: string;
	descripcion?: string;
}

export interface UpdateUbicacionFisicaDto extends Partial<CreateUbicacionFisicaDto> {
	esta_activo?: boolean;
}
