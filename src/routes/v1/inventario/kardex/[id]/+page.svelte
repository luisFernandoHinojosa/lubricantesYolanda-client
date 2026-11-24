<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { page } from '$app/state';
	import { kardexService, sucursalService } from '$lib/services';
	import { Pagination, Heading, Select, Button } from '$lib/components/ui';
	import { ArrowLeftIcon } from '$lib/icons/outline';
	import { MovimientoTableSkeleton } from '$lib/components/skeletons';
	import { MainLayout } from '$lib/components/layout';
	import { redirect } from '$lib/utils';
	import type { Sucursal } from '$lib/interfaces';
	import type {
		KardexMovimiento,
		TarjetaKardex,
		TarjetaKardexFilters
	} from '$lib/interfaces/kardexMovimiento.interface';
	import PeriodoFiltro from '$lib/components/features/kardex/PeriodoFiltro.svelte';
	import KardexDetalleModal from '$lib/components/features/kardex/KardexDetalleModal.svelte';
	import {
		TIPOS_MOVIMIENTO,
		tipoInfo,
		formatCantidad,
		formatBs,
		fechaHora,
		formatFechaCalendario,
		rangoDePreset,
		type PresetPeriodo
	} from '$lib/components/features/kardex/kardex.utils';

	const idProducto = $derived(page.params.id ?? '');

	const filtrosIniciales = (): TarjetaKardexFilters => ({
		page: 1,
		perPage: 25,
		...rangoDePreset('mes'),
		id_sucursal: '',
		id_lote: '',
		tipo_movimiento: '',
		sortOrder: 'ASC'
	});

	let data = $state<TarjetaKardex | null>(null);
	let isLoading = $state(true);
	let error = $state('');
	let sucursales = $state<Sucursal[]>([]);
	let seleccionado = $state<KardexMovimiento | null>(null);
	let filters = $state<TarjetaKardexFilters>(filtrosIniciales());
	let preset = $state<PresetPeriodo>('mes');
	let requestId = 0;

	const unidad = $derived(data?.producto.unidad ? ` ${data.producto.unidad}` : '');
	const mostrarSaldoInicial = $derived(
		!!data && !!filters.desde && filters.sortOrder === 'ASC' && (filters.page ?? 1) === 1
	);

	const loadData = async () => {
		if (!idProducto) return;
		const id = ++requestId;
		try {
			isLoading = true;
			error = '';
			const response = await kardexService.getTarjetaKardex(idProducto, filters);
			if (id !== requestId) return;
			data = response;
		} catch (err: any) {
			if (id !== requestId) return;
			console.error('Error fetching tarjeta kardex:', err);
			error =
				err?.status === 404 || err?.response?.status === 404
					? 'Producto no encontrado.'
					: 'No se pudo cargar la tarjeta kardex. Intenta nuevamente.';
		} finally {
			if (id === requestId) isLoading = false;
		}
	};

	const recargar = () => {
		filters.page = 1;
		loadData();
	};

	// Recarga al cambiar de producto (misma ruta, otro id)
	$effect(() => {
		idProducto;
		untrack(() => {
			data = null;
			filters = filtrosIniciales();
			preset = 'mes';
			loadData();
		});
	});

	onMount(() => {
		sucursalService
			.getSucursalesCatalogo()
			.then((res) => (sucursales = res ?? []))
			.catch(() => (sucursales = []));
	});

	function handlePageChange(p: number) {
		filters.page = p;
		loadData();
	}

	function toggleOrden() {
		filters.sortOrder = filters.sortOrder === 'ASC' ? 'DESC' : 'ASC';
		recargar();
	}

	const ubicacionCorta = (mov: KardexMovimiento) => {
		const o = mov.origen?.descripcion;
		const d = mov.destino?.descripcion;
		if (o && d) return `${o} → ${d}`;
		return o ?? d ?? '—';
	};

	const thClass = 'px-3 py-3 text-left text-xs font-bold tracking-wider text-light-two uppercase';
	const thNum = 'px-3 py-3 text-right text-xs font-bold tracking-wider text-light-two uppercase';
</script>

