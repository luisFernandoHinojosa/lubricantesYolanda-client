<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { CheckCircleIcon, PrinterIcon } from '$lib/icons/outline';
	import { Button } from '$lib/components/ui';
	import type { VentaResponse } from '$lib/interfaces/venta.interface';

	interface Props {
		ultimaVenta: VentaResponse;
		onCerrar: () => void;
		onImprimir: () => void;
		fmt: (n: number) => string;
		fmtPrec: (n: number) => string;
		fmtDate: (d: string) => string;
	}

	let { ultimaVenta, onCerrar, onImprimir, fmt, fmtDate, fmtPrec }: Props = $props();

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
		img.src = '/images/logofake.png?v=1';
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
		<p style="font-size:0.85em;">Sucursal Central</p>
		<!-- <p style="font-size:0.85em;">
			Av. Principal internacional, al frente de Supermercado EyM y alado de Clinica Penaranda
		</p> -->
		<p style="font-size:0.85em;">Tel: 591-72123855</p>
		<p style="font-size:0.85em;">WhatsApp: 591-72123855</p>
		<p style="font-size:0.85em;">Horario: Lun-Vie 7:30 - 19:30 | Sab 7:30 - 17:00</p>
	</div>

	<div style="margin-bottom:5px; line-height:1.6; word-break:break-word;">
		<p><strong>N°:</strong> {ultimaVenta.numero_comprobante}</p>
		<p><strong>Fecha:</strong> {fmtDate(ultimaVenta.createdAt)}</p>
		<p>
			<strong>Cliente:</strong>
			{ultimaVenta.cliente.nombre}
			{ultimaVenta.cliente.apellido_paterno}
		</p>
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
			{#each ultimaVenta.detalles as det, index (index)}
				<tr>
					<td style="padding:1px 2px 1px 0; vertical-align:top; word-break:break-word;">
						{det.cantidad}
						{det.producto.unidad_medida.abreviatura}
					</td>
					<td
						style="padding:1px 2px 1px 0; vertical-align:top; word-break:break-word; overflow:hidden;"
					>
						{det.producto.nombre_comercial}
					</td>
					<td
						style="text-align:right; padding:1px 2px 1px 0; vertical-align:top; white-space:nowrap;"
					>
						{fmtPrec(parseFloat(det.precio_unitario))}
					</td>
					<td style="text-align:right; padding:1px 0; vertical-align:top; white-space:nowrap;">
						{fmt(parseFloat(det.subtotal))}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<table style="width:100%; border-collapse:collapse; line-height:1.8;">
		<tbody>
			<tr>
				<td>Subtotal:</td>
				<td style="text-align:right; white-space:nowrap;"
					>{fmt(parseFloat(ultimaVenta.subtotal))}</td
				>
			</tr>

			{#if parseFloat(ultimaVenta.monto_descuento_global) > 0}
				<tr>
					<td>Descuento:</td>
					<td style="text-align:right; white-space:nowrap;"
						>-{fmt(parseFloat(ultimaVenta.monto_descuento_global))}</td
					>
				</tr>
			{/if}

			<tr style="font-weight:900; font-size:1.1em; border-top:1px solid #666;">
				<td style="padding-top:3px;">TOTAL:</td>
				<td style="text-align:right; white-space:nowrap; padding-top:3px;"
					>{fmt(parseFloat(ultimaVenta.total))}</td
				>
			</tr>

			<tr>
				<td>Pagado ({ultimaVenta.metodo_pago}):</td>
				<td style="text-align:right; white-space:nowrap;"
					>{fmt(parseFloat(ultimaVenta.monto_pagado))}</td
				>
			</tr>
			<tr>
				<td>Cambio:</td>
				<td style="text-align:right; white-space:nowrap;"
					>{fmt(parseFloat(ultimaVenta.cambio_entregado))}</td
				>
			</tr>
		</tbody>
	</table>

	<p
		style="text-align:center; border-top:1px dashed #666; margin-top:7px; padding-top:5px; font-weight:700;"
	>
		¡Gracias por su compra!
	</p>
	<p
		style="text-align:center; border-top:1px dashed #666; margin-top:7px; padding-top:5px; font-size:0.8em;"
	>
		Cambios y devoluciones solo con ticket
	</p>
	<p
		style="text-align:center; border-top:1px dashed #666; margin-top:7px; padding-top:5px; font-size:0.8em;"
	>
		No se aceptan devoluciones después de 7 días
	</p>
	<p
		style="text-align:center; border-top:1px dashed #666; margin-top:7px; padding-top:5px; font-size:0.8em;"
	>
		Productos en oferta no tienen cambio
	</p>
{/snippet}

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md print:hidden"
	transition:fade
>
	<div
		class="w-full max-w-sm overflow-hidden rounded-3xl bg-light-one shadow-2xl"
		transition:scale={{ duration: 200 }}
	>
		<div
			class="flex items-center justify-between border-b border-light-four bg-light-one_d px-6 py-4"
		>
			<div class="flex items-center gap-2.5">
				<div class="flex h-8 w-8 items-center justify-center rounded-full">
					<CheckCircleIcon class="h-6 w-6 text-light-success" />
				</div>
				<h3 class="font-bold text-light-black">Venta registrada</h3>
			</div>
		</div>

		<div class="p-6 font-mono">
			{@render contenidoTicket()}

			<div class="mt-6 flex gap-3">
				<Button onclick={onImprimir} variant="secondary" fullWidth>
					{#snippet leftIcon()}
						<PrinterIcon class="h-5 w-5" />
					{/snippet}
					Imprimir
				</Button>
				<Button onclick={onCerrar} variant="primary" fullWidth>Nueva venta</Button>
			</div>
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
			padding: 2mm 2mm !important;
			box-sizing: border-box !important;
			font-size: 10px !important;
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
