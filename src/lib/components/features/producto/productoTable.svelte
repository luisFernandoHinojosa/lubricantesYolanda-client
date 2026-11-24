<script lang="ts">
	import type { Producto } from '$lib/interfaces';
	import ProductoTableRow from './productoTableRow.svelte';
	import ProductoTableRowSkeleton from './productoTableRowSkeleton.svelte';
	import { PackageIcon } from '$lib/icons/outline';

	interface Props {
		productos: Producto[];
		isLoading: boolean;
		hayFiltros?: boolean;
		onView?: (p: Producto) => void;
		onEdit?: (id: string) => void;
		onDelete?: (p: Producto) => void;
		onTraslado?: (p: Producto) => void;
		onManagePresentaciones?: (p: Producto) => void;
		fetchingProductId?: string | null;
	}

	let {
		productos,
		isLoading,
		hayFiltros = false,
		onView,
		onEdit,
		onDelete,
		onTraslado,
		onManagePresentaciones,
		fetchingProductId
	}: Props = $props();

	const TH = 'px-4 py-3 text-left text-sm font-semibold whitespace-nowrap text-acero-600';
</script>

<div class="overflow-x-auto rounded-xl border border-acero-200 bg-white">
	<table class="min-w-full text-[0.9375rem]" aria-busy={isLoading}>
		<caption class="sr-only">Productos del inventario</caption>
		<thead class="border-b border-acero-200 bg-acero-50">
			<tr>
				<th scope="col" class={TH}>Producto</th>
				<th scope="col" class={TH}>Marca y categoría</th>
				<th scope="col" class="{TH} hidden xl:table-cell">Proveedor</th>
				<th scope="col" class="{TH} hidden lg:table-cell">Ubicación</th>
				<th scope="col" class="{TH} text-right">Stock</th>
				<th scope="col" class="{TH} hidden md:table-cell">Presentaciones</th>
				<th scope="col" class="{TH} w-14"><span class="sr-only">Acciones</span></th>
			</tr>
		</thead>
		<tbody class="divide-y divide-acero-100">
			{#if isLoading}
				{#each Array.from({ length: 8 }, (_, i) => i) as i (i)}
					<ProductoTableRowSkeleton index={i} />
				{/each}
			{:else if productos.length === 0}
				<tr>
					<td colspan="7" class="px-6 py-14 text-center">
						<div class="mx-auto flex max-w-sm flex-col items-center gap-2">
							<span
								class="flex size-12 items-center justify-center rounded-full bg-acero-100 text-acero-500"
							>
								<PackageIcon class="size-6" />
							</span>
							<p class="font-semibold text-acero-900">
								{hayFiltros ? 'Ningún producto coincide con los filtros' : 'Aún no hay productos'}
							</p>
							<p class="text-sm text-acero-500">
								{hayFiltros
									? 'Pruebe con otro nombre o quite algún filtro.'
									: 'Registre el primer producto para empezar a vender.'}
							</p>
						</div>
					</td>
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
