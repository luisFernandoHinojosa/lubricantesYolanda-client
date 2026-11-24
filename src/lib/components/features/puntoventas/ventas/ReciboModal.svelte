<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import {
		CheckCircleIcon,
		PrinterIcon,
		FileDescriptionIcon,
		ArrowUpRightIcon
	} from '$lib/icons/outline';
	import { Button } from '$lib/components/ui';
	import type { VentaResponse } from '$lib/interfaces/venta.interface';

	interface Props {
		ultimaVenta: VentaResponse;
		onCerrar: () => void;
		onImprimir: () => void;
		fmt: (n: number) => string;
		fmtPrec: (n: number) => string;
		fmtDate: (d: string) => string;
		titulo?: string;
		textoBotonCerrar?: string;
	}

	let {
		ultimaVenta,
		onCerrar,
		onImprimir,
		fmt,
		fmtDate,
		fmtPrec,
		titulo = 'Venta registrada',
		textoBotonCerrar = 'Nueva venta'
	}: Props = $props();

	const CI_CLIENTE_GENERICO = '000000';

	// Solo se considera factura si SIAT la emitió; si falló, el ticket sale como nota de venta
	let facturaEmitida = $derived(ultimaVenta.factura?.estado === 'FACTURADA');
	let facturaConError = $derived(
		ultimaVenta.factura?.estado === 'ERROR' || ultimaVenta.resultado_facturacion?.success === false
	);

	let urlFacturaPdf = $derived(
		ultimaVenta.factura?.url_factura_pdf || ultimaVenta.resultado_facturacion?.urlPdf || ''
	);

	let clienteIdentificado = $derived(
		!!ultimaVenta.cliente && ultimaVenta.cliente.ci !== CI_CLIENTE_GENERICO
	);

	// El ticket imprime las líneas tal como se vendieron (aunque luego haya devoluciones),
	// así cuadran con el total cobrado
	let items = $derived(ultimaVenta.detalles ?? []);

	// Base64 del logo — se genera una sola vez al montar el componente
	let logoBase64 = $state('');

	onMount(() => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0);
			logoBase64 = canvas.toDataURL('image/png');
		};
		img.onerror = () => {
			// Si falla la imagen, logoBase64 queda vacío y no muestra nada
			logoBase64 = '';
		};
		// Agrega ?v=1 para evitar caché que bloquee el crossOrigin
		img.src = '/images/logo1.webp?v=1';
	});
</script>

