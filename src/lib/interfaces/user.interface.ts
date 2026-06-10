export interface User {
	id: string;
	email: string;
	name_user: string;
	token: string | null;
	rol_id: string;
	password_hash: string;
	password_reset_token: string | null;
	password_reset_expires: string | null;
	esta_activo: boolean;
	createdAt: string;
	updatedAt: string;
	empleado_id: string | null;
	code_rol: string;
	id_sucursal: string;
	Empleado?: {
		id: string;
		nombre: string;
		ci: string;
		apellido_paterno: string;
		apellido_materno: string | null;
		fecha_nacimiento: string;
		fecha_contratacion: string;
		salario_base: number;
		direccion: string;
		telefono: string;
		cargo: string;
		fecha_despido: string | null;
	};
	Role?: {
		id: string;
		nombre_rol: string;
		code_rol: string;
	};
}

export interface Profile {
	status: string;
	data: {
		id: string;
		rol_id: string;
		name_user: string;
		email: string;
		password_hash: string;
		password_reset_token: string | null;
		password_reset_expires: string | null;
		esta_activo: boolean;
		createdAt: string;
		updatedAt: string;
		empleado_id: string | null;
		Empleado?: {
			id: string;
			nombre: string;
			ci: string;
			apellido_paterno: string;
			apellido_materno: string | null;
		};
		Role?: {
			id: string;
			nombre_rol: string;
			code_rol: string;
		};
	};
}

export interface Usuario {
	id: string;
	rol_id: string;
	name_user: string;
	email: string;
	password_hash: string;
	password_reset_token: string | null;
	password_reset_expires: string | null;
	esta_activo: boolean;
	createdAt: string;
	updatedAt: string;
	empleado_id: string | null;
	Empleado?: {
		id: string;
		nombre: string;
		ci: string;
		apellido_paterno: string;
		apellido_materno: string | null;
	};
	Role?: {
		id: string;
		nombre_rol: string;
		code_rol: string;
	};
	rol?: {
		id: string;
		nombre_rol: string;
		code_rol: string;
	};
}

export interface UsuariosResponse {
	status: string;
	data: Usuario[];
}

export interface UsuarioFilters {
	page?: number;
	perPage?: number;
	search?: string;
	rol_id?: string;
	esta_activo?: boolean;
}

export interface CreateUsuarioDto {
	rol_id: string;
	name_user: string;
	email: string;
	password: string;
	id_sucursal: string;
}

export interface UpdateUsuarioDto {
	rol_id?: string;
	name_user?: string;
	email?: string;
	password?: string;
	esta_activo?: boolean;
}
