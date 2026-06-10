export interface LoginCredentials {
	email: string;
	password: string;
}

export interface AuthActionResponse {
	status: string;
	message: string;
}

export interface ForgotPasswordRequest {
	email: string;
}

export interface ResetPasswordRequest {
	password: string;
}

export interface LoginResponse {
	status: 'success' | 'error';
	accessToken: string;
	refreshToken: string;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
}



export interface CurrentUser {
	id: string,
	rol_id: string,
	id_sucursal: string,
	name_user: string,
	email: string,
	esta_activo: boolean,
	createdAt: string,
	updatedAt: string,
	Empleado: null | {
		id: string,
		usuario_id: string,
		ci: string,
		fecha_despido: string | null,
		nombre: string,
		apellido_paterno: string,
		apellido_materno: string,
		cargo: string,
		fecha_nacimiento: string,
		fecha_contratacion: string,
		salario_base: string,
		telefono: string,
		direccion: string,
		esta_activo: boolean,
		createdAt: string,
		updatedAt: string
	},
	Role: {
		id: string,
		code_rol: string,
		nombre_rol: string,
		descripcion: string,
		createdAt: string,
		updatedAt: string
	}
}

export interface CurrentUserResponse {
	status: 'success' | 'error';
	data: CurrentUser;
}