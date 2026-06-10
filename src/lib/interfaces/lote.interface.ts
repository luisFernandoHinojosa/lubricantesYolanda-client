export interface Lote {
    id: string;
    codigo_lote: string;
    fecha_vencimiento: string;
    fecha_ingreso: string;
    costo_compra_unitario: number;
    precio_venta_sugerido: number;
    id_producto: string;
    id_proveedor: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoteResponse {
    status: string;
    data: {
        lotes: Lote[];
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    };
    extraData: Record<string, unknown>;
}

export interface LoteFilters {
    page?: number;
    perPage?: number;
    search?: string;
    id_producto?: string;
    id_ubicacion?: string;
    id_sucursal?: string;
    id_empleado?: string;
}

export interface CreateLoteDto {
    codigo_lote: string;
    fecha_vencimiento: string;
    cantidad: number;
    precio_compra: number;
    precio_venta: number;
    id_producto: string;
    id_ubicacion: string;
    id_sucursal: string;
    id_empleado: string;
}

export interface UpdateLoteDto extends Partial<CreateLoteDto> {
    esta_activo?: boolean;
}       