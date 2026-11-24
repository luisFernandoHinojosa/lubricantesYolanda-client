<script lang="ts">
	import { SearchIcon, DownloadIcon, ListIcon, LoaderIcon, XIcon } from '$lib/icons/outline';
	import { LayoutGridIcon } from '$lib/icons/solid';
	import type { Categoria, Marca, Proveedor, Producto, ProductoFilters } from '$lib/interfaces';
	import type { VIEW_MODE_PRODUCTO } from '$lib/types';
	import { Input, Select } from '$lib/components/ui';
	import { productoService } from '$lib/services';
	import { alert } from '$lib/utils';

	interface Props {
		searchInput: string;
		onSearchInput: (e: Event) => void;
		onClearFilters?: () => void;
		categorias: Categoria[];
		marcas: Marca[];
		proveedores: Pick<Proveedor, 'id' | 'nombre'>[];
		productos: Producto[];
		viewMode: VIEW_MODE_PRODUCTO;
		setViewMode: (mode: VIEW_MODE_PRODUCTO) => void;
		filters: ProductoFilters;
		loadData: () => void;
	}

	let {
		searchInput,
		onSearchInput,
		onClearFilters,
		categorias,
		marcas,
		proveedores,
		viewMode,
		setViewMode,
		filters = $bindable(),
		loadData
	}: Props = $props();

	let isDownloading = $state(false);

	const hayFiltros = $derived(
		!!(searchInput || filters.id_proveedor || filters.id_marca || filters.id_categoria)
	);

	async function handleDownload() {
		try {
			isDownloading = true;
			await productoService.exportarExcel();
			alert('success', 'Excel descargado');
		} catch (error) {
			console.error('Error al descargar excel:', error);
			alert('error', 'No se pudo generar el Excel. Intente de nuevo.');
		} finally {
			isDownloading = false;
		}
	}

	function handleFilterChange() {
		filters.page = 1;
		loadData();
	}

	const VISTAS = [
		{ id: 'table', label: 'Ver como tabla', icon: ListIcon },
		{ id: 'cards', label: 'Ver como tarjetas', icon: LayoutGridIcon }
	] as const;
</script>

<div
	class="rounded-xl border border-acero-200 bg-white p-3 sm:p-4"
	role="search"
	aria-label="Filtrar productos"
>
	<div
		class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1.6fr)_1fr_1fr_1fr_auto]"
	>
		<Input
			id="search-productos"
			type="search"
			label="Buscar"
			value={searchInput}
			oninput={onSearchInput}
			placeholder="Nombre o código de barras"
			icon={SearchIcon}
			class="sm:col-span-2 lg:col-span-1"
		/>

		<Select
			id="proveedor"
			label="Proveedor"
			bind:value={filters.id_proveedor}
			onchange={handleFilterChange}
		>
			<option value="">Todos</option>
			{#each proveedores as prov, idx (prov.id || idx)}
				<option value={prov.id}>{prov.nombre}</option>
			{/each}
		</Select>

		<Select id="marca" label="Marca" bind:value={filters.id_marca} onchange={handleFilterChange}>
			<option value="">Todas</option>
			{#each marcas as marca, idx (marca.id || idx)}
				<option value={marca.id}>{marca.nombre}</option>
			{/each}
		</Select>

		<Select
			id="categoria"
			label="Categoría"
			bind:value={filters.id_categoria}
			onchange={handleFilterChange}
		>
			<option value="">Todas</option>
			{#each categorias as cat, idx (cat.id || idx)}
				<option value={cat.id}>{cat.nombre}</option>
			{/each}
		</Select>

		<div class="flex items-end gap-2">
			<button
				type="button"
				onclick={handleDownload}
				disabled={isDownloading}
				class="flex h-[42px] items-center gap-2 rounded-lg border border-acero-200 bg-white px-3 text-sm font-semibold text-acero-800 transition-colors hover:border-acero-300 hover:bg-acero-50 disabled:opacity-50"
			>
				{#if isDownloading}
					<LoaderIcon class="size-5 animate-spin" />
				{:else}
					<DownloadIcon class="size-5" />
				{/if}
				Excel
			</button>
			<div
				class="flex h-[42px] rounded-lg border border-acero-200 p-0.5"
				role="radiogroup"
				aria-label="Vista"
			>
				{#each VISTAS as v (v.id)}
					<button
						type="button"
						role="radio"
						aria-checked={viewMode === v.id}
						onclick={() => setViewMode(v.id)}
						class="flex w-9 items-center justify-center rounded-md transition-colors {viewMode ===
						v.id
							? 'bg-acero-900 text-white'
							: 'text-acero-500 hover:bg-acero-100 hover:text-acero-900'}"
						aria-label={v.label}
						title={v.label}
					>
						<v.icon class="size-[18px]" />
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#if hayFiltros && onClearFilters}
		<div class="mt-3 flex justify-end border-t border-acero-100 pt-2.5">
			<button
				type="button"
				onclick={onClearFilters}
				class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-acero-600 hover:bg-acero-100 hover:text-acero-950"
			>
				<XIcon class="size-4" /> Quitar filtros
			</button>
		</div>
	{/if}
</div>
