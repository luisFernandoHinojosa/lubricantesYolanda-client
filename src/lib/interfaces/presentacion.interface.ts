//import type { Presentacion as ProductoPresentacion } from './producto.interface';

// export interface Presentacion extends ProductoPresentacion {
// 	id_producto?: string;
// 	createdAt?: string;
// 	updatedAt?: string;
// }

export interface CreatePresentacionDto {
	id_producto: string;
	id_unidad_medida?: string | null;
	nombre: string;
	sku?: string | null;
	codigo_barras?: string | null;
	factor_conversion: number;
	precio_especial?: number;
}

export interface UpdatePresentacionDto extends Partial<CreatePresentacionDto> {
	esta_activo?: boolean;
}
