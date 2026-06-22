<script lang="ts">
	import { page } from '$app/stores';
	import SidebarItem from '$lib/components/ui/sidebarItem.svelte';
	import { CharBarIcon, ChevronLeftIcon, UsersIcon } from '$lib/icons/outline';
	import SettingsIcon from '$lib/icons/outline/settingsIcon.svelte';
	import { HomeIcon, ShieldIcon } from '$lib/icons/solid';
	import type { MenuItem } from '$lib/interfaces';
	import { currentUserStore } from '$lib/stores';
	import { canAccess } from '$lib/utils/rbac.utils';

	let { isOpen, isCollapsed } = $props();

	const role = $derived($currentUserStore?.Role?.code_rol);

	const menuItems: MenuItem[] = [
		{
			id: 'inicio',
			label: 'Inicio',
			icon: HomeIcon,
			href: '/v1/inicio'
		},
		{
			id: 'punto-venta',
			label: 'Punto de Venta',
			icon: HomeIcon,
			hasSubmenu: true,
			submenu: [
				{
					id: 'pv-nueva-venta',
					label: 'Nueva venta / pedido',
					href: '/v1/finanzas/venta-productos-pedidos'
				},
				// { id: 'pv-proforma', label: 'Proforma', href: '/v1/productos/proforma' },
				{ id: 'pv-historial', label: 'Historial de ventas', href: '/v1/finanzas/historial-ventas' },
				{
					id: 'pv-devoluciones',
					label: 'Devoluciones y cambios',
					href: '/v1/finanzas/devoluciones'
				}
				// {
				// 	id: 'pv-caja',
				// 	label: 'Apertura y cierre de caja',
				// 	href: '/v1/usuarios/caja-apertura-cierre'
				// }
			]
		},
		{
			id: 'finanzas',
			label: 'Finanzas',
			icon: CharBarIcon,
			hasSubmenu: true,
			submenu: [
				{ id: 'fin-ingresos', label: 'Ingresos', href: '/v1/finanzas/ingresos' },
				{ id: 'fin-egresos', label: 'Egresos', href: '/v1/finanzas/egresos' },
				// { id: 'fin-cobrar', label: 'Cuentas por cobrar', href: '/v1/finanzas/cuentas-cobrar' },
				// { id: 'fin-anticipos', label: 'Anticipos', href: '/v1/finanzas/anticipos' },
				{
					id: 'fin-movimientos',
					label: 'Historial de movimientos',
					href: '/v1/finanzas/historial-movimientos'
				}
			]
		},
		{
			id: 'inventario',
			label: 'Inventario',
			icon: SettingsIcon,
			hasSubmenu: true,
			submenu: [
				// {
				// 	id: 'inv-stock',
				// 	label: 'Stock de productos',
				// 	href: '/v1/administracion/stock-productos'
				// },
				{ id: 'inv-registrar', label: 'Registrar producto', href: '/v1/productos/productos' },
				{ id: 'inv-kardex', label: 'Kardex Movimientos', href: '/v1/inventario/kardex' },
				{ id: 'inv-compras', label: 'Compras', href: '/v1/productos/compras' },
				{ id: 'inv-proveedores', label: 'Proveedores', href: '/v1/usuarios/proveedores' },
				{
					id: 'inv-traspaso',
					label: 'Traspaso inter-ubicaciones',
					href: '/v1/inventario/traslados'
				},
				{ id: 'inv-categorias', label: 'Categorías', href: '/v1/productos/categorias' },
				{ id: 'inv-marcas', label: 'Marcas', href: '/v1/productos/marcas' },
				{ id: 'inv-unidad', label: 'Unidad de medida', href: '/v1/productos/unidad-medida' }
			]
		},
		{
			id: 'clientes',
			label: 'Clientes',
			icon: UsersIcon,
			href: '/v1/usuarios/clientes'
		},
		{
			id: 'equipo',
			label: 'Equipo',
			icon: UsersIcon,
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
		},
		{
			id: 'reportes',
			label: 'Reportes',
			icon: CharBarIcon,
			hasSubmenu: true,
			submenu: [
				{ id: 'rep-general', label: 'Reportes generales', href: '/v1/administracion/reportes' }
				// { id: 'rep-gastos', label: 'Reporte de gastos', href: '/v1/administracion/reporte-gastos' },
				// { id: 'rep-vitacora', label: 'Vitácora de actividad', href: '/v1/administracion/vitacora' }
			]
		},
		{
			id: 'empresa',
			label: 'Empresa',
			icon: ShieldIcon,
			hasSubmenu: true,
			submenu: [
				// { id: 'emp-sucursales', label: 'Gestión de sucursales', href: '/v1/sucursales' },
				{
					id: 'emp-ubicaciones',
					label: 'Gestión de Ubicaciones',
					href: '/v1/administracion/gestion-ubicaciones'
				}
				// { id: 'emp-zonas', label: 'Zonas', href: '/v1/zonas' }
			]
		}
	];

	const filteredMenuItems = $derived(
		menuItems
			.map((item) => {
				// If the item has a submenu, filter the submenu items first
				if (item.hasSubmenu && item.submenu) {
					const filteredSubmenu = item.submenu.filter((sub) => canAccess(role, sub.href));
					// If the filtered submenu has items, return the item with the filtered submenu
					if (filteredSubmenu.length > 0) {
						return { ...item, submenu: filteredSubmenu };
					}
					// If the submenu is empty after filtering, don't show the parent item
					// UNLESS the parent item itself has an href that is accessible (not common for menus with submenus)
					return null;
				}
				// If it doesn't have a submenu, just check if the href is accessible
				return item.href && canAccess(role, item.href) ? item : null;
			})
			.filter((item): item is MenuItem => item !== null)
	);

	const sectionLabels: Record<string, string> = {
		inicio: 'Principal',
		'punto-venta': 'Operación',
		clientes: 'Personas',
		reportes: 'Gestión'
	};

	const closeSidebar = () => {
		if (window.innerWidth < 768) isOpen = false;
	};

	const toggleSidebarCollapse = () => {
		isCollapsed = !isCollapsed;
	};

	const isPathActive = (path: string) => $page.url.pathname === path;
	const hasActiveChild = (item: MenuItem) =>
		item.submenu?.some((sub) => isPathActive(sub.href)) ?? false;
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-40 bg-black opacity-20 md:hidden"
		onclick={closeSidebar}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && closeSidebar()}
	></div>
{/if}