{#snippet contenidoTicket()}
	<div
		style="text-align:center; border-bottom:1px dashed #666; padding-bottom:5px; margin-bottom:5px;"
	>
		<!-- Usamos logoBase64 en lugar de la ruta — así siempre imprime -->
		{#if logoBase64}
			<img
				src={logoBase64}
				alt="LUBRICANTES YOLANDA"
				style="width:230px; height:auto; margin-bottom:4px; display:block; margin-left:auto; margin-right:auto;"
			/>
		{/if}
		<p style="font-weight:900; line-height:1.3;">LUBRICANTES YOLANDA</p>
		<p style="font-size:11px;">Sucursal Central</p>
		<!-- <p style="font-size:0.85em;">
			Av. Principal internacional, al frente de Supermercado EyM y alado de Clinica Penaranda
		</p> -->
		<p style="font-size:11px;">Tel: 591-72123855</p>
		<p style="font-size:11px;">WhatsApp: 591-72123855</p>
		<p style="font-size:11px;">Horario: Lun-Vie 7:30 - 19:30 | Sab 7:30 - 17:00</p>
	</div>

	<div style="margin-bottom:5px; line-height:1.6; word-break:break-word;">
		{#if facturaEmitida && ultimaVenta.factura}
			<p style="font-weight:bold; text-align:center; font-size:12px; margin-bottom:4px;">
				FACTURA COMPRA-VENTA
			</p>
			<p><strong>N° Factura:</strong> {ultimaVenta.factura.numero_factura}</p>
		{/if}
		<p><strong>N° Comprobante:</strong> {ultimaVenta.numero_comprobante}</p>
		<p><strong>Fecha:</strong> {fmtDate(ultimaVenta.fecha)}</p>
		{#if ultimaVenta.estado === 'ANULADA'}
			<p style="font-weight:bold; text-align:center;">*** VENTA ANULADA ***</p>
		{/if}
		<p>
			<strong>Cliente:</strong>
			{#if clienteIdentificado && ultimaVenta.cliente}
				{ultimaVenta.cliente.nombre_completo}
			{:else}
				Público General
			{/if}
		</p>
		{#if clienteIdentificado && ultimaVenta.cliente}
			<p><strong>NIT/CI:</strong> {ultimaVenta.cliente.ci}</p>
		{/if}
		{#if facturaEmitida && ultimaVenta.factura}
			<p style="font-size:9px; word-break:break-all; line-height:1.2; margin-top:2px;">
				<strong>CUF:</strong>
				{ultimaVenta.factura.cuf}
			</p>
		{/if}
	</div>

	<table
		style="width:100%; border-collapse:collapse; margin-bottom:5px; border-bottom:1px dashed #666; table-layout:fixed;"
	>
		<colgroup>
			<col style="width:20%;" />
			<col style="width:38%;" />
			<col style="width:21%;" />
			<col style="width:21%;" />
		</colgroup>
		<thead>
			<tr style="border-bottom:1px dashed #666;">
				<th style="text-align:left; padding:1px 2px 3px 0; font-weight:700;">Cant/Und</th>
				<th style="text-align:left; padding:1px 2px 3px 0; font-weight:700;">Producto</th>
				<th style="text-align:right; padding:1px 2px 3px 0; font-weight:700;">P.Unit</th>
				<th style="text-align:right; padding:1px 0 3px 0; font-weight:700;">Total</th>
			</tr>
		</thead>
		<tbody>
			{#each items as det (det.id)}
				<tr>
					<td style="padding:1px 2px 1px 0; vertical-align:top; word-break:break-word;">
						{det.cantidad}
						{det.presentacion?.nombre ?? det.producto.unidad_medida?.abreviatura ?? ''}
					</td>
					<td
						style="padding:1px 2px 1px 0; vertical-align:top; word-break:break-word; overflow:hidden;"
					>
						{det.producto.nombre_comercial}
						{#if det.numero_serie}
							<div style="font-size:0.9em;">S/N: {det.numero_serie}</div>
						{/if}
						{#if (det.monto_descuento ?? 0) > 0}
							<div style="font-size:0.9em;">Desc.: -{fmt(det.monto_descuento ?? 0)}</div>
						{/if}
					</td>
					<td
						style="text-align:right; padding:1px 2px 1px 0; vertical-align:top; white-space:nowrap;"
					>
						{fmtPrec(det.precio_unitario)}
					</td>
					<td style="text-align:right; padding:1px 0; vertical-align:top; white-space:nowrap;">
						{fmt(det.subtotal)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<table style="width:100%; border-collapse:collapse; line-height:1.8;">
		<tbody>
			<tr>
				<td>Subtotal:</td>
				<td style="text-align:right; white-space:nowrap;">{fmt(ultimaVenta.subtotal)}</td>
			</tr>

			{#if ultimaVenta.monto_descuento_global > 0}
				<tr>
					<td>
						Descuento{ultimaVenta.tipo_descuento_global === 'PORCENTAJE'
							? ` (${ultimaVenta.valor_descuento_global}%)`
							: ''}:
					</td>
					<td style="text-align:right; white-space:nowrap;"
						>-{fmt(ultimaVenta.monto_descuento_global)}</td
					>
				</tr>
			{/if}

			<tr style="border-top:1px solid #666;">
				<td style="padding-top:3px;">TOTAL:</td>
				<td style="text-align:right; white-space:nowrap; padding-top:3px;"
					>{fmt(ultimaVenta.total)}</td
				>
			</tr>

			{#if ultimaVenta.pagos && ultimaVenta.pagos.length > 0}
				{#each ultimaVenta.pagos as pago, i (i)}
					<tr>
						<td>Pagado ({pago.metodo_pago}):</td>
						<td style="text-align:right; white-space:nowrap;">{fmt(pago.monto)}</td>
					</tr>
				{/each}
			{:else}
				<tr>
					<td>Total Pagado:</td>
					<td style="text-align:right; white-space:nowrap;">{fmt(ultimaVenta.monto_pagado)}</td>
				</tr>
			{/if}
			<tr>
				<td>Cambio:</td>
				<td style="text-align:right; white-space:nowrap;">{fmt(ultimaVenta.cambio_entregado)}</td>
			</tr>
		</tbody>
	</table>

	<p
		style="text-align:center; border-top:1px dashed #666; margin-top:7px; padding-top:5px; font-weight:700; font-size:11px;"
	>
		¡Gracias por su compra!
	</p>
	<p
		style="text-align:center; border-top:1px dashed #666; margin-top:7px; padding-top:5px; font-size:11px;"
	>
		Cambios y devoluciones solo con ticket
	</p>
	<p
		style="text-align:center; border-top:1px dashed #666; margin-top:7px; padding-top:5px; font-size:11px;"
	>
		No se aceptan devoluciones después de 7 días
	</p>
	<p
		style="text-align:center; border-top:1px dashed #666; margin-top:7px; padding-top:5px; font-size:11px;"
	>
		Productos en oferta no tienen cambio
	</p>
{/snippet}

<div
	class="fixed inset-0 z-50 flex items-end justify-center bg-acero-950/55 backdrop-blur-[2px] sm:items-center sm:p-4 print:hidden"
	transition:fade={{ duration: 150 }}
>
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="recibo-titulo"
		class="flex max-h-[95dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_24px_60px_-20px_rgb(23_26_31/0.5)] sm:rounded-xl"
		transition:scale={{ duration: 180, start: 0.97 }}
	>
		<div class="flex shrink-0 items-center gap-3 border-b border-acero-100 px-5 py-4">
			<span
				class="flex size-9 items-center justify-center rounded-full bg-ok-tinte text-ok"
				aria-hidden="true"
			>
				<CheckCircleIcon class="size-5" />
			</span>
			<div class="min-w-0">
				<h2 id="recibo-titulo" class="font-display text-xl font-semibold text-acero-950">
					{titulo}
				</h2>
				<p class="text-sm text-acero-500">
					Comprobante <span class="tabular-nums">{ultimaVenta.numero_comprobante}</span>
				</p>
			</div>
		</div>

		<div class="overflow-y-auto px-5 py-5">
			{#if facturaEmitida && ultimaVenta.factura}
				<div class="mb-4 rounded-lg border border-ok/25 bg-ok-tinte p-4 text-sm">
					<div class="mb-1 flex items-center justify-between gap-2">
						<span class="flex items-center gap-1.5 font-semibold text-acero-950">
							<FileDescriptionIcon class="size-4 text-ok" />
							Factura N.º {ultimaVenta.factura.numero_factura}
						</span>
						<span class="rounded-md bg-ok px-2 py-0.5 text-xs font-semibold text-white"
							>Emitida</span
						>
					</div>
					<p class="mb-3 truncate text-xs text-acero-600" title={ultimaVenta.factura.cuf}>
						CUF {ultimaVenta.factura.cuf}
					</p>
					{#if urlFacturaPdf}
						<a
							href={urlFacturaPdf}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-ok px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-ok/90"
						>
							<ArrowUpRightIcon class="size-4" />
							Abrir factura del SIAT (PDF)
						</a>
					{/if}
				</div>
			{:else if facturaConError}
				<div class="mb-4 rounded-lg border border-marca/30 bg-marca-tinte p-4 text-sm" role="alert">
					<p class="flex items-center gap-1.5 font-semibold text-marca-oscuro">
						<FileDescriptionIcon class="size-4" />
						La factura no se emitió
					</p>
					{#if ultimaVenta.factura?.error || ultimaVenta.resultado_facturacion?.error}
						<p class="mt-1 text-acero-800">
							{ultimaVenta.factura?.error || ultimaVenta.resultado_facturacion?.error}
						</p>
					{/if}
					<p class="mt-1 text-acero-600">
						La venta quedó registrada. Puede volver a facturarla desde Historial de ventas.
					</p>
				</div>
			{/if}

			<div
				class="rounded-lg border border-dashed border-acero-300 bg-acero-50 px-4 py-4 font-mono text-[12px] leading-snug text-acero-900"
			>
				{@render contenidoTicket()}
			</div>
		</div>

		<div class="flex shrink-0 gap-2 border-t border-acero-100 bg-acero-50 px-5 py-3.5">
			<Button onclick={onImprimir} variant="secondary" fullWidth>
				{#snippet leftIcon()}
					<PrinterIcon class="size-5" />
				{/snippet}
				Imprimir ticket
			</Button>
			<!-- svelte-ignore a11y_autofocus -->
			<Button onclick={onCerrar} variant="primary" fullWidth autofocus>{textoBotonCerrar}</Button>
		</div>
	</div>
</div>

<div class="zona-de-impresion hidden font-mono print:block">
	{@render contenidoTicket()}
</div>

<style>
	@media print {
		:global(body *) {
			visibility: hidden !important;
		}

		.zona-de-impresion,
		:global(.zona-de-impresion *) {
			visibility: visible !important;
		}

		:global(.zona-de-impresion img) {
			visibility: visible !important;
			display: block !important;
			width: 230px !important;
			height: auto !important;
			margin: 0 auto 4px auto !important;
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}

		.zona-de-impresion {
			position: fixed !important;
			top: 0 !important;
			left: 0 !important;
			right: 0 !important;
			width: 100% !important;
			margin: 0 !important;
			padding: 8mm 10mm !important;
			box-sizing: border-box !important;
			font-size: 11px !important;
			background-color: white !important;
			z-index: 999999 !important;
		}

		@page {
			margin: 0;
			size: 80mm auto;
		}

		:global(body) {
			background-color: white !important;
			margin: 0 !important;
			padding: 0 !important;
		}

		:global(.zona-de-impresion *) {
			color: black !important;
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}
	}
</style>
