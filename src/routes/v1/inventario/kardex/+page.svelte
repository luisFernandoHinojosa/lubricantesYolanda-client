<script lang="ts">
	import { onMount } from 'svelte';
	import { kardexService, sucursalService } from '$lib/services';
	import { Pagination, Heading, Input, Select, Button } from '$lib/components/ui';
	import { ZoomIcon } from '$lib/icons/outline';
	import { MovimientoTableSkeleton } from '$lib/components/skeletons';
	import { MainLayout } from '$lib/components/layout';
	import { redirect } from '$lib/utils';
	import type { Sucursal } from '$lib/interfaces';
	import type {
		KardexFilters,
		KardexMovimiento,
		KardexResumenListado
	} from '$lib/interfaces/kardexMovimiento.interface';
	import PeriodoFiltro from '$lib/components/features/kardex/PeriodoFiltro.svelte';
	import KardexDetalleModal from '$lib/components/features/kardex/KardexDetalleModal.svelte';
	import {
		TIPOS_MOVIMIENTO,
		NATURALEZAS,
		tipoInfo,
		colorNaturaleza,
		cantidadConSigno,
		formatBs,
		fechaHora,
		formatFechaCalendario,
		diasParaVencer,
		type PresetPeriodo
	} from '$lib/components/features/kardex/kardex.utils';

	type SortField = NonNullable<KardexFilters['sortBy']>;

	const filtrosIniciales = (): KardexFilters => ({
		page: 1,
		perPage: 15,
		search: '',
		desde: '',
		hasta: '',
		tipo_movimiento: '',
		naturaleza: '',
		id_sucursal: '',
		sortBy: 'fecha',
		sortOrder: 'DESC'
	});

	let movimientos = $state<KardexMovimiento[]>([]);
	let resumen = $state<KardexResumenListado | null>(null);
	let total = $state(0);
	let totalPages = $state(1);
	let isLoading = $state(true);
	let error = $state('');
	let sucursales = $state<Sucursal[]>([]);
	let seleccionado = $state<KardexMovimiento | null>(null);

	let filters = $state<KardexFilters>(filtrosIniciales());
	let preset = $state<PresetPeriodo>('todo');
	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;
	let requestId = 0;

	const hayFiltros = $derived(
		!!(
			filters.search ||
			filters.desde ||
			filters.hasta ||
			filters.tipo_movimiento ||
			filters.naturaleza ||
			filters.id_sucursal
		)
	);

	const loadData = async () => {
		const id = ++requestId;
		try {
			isLoading = true;
			error = '';
			const response = await kardexService.getKardexMovimientos(filters);
			if (id !== requestId) return; // descarta respuestas viejas
			movimientos = response.kardexMovimientos || [];
			resumen = response.resumen ?? null;
			total = response.total || 0;
			totalPages = response.totalPages || 1;
		} catch (err) {
			if (id !== requestId) return;
			console.error('Error fetching kardex:', err);
			error = 'No se pudo cargar el kardex. Intenta nuevamente.';
		} finally {
			if (id === requestId) isLoading = false;
		}
	};

	const recargar = () => {
		filters.page = 1;
		loadData();
	};

	onMount(() => {
		loadData();
		sucursalService
			.getSucursalesCatalogo()
			.then((data) => (sucursales = data ?? []))
			.catch(() => (sucursales = []));
	});

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			filters.search = value.trim();
			recargar();
		}, 400);
	}

	function ordenarPor(campo: SortField) {
		if (filters.sortBy === campo) {
			filters.sortOrder = filters.sortOrder === 'DESC' ? 'ASC' : 'DESC';
		} else {
			filters.sortBy = campo;
			filters.sortOrder = campo === 'producto' ? 'ASC' : 'DESC';
		}
		recargar();
	}

	function limpiarFiltros() {
		filters = filtrosIniciales();
		preset = 'todo';
		searchInput = '';
		loadData();
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadData();
	}

	const verTarjeta = (idProducto: string) => redirect(`/v1/inventario/kardex/${idProducto}`);

	const flechaOrden = (campo: SortField) =>
		filters.sortBy === campo ? (filters.sortOrder === 'ASC' ? '▲' : '▼') : '';

	const thClass = 'px-4 py-3 text-left text-xs font-bold tracking-wider text-light-two uppercase';
</script>

