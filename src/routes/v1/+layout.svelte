<script lang="ts">
	import Sidebar from '$lib/components/ui/sidebar.svelte';
	import Header from '$lib/components/ui/header.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { currentUserStore } from '$lib/stores';
	import { canAccess, getDefaultRedirect } from '$lib/utils/rbac.utils';

	let sidebarOpen: boolean = $state(false);

	const toggleSidebar = () => {
		sidebarOpen = !sidebarOpen;
	};

	let { children } = $props();

	// Protection logic
	$effect(() => {
		const currentPath = $page.url.pathname;
		const role = $currentUserStore?.Role?.code_rol;

		// Only check for /v1/ paths
		if (currentPath.startsWith('/v1/')) {
			if (!canAccess(role, currentPath)) {
				console.warn(`Acceso denegado a ${currentPath} para el rol ${role}. Redirigiendo...`);
				goto(getDefaultRedirect(role));
			}
		}
	});
</script>

<div class="flex h-screen bg-light-one">
	<Sidebar isOpen={sidebarOpen} isCollapsed={false} />
	<div class="flex flex-1 flex-col overflow-hidden transition-all duration-300">
		<Header onToggleSidebar={toggleSidebar} />

		<main class="flex-1 overflow-y-auto p-6">
			{@render children?.()}
		</main>
	</div>
</div>
