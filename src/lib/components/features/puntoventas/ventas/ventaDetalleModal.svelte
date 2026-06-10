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
			<div class="scrollbar-thin flex-1 overflow-y-auto p-6">
				<!-- Info grid -->
				<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div class="rounded-xl border border-light-black/10 bg-[#D19999]/10 p-4">
						<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase">
							Cliente
						</p>
						<p class="mt-1 font-medium text-light-black">
							{venta.cliente.nombre}
							{venta.cliente.apellido_paterno}
						</p>
						<p class="mt-1 text-xs text-light-black/60">
							CI/NIT: <span class="font-mono">{venta.cliente.ci}</span>
						</p>
					</div>

					<div class="rounded-xl border border-light-black/10 bg-[#D19999]/10 p-4">
						<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase">Total</p>
						<p class="mt-1 text-xl font-bold text-green-700">{formatCurrency(venta.total)}</p>
						<p class="mt-1 text-xs text-light-black/60">
							Subtotal: {formatCurrency(venta.subtotal)}
						</p>
					</div>

					<div class="rounded-xl border border-light-black/10 bg-[#D19999]/10 p-4">
						<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase">
							Método Pago
						</p>
						<p class="mt-1 font-medium text-light-black">{venta.metodo_pago}</p>
						<p class="mt-1 text-xs text-light-black/60">
							Pagado: {formatCurrency(venta.monto_pagado)}
						</p>
					</div>

					<div class="rounded-xl border border-light-black/10 bg-[#D19999]/10 p-4">
						<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase">
							Descuento Global
						</p>
						<p class="mt-1 font-medium text-[#B91C1C]">
							-{formatCurrency(venta.monto_descuento_global)}
						</p>
						<p class="mt-1 text-xs text-light-black/60">
							Cambio devuelto: {formatCurrency(venta.cambio_entregado)}
						</p>
					</div>
				</div>

				<!-- Table -->
				<div class="overflow-hidden rounded-xl border border-light-black/10 shadow-sm">
					<table class="w-full text-left">
						<thead class="bg-light-black/5 text-xs tracking-wider text-light-black/70 uppercase">
							<tr>
								<th class="px-5 py-4 font-bold">Producto</th>
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
										<div class="mt-1.5 flex gap-2 text-xs text-light-black/60">
											<span class="rounded-md bg-light-black/5 px-2 py-0.5 font-mono">
												CB: {item.producto.codigo_barras || '--'}
											</span>
											{#if item.numero_serie}
												<span
													class="rounded-md bg-[#D19999]/20 px-2 py-0.5 font-mono text-[#8B1515]"
												>
													NS: {item.numero_serie}
												</span>
											{/if}
										</div>
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
												>{item.producto.unidad_medida.nombre} ({item.producto.unidad_medida
													.abreviatura})</span
											>
										{/if}
									</td>
									<td class="px-5 py-4 text-center text-lg font-bold">{Number(item.cantidad)}</td>
									<td class="px-5 py-4 text-right font-medium text-light-black/70"
										>{formatCurrency(item.precio_unitario)}</td
									>
									<td class="px-5 py-4 text-right text-base font-bold text-light-black"
										>{formatCurrency(item.subtotal)}</td
									>
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
