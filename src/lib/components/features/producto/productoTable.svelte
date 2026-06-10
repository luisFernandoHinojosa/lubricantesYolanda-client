<script lang="ts">
	import type { Producto } from '$lib/interfaces';
	import ProductoTableRow from './productoTableRow.svelte';
	import ProductoTableRowSkeleton from './productoTableRowSkeleton.svelte';
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

<div class="overflow-x-auto rounded-xl border border-light-four bg-light-one shadow-sm" in:fade>
	<table class="min-w-full divide-y divide-light-four">
		<thead class="bg-light-one_d font-bold">
			<tr>
				<th class="px-6 py-4 text-center text-xs font-bold tracking-wider text-light-two uppercase"
					>Imagen</th
				>
				<th class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
					>Producto</th
				>
				<th class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
					>Serie</th
				>
				<th class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
					>Marca</th
				>
				<th class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
					>Categoria</th
				>
				<th class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
					>Proveedor</th
				>
				<th class="px-6 py-4 text-left text-xs font-bold tracking-wider text-light-two uppercase"
					>Ubicacion</th
				>
				<th class="px-6 py-4 text-center text-xs font-bold tracking-wider text-light-two uppercase"
					>Stock</th
				>
				<th class="px-6 py-4 text-center text-xs font-bold tracking-wider text-light-two uppercase"
					>Presentaciones</th
				>
				<th class="px-6 py-4 text-center text-xs font-bold tracking-wider text-light-two uppercase"
					>Unidad medida</th
				>
				<th class="px-6 py-4 text-center text-xs font-bold tracking-wider text-light-two uppercase"
					>Acciones</th
				>
			</tr>
		</thead>
		<tbody class="divide-y divide-light-four bg-light-one">
			{#if isLoading}
				{#each Array.from({ length: 8 }, (_, i) => i) as i (i)}
					<ProductoTableRowSkeleton index={i} />
				{/each}
			{:else if productos.length === 0}
				<tr>
					<td colspan="11" class="p-12 text-center text-light-black"
						>No se encontraron productos.</td
					>
				</tr>
			{:else}
				{#each productos as product (product.id)}
					<ProductoTableRow
						producto={product}
						{onView}
						{onEdit}
						{onDelete}
						{onTraslado}
						{onManagePresentaciones}
						isFetching={fetchingProductId === product.id}
					/>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
