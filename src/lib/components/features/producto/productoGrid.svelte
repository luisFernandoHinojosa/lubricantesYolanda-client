<script lang="ts">
	import type { Producto } from '$lib/interfaces';
	import ProductoCard from './productoCard.svelte';
	import ProductoCardSkeleton from './productoCardSkeleton.svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		productos: Producto[];
		isLoading: boolean;
		onView?: (p: Producto) => void;
		onEdit?: (id: string) => void;
		onDelete?: (p: Producto) => void;
		onTraslado?: (p: Producto) => void;
		onManagePresentaciones?: (p: Producto) => void;
		fetchingProductId?: string | null;
	}

	let { productos, isLoading, onView, onEdit, onDelete, onTraslado, onManagePresentaciones, fetchingProductId }: Props = $props();
</script>

<div in:fade>
	{#if isLoading}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each Array.from({ length: 8 }, (_, i) => i) as i (i)}
				<ProductoCardSkeleton />
			{/each}
		</div>
	{:else if productos.length === 0}
		<div class="rounded-xl border border-dashed border-gray-300 bg-white p-20 text-center">
			<p class="text-gray-500">No se encontraron productos.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each productos as product (product.id)}
				<ProductoCard
					producto={product}
					{onView}
					{onEdit}
					{onDelete}
					{onTraslado}
					{onManagePresentaciones}
					isFetching={fetchingProductId === product.id}
				/>
			{/each}
		</div>
	{/if}
</div>