<div class="relative">
	<aside
		class="z-50 border-r border-light-one bg-light-two text-light-one transition-all duration-300 ease-in-out
		       {isOpen ? 'translate-x-0' : '-translate-x-full'}
		       fixed flex h-full flex-col md:relative md:translate-x-0
		       {isCollapsed ? 'md:w-16' : 'w-64'}"
	>
		<button
			class="top-4 -right-4 z-50 -ml-5 hidden rounded-full bg-light-three p-2 text-light-one
			       shadow-lg transition-all duration-300 hover:bg-light-three_d md:absolute md:block"
			onclick={toggleSidebarCollapse}
			aria-label="Toggle sidebar"
		>
			<ChevronLeftIcon
				class="h-4 w-4 transition-transform duration-300 {isCollapsed ? 'rotate-180' : ''}"
			/>
		</button>

		<div class="relative flex flex-col items-center justify-center overflow-x-hidden p-4">
			{#if !isCollapsed}
				<div
					class="animate-header flex h-20 w-full flex-col items-center justify-center
				            overflow-hidden rounded-lg bg-light-one"
				>
					<div class="flex items-center p-1">
						<div class="my-auto flex items-center justify-center rounded">
							<img src="/images/logo2.webp" class="h-20 w-60" alt="Lubricantes Yolanda" />
						</div>
					</div>
				</div>

				<div
					class="flex w-full flex-col items-center justify-center border-b border-light-accent pb-4"
				>
					<div class="mt-2 flex items-center gap-2">
						<span class="pulse-dot"></span>
						<p class="text-xs text-light-accent">Sucursal Principal</p>
					</div>
					<p class="mt-1 text-sm font-semibold text-light-one">Lubricantes Yolanda</p>
				</div>
			{:else}
				<div class="flex justify-center">
					<div class="flex h-8 w-8 items-center justify-center rounded bg-light-one">
						<HomeIcon class="h-5 w-5 text-light-accent" />
					</div>
				</div>
			{/if}
		</div>

		<nav class="nav-scroll flex-1 overflow-x-hidden overflow-y-auto px-4">
			{#each filteredMenuItems as item, index (item.id)}
				{#if !isCollapsed && sectionLabels[item.id]}
					<p class="section-label">{sectionLabels[item.id]}</p>
				{/if}

				<div class="sb-item" style="animation-delay: {index * 35}ms">
					<SidebarItem
						{item}
						{isCollapsed}
						onItemClick={closeSidebar}
						isActive={isPathActive(item.href || '')}
						hasActiveChild={hasActiveChild(item)}
					/>
				</div>
			{/each}
		</nav>
	</aside>
</div>

<style>
	.sb-item {
		animation: slideIn 0.28s ease both;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-8px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.animate-header {
		animation: fadeDown 0.25s ease both;
	}

	@keyframes fadeDown {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.pulse-dot {
		width: 7px;
		height: 7px;
		min-width: 7px;
		border-radius: 50%;
		background: #22c55e;
		animation: sonar 2.5s ease-in-out infinite;
	}

	@keyframes sonar {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
		}
		60% {
			box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
		}
	}

	.section-label {
		font-size: 0.6rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		padding: 14px 2px 4px;
		white-space: nowrap;
		overflow: hidden;
		opacity: 0.4;
	}

	.nav-scroll {
		scrollbar-width: thin;
		scrollbar-color: transparent transparent;
		transition: scrollbar-color 0.3s;
	}

	.nav-scroll:hover {
		scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
	}

	.nav-scroll::-webkit-scrollbar {
		width: 3px;
	}
	.nav-scroll::-webkit-scrollbar-thumb {
		background: transparent;
		border-radius: 2px;
		transition: background 0.3s;
	}

	.nav-scroll:hover::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.12);
	}
</style>
