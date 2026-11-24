<script lang="ts">
	import { page } from '$app/state';
	import SidebarItem from '$lib/components/ui/sidebarItem.svelte';
	import { MENU_GROUPS, type MenuGroup } from '$lib/config/menu.config';
	import { ChevronLeftIcon, XIcon } from '$lib/icons/outline';
	import type { MenuItem } from '$lib/interfaces';
	import { currentUserStore } from '$lib/stores';
	import { canAccess } from '$lib/utils/rbac.utils';

	interface Props {
		isOpen: boolean;
		isCollapsed?: boolean;
	}

	let { isOpen = $bindable(false), isCollapsed = $bindable(false) }: Props = $props();

	const COLLAPSE_KEY = 'lby::ui::sidebar-collapsed';

	// Estado real de la conexión: si se cae internet, las ventas no se pueden registrar
	let enLinea = $state(true);
	$effect(() => {
		enLinea = navigator.onLine;
		const on = () => (enLinea = true);
		const off = () => (enLinea = false);
		window.addEventListener('online', on);
		window.addEventListener('offline', off);
		return () => {
			window.removeEventListener('online', on);
			window.removeEventListener('offline', off);
		};
	});

	// Recordar si el usuario prefiere el menú compacto
	$effect.pre(() => {
		try {
			isCollapsed = localStorage.getItem(COLLAPSE_KEY) === '1';
		} catch {
			/* sin almacenamiento: usar valor por defecto */
		}
	});

	const role = $derived($currentUserStore?.Role?.code_rol);

	const filterItem = (item: MenuItem): MenuItem | null => {
		if (item.hasSubmenu && item.submenu) {
			const submenu = item.submenu.filter((sub) => canAccess(role, sub.href));
			return submenu.length > 0 ? { ...item, submenu } : null;
		}
		return item.href && canAccess(role, item.href) ? item : null;
	};

	const groups = $derived(
		MENU_GROUPS.map((g) => ({
			...g,
			items: g.items.map(filterItem).filter((i): i is MenuItem => i !== null)
		})).filter((g): g is MenuGroup => g.items.length > 0)
	);

	const pathname = $derived(page.url.pathname);
	const isPathActive = (href?: string) =>
		!!href && (pathname === href || pathname.startsWith(href + '/'));
	const hasActiveChild = (item: MenuItem) =>
		item.submenu?.some((s) => isPathActive(s.href)) ?? false;

	const closeOnMobile = () => {
		if (window.innerWidth < 768) isOpen = false;
	};

	const toggleCollapse = () => {
		isCollapsed = !isCollapsed;
		try {
			localStorage.setItem(COLLAPSE_KEY, isCollapsed ? '1' : '0');
		} catch {
			/* ignorar */
		}
	};

	// Cerrar con Escape el menú móvil
	$effect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (isOpen = false);
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

{#if isOpen}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-acero-950/50 backdrop-blur-[1px] md:hidden"
		onclick={() => (isOpen = false)}
		aria-label="Cerrar menú"
		tabindex="-1"
	></button>
{/if}

<aside
	id="menu-principal"
	aria-label="Menú principal"
	class="fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-acero-900 text-acero-200 transition-[transform,width] duration-200 ease-out md:relative md:translate-x-0
		{isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
		{isCollapsed ? 'md:w-[72px]' : 'md:w-64'}"
>
	<!-- Marca -->
	<div
		class="flex shrink-0 items-center gap-2 px-3 pt-3 pb-1 {isCollapsed ? 'md:justify-center' : ''}"
	>
		<a
			href="/v1/inicio"
			class="block h-[60px] min-w-0 flex-1 overflow-hidden rounded-lg bg-white {isCollapsed
				? 'md:h-12 md:w-12 md:flex-none'
				: ''}"
			aria-label="Lubricantes Yolanda, ir al inicio"
		>
			{#if isCollapsed}
				<img
					src="/images/logo1.webp"
					alt=""
					class="hidden h-full w-full scale-110 object-contain md:block"
				/>
			{/if}
			<img
				src="/images/logo2.webp"
				alt=""
				class="h-full w-full scale-[1.04] object-cover {isCollapsed ? 'md:hidden' : ''}"
			/>
		</a>
		<button
			type="button"
			class="rounded-md p-2 text-acero-300 hover:bg-acero-800 hover:text-white md:hidden"
			onclick={() => (isOpen = false)}
			aria-label="Cerrar menú"
		>
			<XIcon class="size-5" />
		</button>
	</div>

	<nav class="nav-scroll flex-1 overflow-x-hidden overflow-y-auto px-3 pb-4">
		{#each groups as group (group.label)}
			<div class="mt-4 first:mt-2">
				{#if !isCollapsed}
					<p class="px-3 pb-1.5 text-xs font-medium text-acero-400">{group.label}</p>
				{:else}
					<div class="mx-auto mb-2 hidden h-px w-6 bg-acero-700 md:block" aria-hidden="true"></div>
					<p class="px-3 pb-1.5 text-xs font-medium text-acero-400 md:hidden">{group.label}</p>
				{/if}
				<ul class="space-y-0.5">
					{#each group.items as item (item.id)}
						<li>
							<SidebarItem
								{item}
								{isCollapsed}
								onItemClick={closeOnMobile}
								isActive={isPathActive(item.href)}
								hasActiveChild={hasActiveChild(item)}
								{isPathActive}
							/>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>

	<!-- Pie: sucursal y control de ancho -->
	<div class="shrink-0 border-t border-acero-800 px-3 py-3">
		<div class="flex items-center gap-2 {isCollapsed ? 'md:justify-center' : ''}">
			<span
				class="size-2 shrink-0 rounded-full {enLinea ? 'bg-emerald-400' : 'bg-aceite'}"
				title={enLinea ? 'En línea' : 'Sin conexión'}
				aria-hidden="true"
			></span>
			<div class="min-w-0 flex-1 {isCollapsed ? 'md:hidden' : ''}" role="status">
				<p class="truncate text-sm font-medium text-white">Sucursal principal</p>
				<p class="truncate text-xs {enLinea ? 'text-acero-400' : 'font-semibold text-aceite'}">
					{enLinea ? 'En línea' : 'Sin conexión a internet'}
				</p>
			</div>
			<button
				type="button"
				class="hidden rounded-md p-1.5 text-acero-400 transition-colors hover:bg-acero-800 hover:text-white md:block {isCollapsed
					? 'md:hidden'
					: ''}"
				onclick={toggleCollapse}
				aria-label="Contraer menú"
				title="Contraer menú"
			>
				<ChevronLeftIcon class="size-4" />
			</button>
		</div>
		{#if isCollapsed}
			<button
				type="button"
				class="mx-auto mt-2 hidden rounded-md p-1.5 text-acero-400 transition-colors hover:bg-acero-800 hover:text-white md:block"
				onclick={toggleCollapse}
				aria-label="Expandir menú"
				title="Expandir menú"
			>
				<ChevronLeftIcon class="size-4 rotate-180" />
			</button>
		{/if}
	</div>
</aside>

<style>
	.nav-scroll {
		scrollbar-width: thin;
		scrollbar-color: transparent transparent;
	}
	.nav-scroll:hover {
		scrollbar-color: var(--color-acero-700) transparent;
	}
	.nav-scroll::-webkit-scrollbar {
		width: 6px;
	}
	.nav-scroll::-webkit-scrollbar-thumb {
		background: transparent;
		border: 0;
	}
	.nav-scroll:hover::-webkit-scrollbar-thumb {
		background: var(--color-acero-700);
	}
</style>
