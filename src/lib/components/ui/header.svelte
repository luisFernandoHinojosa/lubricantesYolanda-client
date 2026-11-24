<script lang="ts">
	import { page } from '$app/state';
	import { getRouteTrail } from '$lib/config/menu.config';
	import {
		ChevronDownIcon,
		ChevronRightIcon,
		LogOutIcon,
		Menu2Icon,
		UserIcon
	} from '$lib/icons/outline';
	import type { DropdownOption } from '$lib/interfaces';
	import { authStore, currentUserStore } from '$lib/stores';
	import { redirect } from '$lib/utils';
	import DropdownMenu from './dropdownMenu.svelte';

	interface Props {
		onToggleSidebar: () => void;
		sidebarOpen?: boolean;
	}
	let { onToggleSidebar, sidebarOpen = false }: Props = $props();

	let isDropdownOpen = $state(false);
	let trigger = $state<HTMLElement>();

	const trail = $derived(getRouteTrail(page.url.pathname));

	const user = $derived($currentUserStore);
	const nombre = $derived(
		user?.Empleado?.nombre
			? `${user.Empleado.nombre} ${user.Empleado.apellido_paterno ?? ''}`.trim()
			: (user?.name_user ?? '')
	);
	const iniciales = $derived(
		nombre
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((p) => p[0]?.toUpperCase())
			.join('') || '?'
	);

	const options: DropdownOption[] = [
		{ id: 'profile', label: 'Mi perfil', icon: UserIcon, action: () => redirect('/v1/profile') },
		{
			id: 'logout',
			label: 'Cerrar sesión',
			icon: LogOutIcon,
			action: () => authStore.logout(),
			divider: true
		}
	];
</script>

<header class="sticky top-0 z-30 border-b border-acero-200 bg-white">
	<div class="flex h-14 items-center gap-3 px-3 md:px-6">
		<button
			type="button"
			class="-ml-1 rounded-md p-2 text-acero-700 hover:bg-acero-100 md:hidden"
			onclick={onToggleSidebar}
			aria-label="Abrir menú"
			aria-controls="menu-principal"
			aria-expanded={sidebarOpen}
		>
			<Menu2Icon class="size-6" />
		</button>

		<!-- Dónde estoy -->
		<nav aria-label="Ubicación" class="min-w-0 flex-1">
			{#if trail}
				<ol class="flex min-w-0 items-center gap-1.5 text-sm">
					<li class="hidden shrink-0 text-acero-500 sm:block">{trail.section}</li>
					<li class="hidden shrink-0 text-acero-300 sm:block" aria-hidden="true">
						<ChevronRightIcon class="size-4" />
					</li>
					{#if trail.isDetail}
						<li class="min-w-0 truncate">
							<a href={trail.parentHref} class="text-acero-500 hover:text-acero-950 hover:underline"
								>{trail.label}</a
							>
						</li>
						<li class="shrink-0 text-acero-300" aria-hidden="true">
							<ChevronRightIcon class="size-4" />
						</li>
						<li class="truncate font-semibold text-acero-950" aria-current="page">Detalle</li>
					{:else}
						<li class="truncate font-semibold text-acero-950" aria-current="page">{trail.label}</li>
					{/if}
				</ol>
			{/if}
		</nav>

		<!-- Usuario -->
		<div class="relative shrink-0">
			<button
				bind:this={trigger}
				type="button"
				class="flex items-center gap-2.5 rounded-lg py-1 pr-2 pl-1 text-left transition-colors hover:bg-acero-100"
				onclick={() => (isDropdownOpen = !isDropdownOpen)}
				aria-haspopup="menu"
				aria-expanded={isDropdownOpen}
				aria-label="Menú de usuario: {nombre}"
			>
				<span
					class="flex size-8 items-center justify-center rounded-full bg-acero-900 font-display text-sm font-semibold text-white"
					aria-hidden="true">{iniciales}</span
				>
				<span class="hidden leading-tight sm:block">
					<span class="block max-w-44 truncate text-sm font-semibold text-acero-950">{nombre}</span>
					{#if user?.Role?.nombre_rol}
						<span class="block max-w-44 truncate text-xs text-acero-500"
							>{user.Role.nombre_rol}</span
						>
					{/if}
				</span>
				<ChevronDownIcon class="hidden size-4 text-acero-400 sm:block" />
			</button>
			<DropdownMenu {options} width={200} bind:isOpen={isDropdownOpen} triggerElement={trigger} />
		</div>
	</div>
</header>
