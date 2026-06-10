import { apiMilenium } from '$lib/config';
import type {
	Empleado,
	EmpleadosResponse,
	EmpleadoFilters,
	CreateEmpleadoDto,
	UpdateEmpleadoDto
} from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class EmpleadosService {
	async getEmpleados(filters: EmpleadoFilters = {}): Promise<EmpleadosResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);

		const response = await apiMilenium.get<EmpleadosResponse>(`/empleados?${params.toString()}`);
		return response.data;
	}

	async getEmpleadoById(id: string): Promise<Empleado> {
		const response = await apiMilenium.get<ApiResponse<Empleado>>(`/empleados/${id}`);
		return response.data;
	}

	async createEmpleado(empleado: CreateEmpleadoDto): Promise<Empleado> {
		const response = await apiMilenium.post<ApiResponse<Empleado>>('/empleados', empleado);
		return response.data;
	}

	async updateEmpleado(id: string, empleado: UpdateEmpleadoDto): Promise<Empleado> {
		const response = await apiMilenium.put<ApiResponse<Empleado>>(`/empleados/${id}`, empleado);
		return response.data;
	}

	async deleteEmpleado(id: string): Promise<void> {
		await apiMilenium.delete(`/empleados/${id}`);
	}
}

export const empleadosService = new EmpleadosService();
