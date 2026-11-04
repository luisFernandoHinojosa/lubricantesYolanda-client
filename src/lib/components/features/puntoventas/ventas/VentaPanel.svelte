<script lang="ts">
	import { AlertTriangleIcon } from '$lib/icons/outline';
	import { Button } from '$lib/components/ui';
	import { TIPO_DOCUMENTO_IDENTIDAD_FACTURA } from '$lib/constants/dataFacturacion';
	import ClientePanel from './ClientePanel.svelte';
	import DescuentoPanel from './DescuentoPanel.svelte';
	import PagosPanel from './PagosPanel.svelte';
	import type { VentasState } from './ventas.svelte';

	interface Props {
		pos: VentasState;
	}

	let { pos }: Props = $props();

	let nombreCliente = $derived(
		[pos.clienteForm.nombre, pos.clienteForm.apellido_paterno].filter(Boolean).join(' ')
	);

	let tipoDocumento = $derived(
		TIPO_DOCUMENTO_IDENTIDAD_FACTURA.find((t) => t.codigoClasificador === pos.clienteForm.tipo_documento)
			?.descripcion.split(' ')[0] ?? 'CI'
	);

	let puedeConfirmar = $derived(
		pos.carrito.length > 0 &&
			pos.pagoSuficiente &&
			!pos.descuentoExcedido &&
			(!pos.facturar || pos.recargoIvaValido) &&
			(!pos.facturar || pos.clienteFacturable) &&
			!pos.procesandoVenta
	);
</script>

<aside
	class="flex w-104 shrink-0 flex-col overflow-hidden rounded-2xl border border-light-four bg-light-one print:hidden"
>
	<!-- Configuración de la venta. Scroll solo como respaldo en pantallas bajas -->
	<div class="min-h-0 flex-1 divide-y divide-light-four overflow-y-auto *:px-4 *:py-3">
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
		<section class="space-y-1.5">
			<div class="flex items-center justify-between gap-3">
				<h3 class="text-[11px] font-bold tracking-widest text-light-five uppercase">Comprobante</h3>
				<div class="grid grid-cols-2 gap-0.5 rounded-lg bg-light-one_d p-0.5">
					<button
						type="button"
						onclick={() => pos.toggleFacturacion(false)}
						class="rounded-md px-3 py-1 text-xs font-bold transition {!pos.facturar
							? 'bg-light-two text-light-one shadow-sm'
							: 'text-light-five hover:bg-light-one hover:text-light-black'}"
					>
						Recibo
					</button>
					<button
						type="button"
						onclick={() => pos.toggleFacturacion(true)}
						class="rounded-md px-3 py-1 text-xs font-bold transition {pos.facturar
							? 'bg-emerald-600 text-white shadow-sm'
							: 'text-light-five hover:bg-light-one hover:text-light-black'}"
					>
						Factura SIAT
					</button>
				</div>
			</div>
			{#if pos.facturar}
				{#if pos.clienteFacturable}
					<p class="truncate text-xs text-emerald-800">
						A nombre de <span class="font-bold">{nombreCliente || '—'}</span>
						· {tipoDocumento} <span class="font-mono">{pos.clienteForm.ci}</span>
					</p>
				{:else}
					<p class="flex items-center gap-1 text-xs font-medium text-amber-700">
						<AlertTriangleIcon class="h-3.5 w-3.5 shrink-0" />
						Asigne un cliente con CI o NIT para facturar.
					</p>
				{/if}
				<label class="flex items-center justify-between gap-3 text-xs text-light-black">
					<span>Recargo IVA</span>
					<span class="flex items-center gap-1">
						<input
							type="number"
							min="0"
							max="100"
							step="0.01"
							bind:value={pos.porcentajeRecargoIva}
							class="w-16 rounded-md border px-2 py-1 text-right font-mono text-xs {pos.recargoIvaValido
								? 'border-light-four'
								: 'border-light-error text-light-error'}"
						/>
						<span class="text-light-five">%</span>
					</span>
				</label>
				{#if !pos.recargoIvaValido}
					<p class="text-xs font-medium text-light-error">El recargo debe estar entre 0 y 100%.</p>
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

	<!-- Totales y confirmación -->
	<div class="shrink-0 space-y-3 border-t border-light-four bg-light-one_d/40 p-4">
		{#if pos.montoDescuentoGlobal() > 0 || pos.montoRecargoIva > 0}
			<dl class="space-y-0.5 text-xs">
				<div class="flex justify-between text-light-black">
					<dt>Subtotal</dt>
					<dd class="font-mono">{pos.fmt(pos.subtotalItems)}</dd>
				</div>
				{#if pos.montoDescuentoGlobal() > 0}
					<div class="flex justify-between font-semibold text-light-error">
						<dt>Descuento</dt>
						<dd class="font-mono">-{pos.fmt(pos.montoDescuentoGlobal())}</dd>
					</div>
				{/if}
				{#if pos.montoRecargoIva > 0}
					<div class="flex justify-between font-semibold text-emerald-700">
						<dt>Recargo IVA ({pos.porcentajeRecargoIva}%)</dt>
						<dd class="font-mono">+{pos.fmt(pos.montoRecargoIva)}</dd>
					</div>
				{/if}
			</dl>
		{/if}
		<div class="flex items-end justify-between">
			<span class="text-xs font-bold tracking-widest text-light-black uppercase">
				Total
				<span class="block text-[11px] font-medium tracking-normal text-light-five normal-case">
					{pos.carrito.length} producto{pos.carrito.length === 1 ? '' : 's'}
				</span>
			</span>
			<span class="font-mono text-3xl leading-none font-bold text-light-two tabular-nums">
				{pos.fmt(pos.totalFinal)}
			</span>
		</div>
		<Button
			onclick={() => pos.finalizarVenta()}
			disabled={!puedeConfirmar}
			loading={pos.procesandoVenta}
			variant="primary"
			size="lg"
			fullWidth
		>
			{pos.facturar ? 'Confirmar y facturar' : 'Confirmar venta'}
		</Button>
	</div>
</aside>
