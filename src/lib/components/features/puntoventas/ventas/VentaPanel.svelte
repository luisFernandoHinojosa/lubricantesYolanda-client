<script lang="ts">
	import { AlertTriangleIcon } from '$lib/icons/outline';
	import { Button } from '$lib/components/ui';
	import { TIPO_DOCUMENTO_IDENTIDAD_FACTURA } from '$lib/constants/dataFacturacion';
	import ClientePanel from './ClientePanel.svelte';
	import DescuentoPanel from './DescuentoPanel.svelte';
	import PagosPanel from './PagosPanel.svelte';
	import type { VentasState } from './ventas.svelte';
	import { PISTA, SEGMENTO, SEGMENTO_ACTIVO, SEGMENTO_INACTIVO, TITULO_SECCION } from './segmentos';

	interface Props {
		pos: VentasState;
	}

	let { pos }: Props = $props();

	let nombreCliente = $derived(
		[pos.clienteForm.nombre, pos.clienteForm.apellido_paterno].filter(Boolean).join(' ')
	);

	let tipoDocumento = $derived(
		TIPO_DOCUMENTO_IDENTIDAD_FACTURA.find(
			(t) => t.codigoClasificador === pos.clienteForm.tipo_documento
		)?.descripcion.split(' ')[0] ?? 'CI'
	);

	let puedeConfirmar = $derived(
		pos.carrito.length > 0 &&
			pos.pagoSuficiente &&
			!pos.descuentoExcedido &&
			(!pos.facturar || pos.recargoIvaValido) &&
			(!pos.facturar || pos.clienteFacturable) &&
			!pos.procesandoVenta
	);

	// Qué falta para poder cobrar: se muestra bajo el botón en lugar de dejarlo deshabilitado sin explicación
	let motivoBloqueo = $derived.by(() => {
		if (pos.procesandoVenta) return '';
		if (pos.carrito.length === 0) return 'Agregue al menos un producto.';
		if (pos.descuentoExcedido) return 'El descuento supera el subtotal.';
		if (pos.facturar && !pos.clienteFacturable)
			return 'Para facturar, asigne un cliente con CI o NIT.';
		if (pos.facturar && !pos.recargoIvaValido) return 'El recargo IVA debe estar entre 0 y 100 %.';
		if (!pos.pagoSuficiente)
			return `Falta cobrar ${pos.fmt(Math.max(0, pos.totalFinal - pos.totalPagado))}.`;
		return '';
	});

	const numero = new Intl.NumberFormat('es-BO', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
	const cantidadProductos = $derived(pos.carrito.reduce((acc, i) => acc + (i.cantidad || 0), 0));
	const descuento = $derived(pos.montoDescuentoGlobal());
</script>

<aside
	class="flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-acero-200 bg-white lg:w-84 2xl:w-100 print:hidden"
	aria-label="Cobro de la venta"
>
	<!-- Configuración de la venta. Scroll solo como respaldo en pantallas bajas -->
	<div class="min-h-0 flex-1 divide-y divide-acero-100 overflow-y-auto *:px-4 *:py-3.5">
		<ClientePanel
			clienteActivo={pos.clienteActivo}
			bind:clienteForm={pos.clienteForm}
			clienteSeleccionado={pos.clienteSeleccionado}
			clienteEncontrado={pos.clienteEncontrado}
			buscandoCi={pos.buscandoCi}
			onBuscarCi={(ci) => pos.buscarClientePorCi(ci)}
			onSeleccionarPublicoGeneral={() => pos.seleccionarClientePublicoGeneral()}
			onNuevaBusqueda={() => pos.nuevaBusquedaCliente()}
			onRegistrarNuevo={(datos) => pos.registrarClienteNuevo(datos)}
		/>

		<!-- Comprobante -->
		<section class="space-y-2" aria-labelledby="pos-comprobante">
			<div class="flex items-center justify-between gap-3">
				<h3 id="pos-comprobante" class={TITULO_SECCION}>Comprobante</h3>
				<div class="{PISTA} grid-cols-2" role="radiogroup" aria-labelledby="pos-comprobante">
					<button
						type="button"
						role="radio"
						aria-checked={!pos.facturar}
						onclick={() => pos.toggleFacturacion(false)}
						class="{SEGMENTO} {!pos.facturar ? SEGMENTO_ACTIVO : SEGMENTO_INACTIVO}"
					>
						Recibo
					</button>
					<button
						type="button"
						role="radio"
						aria-checked={pos.facturar}
						onclick={() => pos.toggleFacturacion(true)}
						class="{SEGMENTO} {pos.facturar ? SEGMENTO_ACTIVO : SEGMENTO_INACTIVO}"
					>
						Factura
					</button>
				</div>
			</div>
			{#if pos.facturar}
				{#if pos.clienteFacturable}
					<p class="truncate text-sm text-acero-600">
						A nombre de <span class="font-semibold text-acero-950">{nombreCliente || '—'}</span>,
						{tipoDocumento} <span class="tabular-nums">{pos.clienteForm.ci}</span>
					</p>
				{:else}
					<p class="flex items-start gap-1.5 text-sm text-aceite-oscuro">
						<AlertTriangleIcon class="mt-0.5 size-4 shrink-0" />
						Asigne un cliente con CI o NIT para emitir la factura.
					</p>
				{/if}
				<label class="flex items-center justify-between gap-3 text-sm text-acero-700">
					<span>Recargo IVA</span>
					<span class="flex items-center gap-1.5">
						<input
							type="number"
							min="0"
							max="100"
							step="0.01"
							bind:value={pos.porcentajeRecargoIva}
							aria-invalid={!pos.recargoIvaValido ? 'true' : undefined}
							class="h-8 w-20 rounded-md border px-2 text-right text-sm tabular-nums outline-none focus:ring-[3px] focus:ring-acero-200 {pos.recargoIvaValido
								? 'border-acero-200'
								: 'border-marca text-marca'}"
						/>
						<span class="text-acero-500">%</span>
					</span>
				</label>
				{#if !pos.recargoIvaValido}
					<p class="text-sm text-marca">El recargo debe estar entre 0 y 100 %.</p>
				{/if}
			{/if}
		</section>

		<DescuentoPanel
			bind:descuentoGlobal={pos.descuentoGlobal}
			descuentoExcedido={pos.descuentoExcedido}
		/>

		<PagosPanel
			bind:pagos={pos.pagos}
			bind:notasVenta={pos.notasVenta}
			totalFinal={pos.totalFinal}
			totalPagado={pos.totalPagado}
			cambio={pos.cambio}
			onAgregarPago={() => pos.agregarPago()}
			onRemoverPago={(i) => pos.removerPago(i)}
			onMontoManual={() => pos.marcarPagoManual()}
			fmt={pos.fmt}
		/>
	</div>

	<!-- Visor de total y confirmación -->
	<div class="shrink-0 space-y-3 border-t border-acero-200 p-3">
		<div class="rounded-lg bg-acero-900 px-4 pt-3 pb-3.5 text-acero-300" aria-live="polite">
			{#if descuento > 0 || pos.montoRecargoIva > 0}
				<dl class="mb-2 space-y-0.5 border-b border-acero-700 pb-2 text-sm">
					<div class="flex justify-between">
						<dt>Subtotal</dt>
						<dd class="tabular-nums">{pos.fmt(pos.subtotalItems)}</dd>
					</div>
					{#if descuento > 0}
						<div class="flex justify-between text-[#ff9a9a]">
							<dt>Descuento</dt>
							<dd class="tabular-nums">−{pos.fmt(descuento)}</dd>
						</div>
					{/if}
					{#if pos.montoRecargoIva > 0}
						<div class="flex justify-between">
							<dt>Recargo IVA ({pos.porcentajeRecargoIva} %)</dt>
							<dd class="tabular-nums">+{pos.fmt(pos.montoRecargoIva)}</dd>
						</div>
					{/if}
				</dl>
			{/if}
			<div class="flex items-baseline justify-between gap-3">
				<span class="text-sm">
					Total
					<span class="block text-xs text-acero-400 tabular-nums">
						{pos.carrito.length}
						{pos.carrito.length === 1
							? 'producto'
							: 'productos'}{#if cantidadProductos !== pos.carrito.length},
							{numero.format(cantidadProductos).replace(/,00$/, '')} unid.{/if}
					</span>
				</span>
				<span class="flex items-baseline gap-1.5 text-white" data-testid="pos-total">
					<span class="font-display text-xl font-medium text-acero-400">Bs</span>
					<span
						class="font-display text-4xl leading-none font-semibold tracking-tight tabular-nums"
					>
						{numero.format(pos.totalFinal)}
					</span>
				</span>
			</div>
			{#if pos.totalFinal > 0 && pos.cambio > 0}
				<div class="mt-2.5 flex items-baseline justify-between border-t border-acero-700 pt-2">
					<span class="text-sm">Cambio a entregar</span>
					<span
						class="font-display text-2xl font-semibold text-aceite tabular-nums"
						data-testid="pos-cambio"
					>
						{pos.fmt(pos.cambio)}
					</span>
				</div>
			{/if}
		</div>

		<Button
			onclick={() => pos.finalizarVenta()}
			disabled={!puedeConfirmar}
			loading={pos.procesandoVenta}
			variant="primary"
			size="lg"
			fullWidth
			aria-describedby={motivoBloqueo ? 'pos-motivo' : undefined}
			aria-keyshortcuts="F2"
		>
			{pos.facturar ? 'Cobrar y facturar' : 'Cobrar venta'}
			<kbd
				class="ml-1 rounded border border-white/30 px-1.5 py-px font-sans text-xs font-semibold text-white/80"
				aria-hidden="true">F2</kbd
			>
		</Button>
		{#if motivoBloqueo}
			<p id="pos-motivo" class="text-center text-sm text-acero-500">{motivoBloqueo}</p>
		{/if}
	</div>
</aside>
