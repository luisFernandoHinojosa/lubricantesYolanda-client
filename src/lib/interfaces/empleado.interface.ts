export interface Empleado {
	status: 'success';
	data: {
		id: string;
		esta_activo: boolean;
		ci: string;
		nombre: string;
		apellido_paterno: string;
		apellido_materno: string;
		cargo: string;
		fecha_nacimiento: string;
		fecha_contratacion: string;
		fecha_despido: string | null;
		salario_base: string;
		telefono: string;
		direccion: string;
		usuario_id: string | null;
		updatedAt: string;
		createdAt: string;
		Usuario?: {
			id: string;
			name_user: string;
			email: string;
			Role?: {
				id: string;
				code_rol: string;
				nombre_rol: string;
			};
		} | null;
	};
}

export interface EmpleadoData {
	id: string;
	usuario_id: string;
	ci: string;
	nombre: string;
	apellido_paterno: string;
	apellido_materno: string;
	cargo: string;
	fecha_nacimiento: string;
	fecha_contratacion: string;
	salario_base: string;
	telefono: string;
	direccion: string;
	esta_activo: boolean;
	createdAt: string;
	updatedAt: string;
	Usuario: {
		id: string;
		name_user: string;
		email: string;
		Role: {
			id: string;
			code_rol: string;
			nombre_rol: string;
		};
	} | null;
}

export interface EmpleadosResponse {
	status: string;
	data: {
		empleados: EmpleadoData[];
		total: number;
		page: number;
		perPage: number;
		totalPages: number;
	};
}

export interface EmpleadoFilters {
	page?: number;
	perPage?: number;
	search?: string;
}

export interface CreateEmpleadoDto {
	ci: string;
	nombre: string;
	apellido_paterno: string;
	apellido_materno: string;
	cargo: string;
	fecha_nacimiento: string;
	fecha_contratacion: string;
	salario_base: number;
	telefono: string;
	direccion: string;
	usuario?: {
		rol_id: string;
		name_user: string;
		email: string;
		password: string;
		id_sucursal: string;
	};
}

export interface UpdateEmpleadoDto extends Partial<CreateEmpleadoDto> {
	esta_activo?: boolean;
}
