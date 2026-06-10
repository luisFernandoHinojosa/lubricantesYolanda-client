<script lang="ts">
	import { BellIcon, SettingsIcon, TrashIcon, UserIcon } from '$lib/icons/outline';
	import type { DropdownOption } from '$lib/interfaces';
	import { authStore, currentUserStore } from '$lib/stores';
	import { redirect } from '$lib/utils';
	import DropdownMenu from './dropdownMenu.svelte';

	interface Props {
		onToggleSidebar: () => void;
	}
	let { onToggleSidebar }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(150);
	let trigger = $state<HTMLElement>();

	const options: DropdownOption[] = [
		{
			id: 'profile',
			label: 'Perfil',
			icon: UserIcon,
			action: () => profile(),
			divider: true,
			disabled: false
		},
		{
			id: 'delete',
			label: 'Cerrar Sesión',
			icon: TrashIcon,
			action: () => logout(),
			divider: true,
			disabled: false
		}
	];

	const logout = () => {
		authStore.logout();
	};

	const profile = () => {
		redirect('/v1/profile');
	};
</script>

<header class="bg-light-two text-light-one shadow-lg">
	<div class="flex items-center justify-between px-4 py-3">
		<button
			class="rounded-md p-2 transition-colors md:hidden"
			onclick={onToggleSidebar}
			aria-label="Toggle sidebar"
		>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>

		<div class="flex-1 md:flex-none">
			<h1 class="text-lg font-semibold">
				¡Hola <span class="text-primary font-extrabold">
					{$currentUserStore?.Empleado?.nombre || $currentUserStore?.name_user}
					{#if $currentUserStore?.Empleado?.apellido_paterno}
						{$currentUserStore?.Empleado?.apellido_paterno}
					{/if}
				</span>!
			</h1>
			{#if $currentUserStore?.Role?.nombre_rol}
				<p class="hidden text-sm font-medium text-light-one/70 sm:block">
					{$currentUserStore?.Role?.nombre_rol}
				</p>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			<button class="rounded-full p-2 transition-colors" aria-label="Notifications">
				<BellIcon />
			</button>

			<button class="rounded-full p-2 transition-colors" aria-label="Settings">
				<SettingsIcon />
			</button>
			<div class="relative">
				<button
					bind:this={trigger}
					class="flex items-center rounded-full bg-light-accent p-2 transition-colors"
					onclick={() => (isDropdownOpen = !isDropdownOpen)}
				>
					<span><UserIcon class="h-5 w-5" /></span>
				</button>
				<DropdownMenu
					{options}
					{width}
					bind:isOpen={isDropdownOpen}
					triggerElement={trigger}
					class="absolute top-full right-0"
				/>
			</div>
		</div>
	</div>
</header>
