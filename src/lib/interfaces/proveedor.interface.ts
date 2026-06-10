export interface Proveedor {
	id: string;
	nombre: string;
	nit_ci: string;
	telefono: string;
	direccion: string;
	apellido_paterno: string;
	apellido_materno: string;
	esta_activo: boolean;
	empresa: string;
	// Zona: {
	// 	id: string;
	// 	nombre: string;
	// };
}
export interface ProveedorStractData {
	id: string;
	nombre: string;
	apellido_paterno: string;
	apellido_materno: string;
}

export interface ProveedorResponse {
	status: string;
	data: {
		proveedores: Proveedor[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
	extraData: Record<string, unknown>;
}

export interface ProveedorFilters {
	page?: number;
	perPage?: number;
	search?: string;
	// zona_id?: string;
}

export interface CreateProveedorDto {
	nombre: string;
	apellido_paterno: string;
	apellido_materno: string;
	empresa: string;
	// zona_id: string;
	telefono: string;
	direccion: string;
}

export interface UpdateProveedorDto extends Partial<CreateProveedorDto> {
	esta_activo?: boolean;
}
export interface ProveedorCatalogo {
	id: string;
	nombre: string;
	empresa: string;
	nit_ci: string;
}

export interface ProveedorCatalogoResponse {
	status: string;
	data: ProveedorCatalogo[];
}

