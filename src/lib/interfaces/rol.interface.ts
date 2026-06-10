// $lib/interfaces/rol.interface.ts

export interface Rol {
	id: string;
	nombre_rol: string;
	code_rol: string;
	descripcion: string;
	createdAt: string;
	updatedAt: string;
}

export interface RolesResponse {
	status: string;
	data: Rol[];
}

export interface RolFilters {
	page?: number;
	perPage?: number;
	search?: string;
}

export interface CreateRolDto {
	nombre_rol: string;
	code_rol: string;
	descripcion: string;
}

export interface UpdateRolDto {
	nombre_rol?: string;
	code_rol?: string;
	descripcion?: string;
}
