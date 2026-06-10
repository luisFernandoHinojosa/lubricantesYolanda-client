<script lang="ts">
	import { ZoomIcon, ClipboardIcon, DownloadIcon, ListIcon } from '$lib/icons/outline';
	import { LayoutGridIcon } from '$lib/icons/solid';
	import type { Categoria, Marca, Proveedor, Producto, ProductoFilters } from '$lib/interfaces';
	import type { VIEW_MODE_PRODUCTO } from '$lib/types';
	import { Input, Select } from '$lib/components/ui';
	import { productoService } from '$lib/services';
	import { alert } from '$lib/utils';

	interface Props {
		searchInput: string;
		onSearchInput: (e: Event) => void;
		categorias: Categoria[];
		marcas: Marca[];
		proveedores: Proveedor[];
		productos: Producto[];
		viewMode: VIEW_MODE_PRODUCTO;
		setViewMode: (mode: VIEW_MODE_PRODUCTO) => void;
		filters: ProductoFilters;
		loadData: () => void;
	}

	let {
		searchInput,
		onSearchInput,
		categorias,
		marcas,
		proveedores,
		productos,
		viewMode,
		setViewMode,
		filters,
		loadData
	}: Props = $props();

	let isDownloading = $state(false);

	async function handleDownload() {
		try {
			isDownloading = true;
			await productoService.exportarExcel();
			alert('success', 'Excel descargado correctamente');
		} catch (error) {
			console.error('Error al descargar excel:', error);
			alert('error', 'Ocurrió un error al descargar el archivo Excel');
		} finally {
			isDownloading = false;
		}
	}

	function handleFilterChange() {
		filters.page = 1;
		loadData();
	}
</script>

<div class="mb-6 space-y-4">
	<div class="flex flex-wrap items-end gap-4">
		<div class="relative min-w-[300px] flex-1">
			<Input
				id="search-productos"
				type="text"
				label="Búsqueda"
				value={searchInput}
				oninput={onSearchInput}
				placeholder="Buscar..."
				icon={ZoomIcon}
			/>
		</div>

		<div class="w-full md:w-48">
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
		</div>

		<div class="w-full md:w-36">
			<Select id="marca" label="Marca" bind:value={filters.id_marca} onchange={handleFilterChange}>
				<option value="">Todas</option>
				{#each marcas as marca, idx (marca.id || idx)}
					<option value={marca.id}>{marca.nombre}</option>
				{/each}
			</Select>
		</div>

		<div class="w-full md:w-48">
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
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<button
				class="flex h-10 w-10 items-center justify-center rounded-lg border border-light-four text-light-two transition-colors hover:bg-light-one_d"
			>
				<ClipboardIcon class="h-5 w-5" />
			</button>
			<button
				onclick={handleDownload}
				disabled={isDownloading}
				class="flex h-10 w-10 items-center justify-center rounded-lg border border-light-four text-light-two transition-colors hover:bg-light-one_d disabled:opacity-50"
				title="Descargar Excel"
			>
				{#if isDownloading}
					<div class="h-5 w-5 animate-spin rounded-full border-2 border-light-two border-t-transparent"></div>
				{:else}
					<DownloadIcon class="h-5 w-5" />
				{/if}
			</button>
			<button
				onclick={() => setViewMode('table')}
				class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors {viewMode ===
				'table'
					? 'bg-light-two text-light-one'
					: 'border border-light-four text-light-two hover:bg-light-one_d'}"
				title="Vista de Tabla"
			>
				<ListIcon class="h-5 w-5" />
			</button>
			<button
				onclick={() => setViewMode('cards')}
				class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors {viewMode ===
				'cards'
					? 'bg-light-two text-light-one'
					: 'border border-light-four text-light-two hover:bg-light-one_d'}"
				title="Vista de Tarjetas"
			>
				<LayoutGridIcon class="h-5 w-5" />
			</button>
		</div>
	</div>
</div>
