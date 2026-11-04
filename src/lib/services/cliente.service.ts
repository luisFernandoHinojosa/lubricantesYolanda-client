import { apiMilenium } from '$lib/config';
import type {
	AjustePuntosDto,
	Cliente,
	ClienteTop,
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
		if (filters.esta_activo) params.append('esta_activo', filters.esta_activo);
		if (filters.sortBy) params.append('sortBy', filters.sortBy);
		if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

		const response = await apiMilenium.get<ClientesResponse>(`/clientes?${params.toString()}`);
		return response.data;
	}

	async getTop50(): Promise<ClienteTop[]> {
		const response = await apiMilenium.get<ApiResponse<ClienteTop[]>>('/clientes/top50');
		return response.data;
	}

	async getClienteById(id: string): Promise<Cliente> {
		const response = await apiMilenium.get<ApiResponse<Cliente>>(`/clientes/${id}`);
		return response.data;
	}

	async getClienteByCi(ci: string): Promise<Cliente | null> {
		try {
			const response = await apiMilenium.get<ApiResponse<Cliente>>(`/clientes/ci/${encodeURIComponent(ci)}`);
			return response.data;
		} catch (error: any) {
			// 404 = CI no registrado; cualquier otro error se propaga
			if (error?.status === 404) return null;
			throw error;
		}
	}

	async createCliente(cliente: CreateClienteDto): Promise<Cliente> {
		const response = await apiMilenium.post<ApiResponse<Cliente>>('/clientes', cliente);
		return response.data;
	}

	async updateCliente(id: string, cliente: UpdateClienteDto): Promise<Cliente> {
		const response = await apiMilenium.put<ApiResponse<Cliente>>(`/clientes/${id}`, cliente);
		return response.data;
	}

	/** Ajusta los puntos (suma o resta); el resultado nunca baja de 0 */
	async ajustarPuntos(id: string, dto: AjustePuntosDto): Promise<Cliente> {
		const response = await apiMilenium.patch<ApiResponse<Cliente>>(`/clientes/${id}/puntos`, dto);
		return response.data;
	}

	/** Soft delete: pone esta_activo en false */
	async deleteCliente(id: string): Promise<void> {
		await apiMilenium.delete(`/clientes/${id}`);
	}

	async toggleEstado(id: string, esta_activo: boolean): Promise<Cliente> {
		return this.updateCliente(id, { esta_activo });
	}
}

export const clientesService = new ClientesService();
export const clienteService = clientesService;

