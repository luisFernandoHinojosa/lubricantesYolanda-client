export interface ProductoKardex {
    nombre_comercial: string;
}

export interface LoteKardex {
    producto: ProductoKardex;
}

export interface UbicacionKardex {
    nombre: string;
}

export interface EmpleadoKardex {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
}

export interface UsuarioKardex {
    Empleado: EmpleadoKardex;
}

export interface KardexMovimiento {
    id: string;
    id_lote: string;
    id_ubicacion_origen: string | null;
    id_ubicacion_destino: string | null;
    id_usuario: string;
    cantidad: number;
    tipo_movimiento: string;
    motivo: string;
    createdAt: string;

    lote?: LoteKardex;
    ubicacion_origen?: UbicacionKardex | null;
    ubicacion_destino?: UbicacionKardex | null;
    usuario?: UsuarioKardex;
}

export interface KardexPaginatedData {
    kardexMovimientos: KardexMovimiento[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}

export interface KardexApiResponse {
    status: string;
    data: KardexPaginatedData;
}

export interface KardexFilters {
    page?: number;
    perPage?: number;
    search?: string;
    tipo_movimiento?: string;
}