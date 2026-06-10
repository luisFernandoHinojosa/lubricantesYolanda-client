export interface Sucursal {
	id?: string;
	nombre: string;
	direccion?: string;
	telefono?: string;
	ciudad?: string;
	responsable?: string;
	esta_activo?: boolean;
	createdAt?: string;
}

export interface SucursalResponse {
	status: string;
	data: {
		sucursales: Sucursal[];
		total: number;
		page?: number;
		perPage?: number;
		totalPages?: number;
	};
}

export interface SucursalCatalogoResponse {
	status: string;
	data: Sucursal[]
}
