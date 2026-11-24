import {
	BuildindStoreIcon,
	CharBarIcon,
	IdBadgeIcon,
	LayoutDashboardIcon,
	PackageIcon,
	ShoppingCartIcon,
	UsersIcon,
	WalletIcon
} from '$lib/icons/outline';
import type { MenuItem } from '$lib/interfaces';

export interface MenuGroup {
	label: string;
	items: MenuItem[];
}

/**
 * Menú principal de la app. Lo usan el sidebar (navegación) y el header (ruta actual).
 * Las rutas que no aparecen aquí no se muestran en la navegación.
 */
export const MENU_GROUPS: MenuGroup[] = [
	{
		label: 'Principal',
		items: [{ id: 'inicio', label: 'Inicio', icon: LayoutDashboardIcon, href: '/v1/inicio' }]
	},
	{
		label: 'Operación',
		items: [
			{
				id: 'punto-venta',
				label: 'Punto de venta',
				icon: ShoppingCartIcon,
				hasSubmenu: true,
				submenu: [
					{
						id: 'pv-nueva-venta',
						label: 'Nueva venta',
						href: '/v1/finanzas/venta-productos-pedidos'
					},
					{
						id: 'pv-historial',
						label: 'Historial de ventas',
						href: '/v1/finanzas/historial-ventas'
					},
					{
						id: 'pv-devoluciones',
						label: 'Devoluciones y cambios',
						href: '/v1/finanzas/devoluciones'
					}
				]
			},
			{
				id: 'inventario',
				label: 'Inventario',
				icon: PackageIcon,
				hasSubmenu: true,
				submenu: [
					{ id: 'inv-registrar', label: 'Productos', href: '/v1/productos/productos' },
					{ id: 'inv-kardex', label: 'Kardex', href: '/v1/inventario/kardex' },
					{ id: 'inv-compras', label: 'Compras', href: '/v1/productos/compras' },
					{ id: 'inv-proveedores', label: 'Proveedores', href: '/v1/usuarios/proveedores' },
					{ id: 'inv-traspaso', label: 'Traslados', href: '/v1/inventario/traslados' },
					{ id: 'inv-categorias', label: 'Categorías', href: '/v1/productos/categorias' },
					{ id: 'inv-marcas', label: 'Marcas', href: '/v1/productos/marcas' },
					{ id: 'inv-unidad', label: 'Unidades de medida', href: '/v1/productos/unidad-medida' }
				]
			},
			{
				id: 'finanzas',
				label: 'Finanzas',
				icon: WalletIcon,
				hasSubmenu: true,
				submenu: [
					{ id: 'fin-ingresos', label: 'Ingresos', href: '/v1/finanzas/ingresos' },
					{ id: 'fin-egresos', label: 'Egresos', href: '/v1/finanzas/egresos' },
					{
						id: 'fin-movimientos',
						label: 'Historial de movimientos',
						href: '/v1/finanzas/historial-movimientos'
					}
				]
			}
		]
	},
	{
		label: 'Personas',
		items: [
			{ id: 'clientes', label: 'Clientes', icon: UsersIcon, href: '/v1/usuarios/clientes' },
			{
				id: 'equipo',
				label: 'Equipo',
				icon: IdBadgeIcon,
				hasSubmenu: true,
				submenu: [
					{ id: 'eq-empleados', label: 'Empleados', href: '/v1/usuarios/empleados' },
					{
						id: 'eq-admin',
						label: 'Personal administrativo',
						href: '/v1/usuarios/personal-administrativo'
					},
					{ id: 'eq-roles', label: 'Roles y permisos', href: '/v1/usuarios/roles-permisos' }
				]
			}
		]
	},
	{
		label: 'Gestión',
		items: [
			{
				id: 'reportes',
				label: 'Reportes',
				icon: CharBarIcon,
				href: '/v1/administracion/reportes'
			},
			{
				id: 'empresa',
				label: 'Ubicaciones',
				icon: BuildindStoreIcon,
				href: '/v1/administracion/gestion-ubicaciones'
			}
		]
	}
];

/** Rutas fuera del menú que igual merecen un nombre en el header */
const EXTRA_ROUTES: { href: string; section: string; label: string }[] = [
	{ href: '/v1/profile', section: 'Cuenta', label: 'Mi perfil' }
];

export interface RouteTrail {
	section: string;
	label: string;
	/** true cuando la ruta es un detalle (p. ej. /productos/123) dentro de una pantalla del menú */
	isDetail: boolean;
	parentHref?: string;
}

/** Encuentra la sección y el nombre de la pantalla para una ruta (coincidencia más larga). */
export function getRouteTrail(pathname: string): RouteTrail | null {
	const candidates: { href: string; section: string; label: string }[] = [...EXTRA_ROUTES];

	for (const group of MENU_GROUPS) {
		for (const item of group.items) {
			if (item.href) candidates.push({ href: item.href, section: group.label, label: item.label });
			for (const sub of item.submenu ?? []) {
				candidates.push({ href: sub.href, section: item.label, label: sub.label });
			}
		}
	}

	const match = candidates
		.filter((c) => pathname === c.href || pathname.startsWith(c.href + '/'))
		.sort((a, b) => b.href.length - a.href.length)[0];

	if (!match) return null;
	return {
		section: match.section,
		label: match.label,
		isDetail: pathname !== match.href,
		parentHref: match.href
	};
}
