export type PermissionStrategy = 'allow-all' | 'deny-all';

export interface RoleConfig {
	strategy: PermissionStrategy;
	allowedPaths?: string[];
	deniedPaths?: string[];
	defaultRedirect: string;
}

export const ROLE_PERMISSIONS: Record<string, RoleConfig> = {
	SADM: {
		strategy: 'allow-all',
		defaultRedirect: '/v1/inicio'
	},
	ADM: {
		strategy: 'allow-all',
		deniedPaths: ['/v1/administracion/reportes'],
		defaultRedirect: '/v1/inicio'
	},
	CAJ: {
		strategy: 'deny-all',
		allowedPaths: ['/v1/finanzas/venta-productos-pedidos'],
		defaultRedirect: '/v1/finanzas/venta-productos-pedidos'
	}
};
