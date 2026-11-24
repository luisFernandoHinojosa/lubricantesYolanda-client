<script lang="ts">
	import { Modal, Button } from '$lib/components/ui';
	import type { KardexMovimiento, UbicacionKardex } from '$lib/interfaces/kardexMovimiento.interface';
	import {
		tipoInfo,
		colorNaturaleza,
		cantidadConSigno,
		formatBs,
		fechaHora,
		formatFechaCalendario,
		diasParaVencer
	} from './kardex.utils';

	interface Props {
		movimiento: KardexMovimiento | null;
		onClose: () => void;
		/** Si se pasa, muestra el botón "Ver kardex del producto" */
		onVerTarjeta?: (idProducto: string) => void;
	}

	let { movimiento, onClose, onVerTarjeta }: Props = $props();

	const fh = $derived(movimiento ? fechaHora(movimiento.fecha) : null);
	const dias = $derived(diasParaVencer(movimiento?.lote.fecha_vencimiento));
</script>

{#snippet campo(label: string, valor: string | null | undefined)}
	<div>
		<dt class="text-xs font-semibold tracking-wide text-light-two uppercase">{label}</dt>
		<dd class="mt-0.5 text-sm font-medium text-light-black">{valor || '—'}</dd>
	</div>
{/snippet}

{#snippet ubicacion(label: string, u: UbicacionKardex | null)}
	<div class="flex-1 rounded-xl border border-light-four p-3">
		<div class="text-xs font-semibold tracking-wide text-light-two uppercase">{label}</div>
		{#if u}
			<div class="mt-1 text-sm font-bold text-light-black">{u.nombre}</div>
			<div class="text-xs text-gray-500">
				{u.sucursal?.nombre ?? 'Sin sucursal'}{u.tipo_area ? ` · ${u.tipo_area}` : ''}
			</div>
			{#if u.ubicacion_fisica}
				<div class="mt-1 text-xs text-gray-500">📍 {u.ubicacion_fisica.nombre}</div>
			{/if}
		{:else}
			<div class="mt-1 text-sm text-gray-400">
				{label === 'Origen' ? 'Externo (compra / devolución)' : 'Externo (cliente / baja)'}
			</div>
		{/if}
	</div>
{/snippet}

<Modal isOpen={!!movimiento} title="Detalle del movimiento" {onClose} maxWidth="sm:max-w-2xl">
	{#if movimiento && fh}
		{@const tipo = tipoInfo(movimiento.tipo_movimiento)}
		<div class="space-y-5">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<span
						class="inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase {tipo.clase}"
					>
						{tipo.label}
					</span>
					<span class="text-sm text-gray-500">{fh.fecha} · {fh.hora}</span>
				</div>
				<div class="text-2xl font-black {colorNaturaleza(movimiento.naturaleza)}">
					{cantidadConSigno(movimiento)}
				</div>
			</div>

			<div class="rounded-xl bg-light-one_d p-4">
				<div class="text-base font-bold text-light-black">{movimiento.producto.nombre}</div>
				<div class="mt-0.5 text-xs text-gray-500">
					{[movimiento.producto.marca, movimiento.producto.categoria, movimiento.producto.sku]
						.filter(Boolean)
						.join(' · ')}
				</div>
			</div>

			<dl class="grid grid-cols-2 gap-4 sm:grid-cols-3">
				{@render campo('Lote', movimiento.lote.codigo)}
				<div>
					<dt class="text-xs font-semibold tracking-wide text-light-two uppercase">Vencimiento</dt>
					<dd class="mt-0.5 text-sm font-medium text-light-black">
						{formatFechaCalendario(movimiento.lote.fecha_vencimiento)}
						{#if dias !== null && dias < 0}
							<span class="ml-1 text-xs font-bold text-red-600">Vencido</span>
						{:else if dias !== null && dias <= 30}
							<span class="ml-1 text-xs font-bold text-amber-600">Vence en {dias} d</span>
						{/if}
					</dd>
				</div>
				{@render campo('Proveedor', movimiento.lote.proveedor?.nombre)}
				{@render campo('Costo unitario', formatBs(movimiento.costo_unitario))}
				{@render campo('Valor del movimiento', formatBs(movimiento.valor_total))}
				{@render campo(
					'Documento',
					movimiento.documento ? `${movimiento.documento.tipo} ${movimiento.documento.numero}` : null
				)}
				{@render campo('Responsable', movimiento.usuario?.nombre ?? 'Sistema')}
			</dl>

			<div class="flex flex-col gap-3 sm:flex-row sm:items-stretch">
				{@render ubicacion('Origen', movimiento.origen)}
				<div class="hidden items-center text-xl text-gray-400 sm:flex">→</div>
				{@render ubicacion('Destino', movimiento.destino)}
			</div>

			{#if movimiento.observacion}
				<div>
					<div class="text-xs font-semibold tracking-wide text-light-two uppercase">Observación</div>
					<p class="mt-1 rounded-xl border border-light-four p-3 text-sm text-light-black">
						{movimiento.observacion}
					</p>
				</div>
			{/if}
		</div>
	{/if}

	{#snippet footer()}
		<div class="flex justify-end gap-2">
			{#if onVerTarjeta && movimiento}
				<Button variant="primary" size="sm" onclick={() => onVerTarjeta(movimiento.producto.id)}>
					Ver kardex del producto
				</Button>
			{/if}
			<Button variant="ghost" size="sm" onclick={onClose}>Cerrar</Button>
		</div>
	{/snippet}
</Modal>