{#snippet thOrdenable(label: string, campo: SortField, extra = '')}
	<th class="{thClass} {extra}">
		<button
			type="button"
			class="inline-flex items-center gap-1 uppercase hover:text-light-black"
			onclick={() => ordenarPor(campo)}
		>
			{label}
			<span class="text-[10px]">{flechaOrden(campo)}</span>
		</button>
	</th>
{/snippet}

{#snippet tarjetaStat(titulo: string, valor: string, detalle: string, color = 'text-light-one')}
	<div
		class="relative overflow-hidden rounded-2xl border border-light-four bg-light-two p-5 text-light-black shadow-lg"
	>
		<div class="mb-1 text-xs font-bold tracking-wider text-light-one uppercase">{titulo}</div>
		<div class="text-3xl font-black tracking-tight {color}">{valor}</div>
		<div class="mt-1 text-xs text-light-one/80">{detalle}</div>
	</div>
{/snippet}

<MainLayout
	title="Kardex de Movimientos"
	description="Historial de movimientos de productos."
	class="container mx-auto space-y-6"
>
	<div class="flex flex-col justify-between gap-2 md:flex-row md:items-end">
		<div>
			<Heading level="h4">Kardex de Movimientos</Heading>
		</div>
	</div>

	<!-- Resumen -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{@render tarjetaStat(
			'Movimientos',
			String(total),
			hayFiltros ? 'Con los filtros aplicados' : 'Total registrado'
		)}
		{@render tarjetaStat(
			'Entradas',
			String(resumen?.entradas ?? 0),
			`Valor al costo: ${formatBs(resumen?.valor_entradas ?? 0)}`
		)}
		{@render tarjetaStat(
			'Salidas',
			String(resumen?.salidas ?? 0),
			`Valor al costo: ${formatBs(resumen?.valor_salidas ?? 0)}`
		)}
		{@render tarjetaStat(
			'Traslados internos',
			String(resumen?.neutros ?? 0),
			'No cambian el stock total'
		)}
	</div>

	<!-- Filtros -->
	<div class="space-y-4 rounded-2xl border border-light-four bg-light-one p-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="min-w-[280px] flex-1">
				<Input
					id="search-kardex"
					type="text"
					label="Búsqueda"
					value={searchInput}
					oninput={handleSearchInput}
					placeholder="Producto, marca, SKU, lote o N° de comprobante..."
					icon={ZoomIcon}
				/>
			</div>
			<PeriodoFiltro
				bind:desde={filters.desde}
				bind:hasta={filters.hasta}
				bind:preset
				onchange={recargar}
			/>
		</div>
		<div class="flex flex-wrap items-end gap-4">
			<div class="w-full sm:w-56">
				<Select
					id="sucursal-kardex"
					label="Sucursal"
					bind:value={filters.id_sucursal}
					onchange={recargar}
				>
					<option value="">Todas las sucursales</option>
					{#each sucursales as s (s.id)}
						<option value={s.id}>{s.nombre}</option>
					{/each}
				</Select>
			</div>
			<div class="w-full sm:w-56">
				<Select
					id="tipo-kardex"
					label="Tipo de movimiento"
					bind:value={filters.tipo_movimiento}
					onchange={recargar}
				>
					<option value="">Todos los tipos</option>
					{#each TIPOS_MOVIMIENTO as t (t.value)}
						<option value={t.value}>{t.label}</option>
					{/each}
				</Select>
			</div>
			<div class="w-full sm:w-56">
				<Select
					id="naturaleza-kardex"
					label="Entrada / Salida"
					bind:value={filters.naturaleza}
					onchange={recargar}
				>
					<option value="">Entradas y salidas</option>
					{#each NATURALEZAS as n (n.value)}
						<option value={n.value}>{n.label}</option>
					{/each}
				</Select>
			</div>
			{#if hayFiltros}
				<Button variant="ghost" size="sm" onclick={limpiarFiltros}>Limpiar filtros</Button>
			{/if}
		</div>
	</div>

	{#if isLoading && movimientos.length === 0}
		<MovimientoTableSkeleton />
	{:else if error}
		<div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
			{error}
			<Button variant="ghost" size="sm" onclick={loadData}>Reintentar</Button>
		</div>
	{:else if movimientos.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-light-four bg-light-one p-16 text-center"
		>
			<div class="mb-6 rounded-full bg-light-one_d p-6">
				<span class="text-4xl text-gray-300">📦</span>
			</div>
			<h3 class="text-xl font-bold text-light-black">No se encontraron movimientos</h3>
			<p class="mx-auto mt-2 max-w-xs text-light-two">
				{hayFiltros
					? 'No hay resultados con estos filtros. Prueba con otros términos o un periodo más amplio.'
					: 'Aún no hay movimientos registrados en el kardex.'}
			</p>
		</div>
	{:else}
		<div
			class="overflow-x-auto rounded-xl border border-light-four bg-light-one shadow-sm transition-opacity {isLoading
				? 'opacity-60'
				: ''}"
		>
			<table class="min-w-full divide-y divide-light-four">
				<thead class="bg-light-one_d font-bold">
					<tr>
						{@render thOrdenable('Fecha', 'fecha')}
						{@render thOrdenable('Movimiento', 'tipo_movimiento')}
						{@render thOrdenable('Producto / Lote', 'producto')}
						<th class={thClass}>Origen → Destino</th>
						{@render thOrdenable('Cantidad', 'cantidad', 'text-right')}
						<th class="{thClass} text-right">Valor</th>
						<th class={thClass}>Responsable</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each movimientos as mov (mov.id)}
						{@const tipo = tipoInfo(mov.tipo_movimiento)}
						{@const fh = fechaHora(mov.fecha)}
						{@const dias = diasParaVencer(mov.lote.fecha_vencimiento)}
						<tr
							class="cursor-pointer border-b border-light-four text-light-black transition-colors hover:bg-light-one_d"
							onclick={() => (seleccionado = mov)}
						>
							<td class="px-4 py-3 text-sm whitespace-nowrap">
								<div class="font-medium">{fh.fecha}</div>
								<div class="text-xs text-gray-400">{fh.hora}</div>
							</td>
							<td class="px-4 py-3 text-sm">
								<span
									class="inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase {tipo.clase}"
								>
									{tipo.label}
								</span>
								{#if mov.documento}
									<div class="mt-1 font-mono text-[11px] text-gray-500">{mov.documento.numero}</div>
								{/if}
							</td>
							<td class="max-w-[280px] px-4 py-3 text-sm">
								<button
									type="button"
									class="line-clamp-1 text-left font-bold text-gray-700 hover:text-light-two hover:underline"
									title="Ver tarjeta kardex del producto"
									onclick={(e) => {
										e.stopPropagation();
										verTarjeta(mov.producto.id);
									}}
								>
									{mov.producto.nombre}
								</button>
								<div class="line-clamp-1 text-xs text-gray-400">
									{[mov.producto.marca, mov.producto.sku].filter(Boolean).join(' · ')}
								</div>
								<div class="mt-1 flex flex-wrap items-center gap-1">
									<span
										class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-gray-500"
									>
										{mov.lote.codigo}
									</span>
									{#if mov.lote.fecha_vencimiento}
										<span
											class="text-[10px] font-semibold {dias !== null && dias < 0
												? 'text-red-600'
												: dias !== null && dias <= 30
													? 'text-amber-600'
													: 'text-gray-400'}"
										>
											Vence {formatFechaCalendario(mov.lote.fecha_vencimiento)}
										</span>
									{/if}
								</div>
							</td>
							<td class="px-4 py-3 text-xs text-gray-500">
								<div class="flex flex-col gap-0.5">
									<span>
										<span class="text-red-400">←</span>
										{mov.origen?.descripcion || (mov.naturaleza === 'ENTRADA' ? 'Externo' : '—')}
									</span>
									<span>
										<span class="text-green-500">→</span>
										{mov.destino?.descripcion || (mov.naturaleza === 'SALIDA' ? 'Externo' : '—')}
									</span>
								</div>
							</td>
							<td
								class="px-4 py-3 text-right text-sm font-bold whitespace-nowrap {colorNaturaleza(
									mov.naturaleza
								)}"
							>
								{cantidadConSigno(mov)}
							</td>
							<td class="px-4 py-3 text-right text-sm whitespace-nowrap text-gray-600">
								{formatBs(mov.valor_total)}
							</td>
							<td class="px-4 py-3 text-sm font-medium text-gray-600">
								{mov.usuario?.nombre ?? 'Sistema'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !error && movimientos.length > 0 && totalPages > 1}
		<Pagination
			currentPage={filters.page ?? 1}
			{totalPages}
			perPage={filters.perPage ?? 15}
			{total}
			onPageChange={handlePageChange}
		/>
	{/if}
</MainLayout>

<KardexDetalleModal
	movimiento={seleccionado}
	onClose={() => (seleccionado = null)}
	onVerTarjeta={(id) => {
		seleccionado = null;
		verTarjeta(id);
	}}
/>
