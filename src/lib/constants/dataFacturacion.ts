import type {
	CodigoDocumentoSectorFactura,
	LeyendaFactura,
	MetodoPagoFactura,
	SincronizarActividadesFactura,
	TipoDocumentoIdentidadFactura
} from '$lib/interfaces/dataFacturacion';

export const SINCRONIZAR_ACTIVIDADES_FACTURA: SincronizarActividadesFactura[] = [
	{
		id: 4520100,
		actived: true,
		descripcion:
			'REPARACIONES MECANICAS, ELECTRICAS, SISTEMAS DE INYECCION ELECTRICOS Y SERVICIO ORDINARIO',
		tipoActividad: 'S',
		codigoCaeb: '4520100'
	},
	{
		id: 4530000,
		actived: true,
		descripcion: 'VENTA DE PARTES, PIEZAS Y ACCESORIOS PARA VEHICULOS AUTOMOTORES',
		tipoActividad: 'S',
		codigoCaeb: '4530000'
	},
	{
		id: 4730200,
		actived: true,
		descripcion: 'VENTA AL POR MENOR DE LUBRICANTES Y REFRIGERANTES PARA VEHICULOS AUTOMOTORES',
		tipoActividad: 'P',
		codigoCaeb: '4730200'
	}
];

export const LEYENDAS_FACTURA: LeyendaFactura[] = [
	{
		id: 1,
		descripcionLeyenda:
			'Ley N° 453: Puedes acceder a la reclamación cuando tus derechos han sido vulnerados. '
	},
	{
		id: 2,
		descripcionLeyenda:
			'Ley N° 453: El proveedor debe brindar atención sin discriminación, con respeto, calidez y cordialidad a los usuarios y consumidores.'
	}
];

export const TIPO_DOCUMENTO_IDENTIDAD_FACTURA: TipoDocumentoIdentidadFactura[] = [
	{
		descripcion: 'CI -- CEDULA DE IDENTIDAD',
		codigoClasificador: 1,
		simbolo: '',
		commandVerified: null,
		codigoExcepcion: 1
	},
	{
		descripcion: 'CEX - CEDULA DE IDENTIDAD DE EXTRANJERO',
		codigoClasificador: 2,
		simbolo: '',
		commandVerified: null,
		codigoExcepcion: 1
	},
	{
		descripcion: 'PAS - PASAPORTE',
		codigoClasificador: 3,
		simbolo: '',
		commandVerified: null,
		codigoExcepcion: 1
	},
	{
		descripcion: 'OD - OTRO DOCUMENTO DE IDENTIDAD',
		codigoClasificador: 4,
		simbolo: '',
		commandVerified: null,
		codigoExcepcion: 1
	},
	{
		descripcion: 'NIT - NÚMERO DE IDENTIFICACIÓN TRIBUTARIA',
		codigoClasificador: 5,
		simbolo: '',
		commandVerified: 'verificarNit',
		codigoExcepcion: 1
	}
];

export const CODIGO_DOCUMENTO_SECTOR_FACTURA: CodigoDocumentoSectorFactura = {
	id: 1,
	descripcion: 'FACTURA COMPRA-VENTA',
	codigoClasificador: 1,
	tipoFacturaDocumento: 1
};

export const METODO_PAGO_FACTURA: MetodoPagoFactura[] = [
	{
		id: 1,
		descripcion: 'EFECTIVO',
		codigoClasificador: 1,
		codigo: 'EFECTIVO'
	},
	{
		id: 7,
		descripcion: 'TRANSFERENCIA BANCARIA (QR)',
		codigoClasificador: 7,
		codigo: 'QR'
	},
	{
		id: 2,
		descripcion: 'TARJETA',
		codigoClasificador: 2,
		codigo: 'TARJETA'
	},
	{
		id: 3,
		descripcion: 'CHEQUE',
		codigoClasificador: 3,
		codigo: 'CHEQUE'
	},
	{
		id: 4,
		descripcion: 'VALES',
		codigoClasificador: 4,
		codigo: 'VALES'
	},
	{
		id: 5,
		descripcion: 'OTROS',
		codigoClasificador: 5,
		codigo: 'OTROS'
	},
	{
		id: 8,
		descripcion: 'DEPOSITO EN CUENTA',
		codigoClasificador: 8,
		codigo: 'DEPOSITO'
	}
];
