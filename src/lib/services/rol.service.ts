import { apiMilenium } from '$lib/config';
import type { Rol, RolesResponse, RolFilters, CreateRolDto, UpdateRolDto } from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class RolesService {
	async getRoles(filters: RolFilters = {}): Promise<RolesResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);

		const response = await apiMilenium.get<RolesResponse>(`/roles?${params.toString()}`);
		return response.data;
	}

	async getRolById(id: string): Promise<Rol> {
		const response = await apiMilenium.get<ApiResponse<Rol>>(`/roles/${id}`);
		return response.data;
	}

	async createRol(rol: CreateRolDto): Promise<Rol> {
		const response = await apiMilenium.post<ApiResponse<Rol>>('/roles', rol);
		return response.data;
	}

	async updateRol(id: string, rol: UpdateRolDto): Promise<Rol> {
		const response = await apiMilenium.put<ApiResponse<Rol>>(`/roles/${id}`, rol);
		return response.data;
	}

	async deleteRol(id: string): Promise<void> {
		await apiMilenium.delete(`/roles/${id}`);
	}
}

export const rolesService = new RolesService();
