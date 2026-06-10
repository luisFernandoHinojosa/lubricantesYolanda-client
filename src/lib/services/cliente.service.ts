import { apiMilenium } from '$lib/config';
import type {
	Cliente,
	ClientesResponse,
	ClienteFilters,
	CreateClienteDto,
	UpdateClienteDto
} from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class ClientesService {
	async getClientes(filters: ClienteFilters = {}): Promise<ClientesResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);
		if (filters.tipo_cliente) params.append('tipo_cliente', filters.tipo_cliente);

		const response = await apiMilenium.get<ClientesResponse>(`/clientes?${params.toString()}`);
		return response.data;
	}

	async getClienteById(id: string): Promise<Cliente> {
		const response = await apiMilenium.get<ApiResponse<Cliente>>(`/clientes/${id}`);
		return response.data;
	}

	async createCliente(cliente: CreateClienteDto): Promise<Cliente> {
		const response = await apiMilenium.post<ApiResponse<Cliente>>('/clientes', cliente);
		return response.data;
	}

	async updateCliente(id: string, cliente: UpdateClienteDto): Promise<Cliente> {
		const response = await apiMilenium.put<ApiResponse<Cliente>>(`/clientes/${id}`, cliente);
		return response.data;
	}

	async deleteCliente(id: string): Promise<void> {
		await apiMilenium.delete(`/clientes/${id}`);
	}

	async toggleEstado(id: string, esta_activo: boolean): Promise<Cliente> {
		return this.updateCliente(id, { esta_activo });
	}
}

export const clientesService = new ClientesService();
