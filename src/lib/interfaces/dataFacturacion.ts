export interface SincronizarActividadesFactura {
	id: number;
	actived: boolean;
	descripcion: string;
	tipoActividad: string;
	codigoCaeb: string;
}

export interface LeyendaFactura {
	id: number;
	descripcionLeyenda: string;
}

export interface TipoDocumentoIdentidadFactura {
	descripcion: string;
	codigoClasificador: number;
	simbolo: string;
	commandVerified: string | null;
	codigoExcepcion: number;
}

export interface CodigoDocumentoSectorFactura {
	id: number;
	descripcion: string;
	codigoClasificador: number;
	tipoFacturaDocumento: number;
}

export interface MetodoPagoFactura {
	id: number;
	codigo: string;
	codigoClasificador: number;
	descripcion?: string;
}
