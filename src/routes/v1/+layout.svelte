<script lang="ts">
	import Sidebar from '$lib/components/ui/sidebar.svelte';
	import Header from '$lib/components/ui/header.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { currentUserStore } from '$lib/stores';
	import { canAccess, getDefaultRedirect } from '$lib/utils/rbac.utils';

	let { children } = $props();

	let sidebarOpen = $state(false);
	let sidebarCollapsed = $state(false);

	// Sin sesión no se entra a /v1; con sesión, solo a las rutas que permite el rol
	$effect(() => {
		const currentPath = page.url.pathname;
		const role = $currentUserStore?.Role?.code_rol;

		if (!$currentUserStore) {
			goto(`/auth/sign-in?redirectTo=${encodeURIComponent(currentPath)}`, { replaceState: true });
			return;
		}

		if (currentPath.startsWith('/v1/') && !canAccess(role, currentPath)) {
			goto(getDefaultRedirect(role), { replaceState: true });
		}
	});

	// Al cambiar de pantalla, cerrar el menú móvil
	$effect(() => {
		void page.url.pathname;
		sidebarOpen = false;
	});
</script>

<a
	href="#contenido"
	class="sr-only z-[100] rounded-md bg-white px-4 py-2 font-medium text-acero-950 shadow focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
	>Saltar al contenido</a
>

<div class="flex h-dvh bg-acero-50">
	<Sidebar bind:isOpen={sidebarOpen} bind:isCollapsed={sidebarCollapsed} />
	<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
		<Header onToggleSidebar={() => (sidebarOpen = !sidebarOpen)} {sidebarOpen} />

		<main id="contenido" tabindex="-1" class="flex-1 overflow-y-auto p-4 outline-none md:p-6">
			{@render children?.()}
		</main>
	</div>
</div>