{#snippet stat(titulo: string, cantidad: string, valor: string, color: string)}
	<div class="rounded-2xl border border-light-four bg-light-one p-4 shadow-sm">
		<div class="text-xs font-bold tracking-wider text-light-two uppercase">{titulo}</div>
		<div class="mt-1 text-2xl font-black tracking-tight {color}">{cantidad}</div>
		<div class="text-xs text-gray-500">{valor}</div>
	</div>
{/snippet}

<MainLayout
	title={data ? `Kardex · ${data.producto.nombre}` : 'Tarjeta Kardex'}
	description="Tarjeta kardex del producto con saldos."
	class="container mx-auto space-y-6"
>
	<header class="flex flex-wrap items-start justify-between gap-4">
		<div class="flex items-start gap-2">
			<Button variant="ghost" onclick={() => redirect('/v1/inventario/kardex')} aria-label="Volver">
				{#snippet leftIcon()}
					<ArrowLeftIcon class="size-5" />
				{/snippet}
			</Button>
			<div>
				<p class="text-xs font-bold tracking-wider text-light-two uppercase">Tarjeta kardex</p>
				<Heading level="h4">{data?.producto.nombre ?? 'Cargando...'}</Heading>
				{#if data}
					<p class="text-sm text-gray-500">
						{[
							data.producto.marca,
							data.producto.categoria,
							data.producto.sku && `SKU ${data.producto.sku}`,
							data.producto.unidad && `Unidad: ${data.producto.unidad}`
						]
							.filter(Boolean)
							.join(' · ')}
					</p>
				{/if}
			</div>
		</div>
		{#if data}
			<Button
				variant="secondary"
				size="sm"
				onclick={() => redirect(`/v1/productos/productos/${data?.producto.id}`)}
			>
				Ver producto
			</Button>
		{/if}
	</header>

	<!-- Filtros -->
	<div class="flex flex-wrap items-end gap-4 rounded-2xl border border-light-four bg-light-one p-4">
		<PeriodoFiltro
			bind:desde={filters.desde}
			bind:hasta={filters.hasta}
			bind:preset
			onchange={recargar}
		/>
		<div class="w-full sm:w-48">
			<Select id="tk-sucursal" label="Sucursal" bind:value={filters.id_sucursal} onchange={recargar}>
				<option value="">Todas</option>
				{#each sucursales as s (s.id)}
					<option value={s.id}>{s.nombre}</option>
				{/each}
			</Select>
		</div>
		<div class="w-full sm:w-48">
			<Select id="tk-lote" label="Lote" bind:value={filters.id_lote} onchange={recargar}>
				<option value="">Todos los lotes</option>
				{#each data?.lotes ?? [] as l (l.id)}
					<option value={l.id}>
						{l.codigo}{l.fecha_vencimiento ? ` · vence ${formatFechaCalendario(l.fecha_vencimiento)}` : ''}
					</option>
				{/each}
			</Select>
		</div>
		<div class="w-full sm:w-48">
			<Select id="tk-tipo" label="Tipo" bind:value={filters.tipo_movimiento} onchange={recargar}>
				<option value="">Todos</option>
				{#each TIPOS_MOVIMIENTO as t (t.value)}
					<option value={t.value}>{t.label}</option>
				{/each}
			</Select>
		</div>
	</div>

	{#if error}
		<div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
			{error}
			<Button variant="ghost" size="sm" onclick={loadData}>Reintentar</Button>
		</div>
	{:else if !data}
		<MovimientoTableSkeleton />
	{:else}
		<!-- Cuadre con el stock real -->
		{#if data.cuadre.cuadra}
			<div
				class="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800"
			>
				<span>✔</span>
				El kardex cuadra con el stock actual del sistema:
				<strong>{formatCantidad(data.cuadre.stock_sistema)}{unidad}</strong>
				{filters.id_sucursal || filters.id_lote ? '(en el filtro seleccionado)' : ''}
			</div>
		{:else}
			<div class="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
				<div class="font-bold">⚠ El kardex no cuadra con el stock actual</div>
				<div class="mt-1">
					Saldo según kardex: <strong>{formatCantidad(data.cuadre.saldo_kardex)}{unidad}</strong> ·
					Stock en sistema: <strong>{formatCantidad(data.cuadre.stock_sistema)}{unidad}</strong> ·
					Diferencia:
					<strong>{data.cuadre.diferencia > 0 ? '+' : ''}{formatCantidad(data.cuadre.diferencia)}{unidad}</strong>
				</div>
				<div class="mt-1 text-xs text-amber-800">
					Puede deberse a stock cargado o modificado sin registrar su movimiento en el kardex.
					Revisa el inventario o registra un ajuste.
				</div>
			</div>
		{/if}

		<!-- Resumen del periodo -->
		<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
			{@render stat(
				filters.desde ? `Saldo al ${formatFechaCalendario(filters.desde)}` : 'Saldo inicial',
				`${formatCantidad(data.resumen.saldo_inicial)}${unidad}`,
				formatBs(data.resumen.valor_inicial),
				'text-light-black'
			)}
			{@render stat(
				'Entradas',
				`+${formatCantidad(data.resumen.total_entradas)}${unidad}`,
				formatBs(data.resumen.valor_entradas),
				'text-green-600'
			)}
			{@render stat(
				'Salidas',
				`−${formatCantidad(data.resumen.total_salidas)}${unidad}`,
				formatBs(data.resumen.valor_salidas),
				'text-red-600'
			)}
			{@render stat(
				filters.hasta ? `Saldo al ${formatFechaCalendario(filters.hasta)}` : 'Saldo final',
				`${formatCantidad(data.resumen.saldo_final)}${unidad}`,
				formatBs(data.resumen.valor_final),
				'text-light-two'
			)}
		</div>

		<!-- Tabla -->
		<div class="flex items-center justify-between">
			<p class="text-sm text-gray-500">
				{data.resumen.movimientos} movimiento{data.resumen.movimientos === 1 ? '' : 's'} en el periodo.
				Valores al costo del lote (PEPS).
			</p>
			<Button variant="ghost" size="sm" onclick={toggleOrden}>
				{filters.sortOrder === 'ASC' ? 'Más antiguos primero ▲' : 'Más recientes primero ▼'}
			</Button>
		</div>

		<div
			class="overflow-x-auto rounded-xl border border-light-four bg-light-one shadow-sm transition-opacity {isLoading
				? 'opacity-60'
				: ''}"
		>
			<table class="min-w-full divide-y divide-light-four text-sm">
				<thead class="bg-light-one_d">
					<tr>
						<th class={thClass}>Fecha</th>
						<th class={thClass}>Movimiento</th>
						<th class={thClass}>Ubicación</th>
						<th class={thClass}>Lote</th>
						<th class={thNum}>Entrada</th>
						<th class={thNum}>Salida</th>
						<th class={thNum}>Saldo</th>
						<th class={thNum}>Costo U.</th>
						<th class={thNum}>Saldo Bs</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four">
					{#if mostrarSaldoInicial}
						<tr class="bg-light-one_d/60 font-semibold text-gray-600">
							<td class="px-3 py-2" colspan="6">
								Saldo inicial al {formatFechaCalendario(filters.desde)}
							</td>
							<td class="px-3 py-2 text-right font-bold text-light-black">
								{formatCantidad(data.resumen.saldo_inicial)}
							</td>
							<td class="px-3 py-2"></td>
							<td class="px-3 py-2 text-right">{formatBs(data.resumen.valor_inicial)}</td>
						</tr>
					{/if}
					{#each data.movimientos as mov (mov.id)}
						{@const tipo = tipoInfo(mov.tipo_movimiento)}
						{@const fh = fechaHora(mov.fecha)}
						<tr
							class="cursor-pointer text-light-black transition-colors hover:bg-light-one_d"
							onclick={() => (seleccionado = mov)}
						>
							<td class="px-3 py-2 whitespace-nowrap">
								<div>{fh.fecha}</div>
								<div class="text-xs text-gray-400">{fh.hora}</div>
							</td>
							<td class="px-3 py-2">
								<span
									class="inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase {tipo.clase}"
								>
									{tipo.label}
								</span>
								<div class="mt-0.5 max-w-[220px] truncate text-xs text-gray-500" title={mov.observacion ?? ''}>
									{mov.documento ? mov.documento.numero : (mov.observacion ?? '')}
								</div>
							</td>
							<td class="max-w-[260px] px-3 py-2 text-xs text-gray-500">{ubicacionCorta(mov)}</td>
							<td class="px-3 py-2">
								<span class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-gray-500">
									{mov.lote.codigo}
								</span>
							</td>
							<td class="px-3 py-2 text-right font-semibold text-green-600">
								{mov.entrada ? `+${formatCantidad(mov.entrada)}` : ''}
							</td>
							<td class="px-3 py-2 text-right font-semibold text-red-600">
								{mov.salida ? `−${formatCantidad(mov.salida)}` : ''}
							</td>
							<td class="px-3 py-2 text-right font-bold">{formatCantidad(mov.saldo)}</td>
							<td class="px-3 py-2 text-right text-gray-500">{formatBs(mov.costo_unitario)}</td>
							<td class="px-3 py-2 text-right text-gray-600">{formatBs(mov.saldo_valorizado)}</td>
						</tr>
					{:else}
						<tr>
							<td colspan="9" class="px-3 py-10 text-center text-gray-400">
								No hay movimientos en este periodo.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if data.totalPages > 1}
			<Pagination
				currentPage={filters.page ?? 1}
				totalPages={data.totalPages}
				perPage={filters.perPage ?? 25}
				total={data.total}
				onPageChange={handlePageChange}
			/>
		{/if}
	{/if}
</MainLayout>

<KardexDetalleModal movimiento={seleccionado} onClose={() => (seleccionado = null)} />
