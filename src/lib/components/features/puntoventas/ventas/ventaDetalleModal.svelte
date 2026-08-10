<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { XIcon } from '$lib/icons/outline';
	import type { VentaResponse } from '$lib/interfaces/venta.interface';

	interface Props {
		isOpen: boolean;
		venta: VentaResponse | null;
		onClose: () => void;
	}

	let { isOpen, venta, onClose }: Props = $props();

	function formatCurrency(amount: string | number) {
		return new Intl.NumberFormat('es-BO', {
			style: 'currency',
			currency: 'BOB'
		}).format(Number(amount));
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString('es-BO');
	}
</script>

{#if isOpen && venta}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 text-sm sm:p-6">
		<button
			class="absolute inset-0 cursor-default bg-light-three/80 backdrop-blur-sm"
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 150 }}
			onclick={onClose}
			aria-label="Cerrar modal"
		></button>

		<div
			class="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl"
			in:slide={{ duration: 300, axis: 'y' }}
			out:slide={{ duration: 200, axis: 'y' }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-light-black/10 px-6 py-4">
				<div>
					<h2 class="text-xl font-bold text-light-black">
						Detalle de Venta <span class="ml-2 text-[#B91C1C]">{venta.numero_comprobante}</span>
					</h2>
					<p class="mt-1 text-xs font-medium text-light-black/60">{formatDate(venta.createdAt)}</p>
				</div>
				<button
					class="rounded-full p-2 text-light-black/50 transition-colors hover:bg-light-black/5"
					onclick={onClose}
				>
					<XIcon class="h-6 w-6" />
				</button>
			</div>

			<!-- Body -->
			<div class="flex-1 scrollbar-thin overflow-y-auto p-6">
				<!-- Info grid -->
				<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div class="rounded-xl border border-light-black/10 bg-slate-50 p-4">
						<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase">
							Cliente
						</p>
						<p class="mt-1 font-medium text-light-black">
							{venta.cliente?.nombre || 'Cliente'}
							{venta.cliente?.apellido_paterno || ''}
						</p>
						<p class="mt-1 text-xs text-light-black/60">
							CI/NIT: <span class="font-mono">{venta.cliente?.ci || 'S/N'}</span>
						</p>
						<div class="mt-3 border-t border-black/5 pt-2">
							<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase">
								Cajero
							</p>
							<p class="font-medium text-light-black text-sm">
								{venta.cajero?.nombre || ''} {venta.cajero?.apellido_paterno || ''}
							</p>
						</div>
					</div>

					<div class="rounded-xl border border-light-black/10 bg-green-50 p-4">
						<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase">Total Venta</p>
						<p class="mt-1 text-2xl font-black text-green-700">{formatCurrency(venta.total)}</p>
						<div class="mt-3 space-y-1 border-t border-black/5 pt-2">
							<p class="text-xs text-light-black/60 flex justify-between">
								<span>Subtotal:</span> <span class="font-medium">{formatCurrency(venta.subtotal)}</span>
							</p>
							{#if Number(venta.monto_descuento_global) > 0}
								<p class="text-xs text-red-600/80 flex justify-between">
									<span>Descuento:</span> <span class="font-medium">-{formatCurrency(venta.monto_descuento_global)}</span>
								</p>
							{/if}
						</div>
					</div>

					<div class="rounded-xl border border-light-black/10 bg-blue-50 p-4">
						<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase">
							Pago: {venta.metodo_pago}
						</p>
						<p class="mt-1 font-black text-blue-700 text-2xl">{formatCurrency(venta.monto_pagado)}</p>
						<div class="mt-3 space-y-1 border-t border-black/5 pt-2">
							<p class="text-xs text-light-black/60 flex justify-between">
								<span>Cambio Entregado:</span> <span class="font-medium">{formatCurrency(venta.cambio_entregado)}</span>
							</p>
						</div>
					</div>

					<div class="rounded-xl border border-light-black/10 bg-orange-50 p-4">
						<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase">
							Devoluciones / Cambios
						</p>
						<p class="mt-1 font-black text-orange-700 text-2xl">
							{formatCurrency(venta.monto_devuelto || 0)}
						</p>
						<div class="mt-3 space-y-1 border-t border-black/5 pt-2">
							<p class="text-xs text-light-black/60 flex justify-between">
								<span>Dif. a favor:</span> <span class="font-medium">{formatCurrency(venta.diferencia_cambio || 0)}</span>
							</p>
						</div>
					</div>
				</div>

				<!-- Table -->
				<div class="overflow-hidden rounded-xl border border-light-black/10 shadow-sm">
					<table class="w-full text-left">
						<thead class="bg-light-black/5 text-xs tracking-wider text-light-black/70 uppercase">
							<tr>
								<th class="px-5 py-4 font-bold">Producto</th>
								<th class="px-5 py-4 text-center font-bold">Tipo</th>
								<th class="px-5 py-4 text-center font-bold">Unidad / Present.</th>
								<th class="px-5 py-4 text-center font-bold">Cant.</th>
								<th class="px-5 py-4 text-right font-bold">Precio Unit.</th>
								<th class="px-5 py-4 text-right font-bold">Subtotal</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-black/5 bg-white">
							{#each venta.detalles as item, index (index)}
								<tr class="transition-colors hover:bg-light-black/5">
									<td class="px-5 py-4">
										<p class="font-bold text-light-black">{item.producto.nombre_comercial}</p>
										<div class="mt-1.5 flex flex-wrap gap-2 text-xs text-light-black/60">
											<span class="rounded-md bg-light-black/5 px-2 py-0.5 font-mono">
												CB: {item.producto.codigo_barras || '--'}
											</span>
											{#if item.numero_serie}
												<span class="rounded-md bg-[#D19999]/20 px-2 py-0.5 font-mono text-[#8B1515]">
													NS: {item.numero_serie}
												</span>
											{/if}
										</div>
										{#if item.notas}
											<p class="mt-2 text-xs font-medium text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
												{item.notas}
											</p>
										{/if}
										{#if item.referencia_comprobante}
											<p class="mt-1 text-xs text-light-black/50 font-mono">
												Ref: {item.referencia_comprobante}
											</p>
										{/if}
									</td>
									<td class="px-5 py-4 text-center">
										{#if item.movimiento === 'VENTA'}
											<span class="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">VENTA</span>
										{:else if item.movimiento === 'DEVOLUCION'}
											<span class="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">DEVOLUCIÓN</span>
										{:else if item.movimiento === 'CAMBIO'}
											<span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">CAMBIO</span>
										{:else}
											<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">{item.movimiento || 'VENTA'}</span>
										{/if}
									</td>
									<td class="px-5 py-4 text-center">
										{#if item.presentacion}
											<span
												class="rounded-full bg-light-black/10 px-3 py-1 text-xs font-semibold text-light-black/80"
											>
												{item.presentacion.nombre} (x{item.presentacion.factor_conversion})
											</span>
										{:else}
											<span class="text-xs font-medium text-light-black/50 italic"
												>{item.producto.unidad_medida?.nombre || ''} ({item.producto.unidad_medida?.abreviatura || ''})</span
											>
										{/if}
									</td>
									<td class="px-5 py-4 text-center text-lg font-bold">{Number(item.cantidad)}</td>
									<td class="px-5 py-4 text-right font-medium text-light-black/70"
										>{formatCurrency(item.precio_unitario)}</td
									>
									<td class="px-5 py-4 text-right text-base font-bold" class:text-[#B91C1C]={Number(item.subtotal) < 0} class:text-light-black={Number(item.subtotal) >= 0}>
										{formatCurrency(item.subtotal)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Footer -->
			<div
				class="flex justify-end rounded-b-2xl border-t border-light-black/10 bg-light-black/5 px-6 py-4"
			>
				<button
					class="rounded-lg border border-light-black/20 bg-white px-6 py-2.5 font-bold text-light-black shadow-sm transition-colors hover:bg-light-black/5"
					onclick={onClose}
				>
					Cerrar Detalles
				</button>
			</div>
		</div>
	</div>
{/if}
