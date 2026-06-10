import { apiMilenium } from '$lib/config';
import type {
    Compra,
    ComprasResponse,
    CompraFilters,
    CreateCompraDto,
    UpdateCompraDto
} from '$lib/interfaces/compra.interface';

interface ApiResponse<T> {
    status: string;
    data: T;
}

class ComprasService {
    async getCompras(filters: CompraFilters = {}): Promise<ComprasResponse['data']> {
        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page.toString());
        if (filters.perPage) params.append('perPage', filters.perPage.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.proveedor_id) params.append('proveedor_id', filters.proveedor_id);
        if (filters.estado_pago) params.append('estado_pago', filters.estado_pago);
        if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
        if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

        const response = await apiMilenium.get<ComprasResponse>(`/compras?${params.toString()}`);
        return response.data;
    }

    async getCompraById(id: string): Promise<Compra> {
        const response = await apiMilenium.get<ApiResponse<Compra>>(`/compras/${id}`);
        return response.data;
    }

    async createCompra(compra: CreateCompraDto): Promise<Compra> {
        const response = await apiMilenium.post<ApiResponse<Compra>>('/compras', compra);
        return response.data;
    }

    async updateCompra(id: string, compra: UpdateCompraDto): Promise<Compra> {
        const response = await apiMilenium.put<ApiResponse<Compra>>(`/compras/${id}`, compra);
        return response.data;
    }

    async deleteCompra(id: string): Promise<void> {
        await apiMilenium.delete(`/compras/${id}`);
    }
}

export const comprasService = new ComprasService();