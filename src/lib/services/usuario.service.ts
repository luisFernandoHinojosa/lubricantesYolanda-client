import { apiMilenium } from '$lib/config';
import type {
	Usuario,
	UsuariosResponse,
	UsuarioFilters,
	CreateUsuarioDto,
	UpdateUsuarioDto
} from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class UsuariosService {
	async getUsuarios(filters: UsuarioFilters = {}): Promise<Usuario[]> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);
		if (filters.rol_id) params.append('rol_id', filters.rol_id);
		if (filters.esta_activo !== undefined)
			params.append('esta_activo', filters.esta_activo.toString());

		const response = await apiMilenium.get<UsuariosResponse>(`/usuarios?${params.toString()}`);
		return response.data;
	}

	async getUsuarioById(id: string): Promise<Usuario> {
		const response = await apiMilenium.get<ApiResponse<Usuario>>(`/usuarios/${id}`);
		return response.data;
	}

	async createUsuario(usuario: CreateUsuarioDto): Promise<Usuario> {
		const response = await apiMilenium.post<ApiResponse<Usuario>>('/usuarios', usuario);
		return response.data;
	}

	async updateUsuario(id: string, usuario: UpdateUsuarioDto): Promise<Usuario> {
		const response = await apiMilenium.put<ApiResponse<Usuario>>(`/usuarios/${id}`, usuario);
		return response.data;
	}

	async deleteUsuario(id: string): Promise<void> {
		await apiMilenium.delete(`/usuarios/${id}`);
	}

	async toggleEstado(id: string, esta_activo: boolean): Promise<Usuario> {
		return this.updateUsuario(id, { esta_activo });
	}
}

export const usuariosService = new UsuariosService();
