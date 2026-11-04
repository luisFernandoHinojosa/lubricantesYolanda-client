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

	const CI_CLIENTE_GENERICO = '000000';

	// Los ítems de una devolución apuntan a su línea de venta (id_detalle_venta)
	let detallesPorId = $derived(new Map((venta?.detalles ?? []).map((d) => [d.id, d])));

	function unidadDe(item: { presentacion: { nombre: string } | null; producto: { unidad_medida: { abreviatura: string } | null } }) {
		return item.presentacion?.nombre ?? item.producto.unidad_medida?.abreviatura ?? '';
	}

	const FACTURA_ESTILO: Record<string, { texto: string; caja: string; badge: string }> = {
		FACTURADA: {
			texto: 'Facturada',
			caja: 'border-emerald-200 bg-emerald-50',
			badge: 'bg-emerald-600 text-white'
		},
		ERROR: { texto: 'Error', caja: 'border-red-200 bg-red-50', badge: 'bg-red-600 text-white' },
		PENDIENTE: {
			texto: 'Pendiente',
			caja: 'border-amber-200 bg-amber-50',
			badge: 'bg-amber-500 text-white'
		}
	};
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
						{#if venta.estado === 'ANULADA'}
							<span class="ml-2 rounded-full bg-red-100 px-2.5 py-0.5 align-middle text-xs font-bold text-red-700">
								ANULADA
							</span>
						{/if}
					</h2>
					<p class="mt-1 text-xs font-medium text-light-black/60">{formatDate(venta.fecha)}</p>
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
						{#if venta.cliente && venta.cliente.ci !== CI_CLIENTE_GENERICO}
							<p class="mt-1 font-medium text-light-black">{venta.cliente.nombre_completo}</p>
							<p class="mt-1 text-xs text-light-black/60">
								CI/NIT: <span class="font-mono">{venta.cliente.ci}</span>
							</p>
							{#if venta.cliente.telefono}
								<p class="text-xs text-light-black/60">
									Tel: <span class="font-mono">{venta.cliente.telefono}</span>
								</p>
							{/if}
						{:else}
							<p class="mt-1 font-medium text-light-black italic">Público General</p>
						{/if}
						<div class="mt-3 border-t border-black/5 pt-2">
							<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase">
								Cajero
							</p>
							<p class="font-medium text-light-black text-sm">
								{venta.cajero?.nombre_completo || 'Desconocido'}
							</p>
						</div>
					</div>

					<div class="rounded-xl border border-light-black/10 bg-green-50 p-4">
						<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase">Total Cobrado</p>
						<p class="mt-1 text-2xl font-black text-green-700">{formatCurrency(venta.total)}</p>
						<div class="mt-3 space-y-1 border-t border-black/5 pt-2">
							<p class="text-xs text-light-black/60 flex justify-between">
								<span>Subtotal:</span> <span class="font-medium">{formatCurrency(venta.subtotal)}</span>
							</p>
							{#if venta.monto_descuento_global > 0}
								<p class="text-xs text-red-600/80 flex justify-between">
									<span>
										Descuento{venta.tipo_descuento_global === 'PORCENTAJE'
											? ` (${venta.valor_descuento_global}%)`
											: ''}:
									</span>
									<span class="font-medium">-{formatCurrency(venta.monto_descuento_global)}</span>
								</p>
							{/if}
							{#if venta.monto_recargo_iva > 0}
								<p class="text-xs text-light-black/60 flex justify-between">
									<span>Recargo factura ({venta.porcentaje_recargo_iva}%):</span>
									<span class="font-medium">+{formatCurrency(venta.monto_recargo_iva)}</span>
								</p>
							{/if}
							{#if venta.estado === 'COMPLETADA' && venta.total_neto !== venta.total}
								<p class="text-xs font-bold text-light-black flex justify-between">
									<span>Total neto:</span> <span>{formatCurrency(venta.total_neto)}</span>
								</p>
							{/if}
						</div>
					</div>

					<div class="rounded-xl border border-light-black/10 bg-blue-50 p-4">
						<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase mb-2">
							Pagos Realizados
						</p>
						<div class="space-y-1.5 mb-3">
							{#if venta.pagos && venta.pagos.length > 0}
								{#each venta.pagos as pago, i (i)}
									<div class="flex justify-between items-center text-sm">
										<span class="font-semibold text-blue-800">{pago.metodo_pago}</span>
										<span class="font-bold text-blue-700">{formatCurrency(pago.monto)}</span>
									</div>
								{/each}
							{:else}
								<p class="text-xs text-light-black/50 italic">Sin registros</p>
							{/if}
						</div>
						<div class="mt-3 space-y-1 border-t border-black/5 pt-2">
							<p class="text-xs text-light-black/60 flex justify-between">
								<span>Total Pagado:</span> <span class="font-bold text-light-black">{formatCurrency(venta.monto_pagado)}</span>
							</p>
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

				<!-- Factura -->
				{#if venta.factura}
					{@const estilo = FACTURA_ESTILO[venta.factura.estado]}
					<div class="mb-6 rounded-xl border p-4 {estilo?.caja ?? 'border-light-black/10 bg-slate-50'}">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<div class="flex items-center gap-2">
								<p class="text-[10px] font-bold tracking-widest text-light-black/50 uppercase">Factura</p>
								<span class="font-bold text-light-black">N° {venta.factura.numero_factura}</span>
								<span class="rounded-full px-2 py-0.5 text-[10px] font-bold {estilo?.badge ?? ''}">
									{estilo?.texto ?? venta.factura.estado}
								</span>
							</div>
							{#if venta.factura.estado === 'FACTURADA'}
								<div class="flex gap-2">
									{#if venta.factura.url_factura_pdf}
										<a
											href={venta.factura.url_factura_pdf}
											target="_blank"
											rel="noopener noreferrer"
											class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
										>
											Ver PDF
										</a>
									{/if}
									{#if venta.factura.url_siat}
										<a
											href={venta.factura.url_siat}
											target="_blank"
											rel="noopener noreferrer"
											class="rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
										>
											Verificar en SIAT
										</a>
									{/if}
								</div>
							{/if}
						</div>

						{#if venta.factura.estado === 'FACTURADA'}
							<div class="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-4">
								<p class="text-light-black/60">
									Emitida: <span class="font-medium text-light-black">
										{venta.factura.fecha_emision ? formatDate(venta.factura.fecha_emision) : '--'}
									</span>
								</p>
								<p class="text-light-black/60">
									Importe facturado: <span class="font-medium text-light-black">
										{formatCurrency(venta.factura.monto_facturado)}
									</span>
								</p>
								<p class="text-light-black/60">
									IVA (débito fiscal): <span class="font-medium text-light-black">
										{formatCurrency(venta.factura.monto_iva ?? 0)}
									</span>
								</p>
								<p class="text-light-black/60">
									Cód. control: <span class="font-mono text-light-black">{venta.factura.codigo_control ?? '--'}</span>
								</p>
							</div>
							<p class="mt-2 truncate font-mono text-[10px] text-light-black/50" title={venta.factura.cuf ?? ''}>
								CUF: {venta.factura.cuf}
							</p>
						{:else if venta.factura.estado === 'ERROR'}
							<p class="mt-2 text-xs font-medium text-red-800">
								{venta.factura.error || 'No se pudo emitir la factura.'}
							</p>
						{/if}
					</div>
				{/if}

				<!-- Facturas anuladas (historial) -->
				{#if venta.facturas_anuladas?.length > 0}
					<div class="mb-6 rounded-xl border border-light-black/10 bg-slate-50 p-4">
						<p class="mb-2 text-[10px] font-bold tracking-widest text-light-black/50 uppercase">
							Facturas anuladas
						</p>
						<ul class="space-y-2">
							{#each venta.facturas_anuladas as fa (fa.id)}
								<li class="flex flex-wrap items-center justify-between gap-2 text-xs">
									<div class="flex items-center gap-2">
										<span class="font-bold text-light-black line-through">N° {fa.numero_factura}</span>
										<span class="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-700">
											Anulada
										</span>
										<span class="text-light-black/60">
											Emitida {fa.fecha_emision ? formatDate(fa.fecha_emision) : '--'} · Anulada
											{fa.fecha_anulacion ? formatDate(fa.fecha_anulacion) : '--'}
										</span>
									</div>
									{#if fa.url_factura_pdf}
										<a
											href={fa.url_factura_pdf}
											target="_blank"
											rel="noopener noreferrer"
											class="font-bold text-light-black/70 underline hover:text-light-black"
										>
											Ver PDF
										</a>
									{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<!-- Table -->
				<div class="overflow-hidden rounded-xl border border-light-black/10 shadow-sm">
					<table class="w-full text-left">
						<thead class="bg-light-black/5 text-xs tracking-wider text-light-black/70 uppercase">
							<tr>
								<th class="px-5 py-4 font-bold">Producto</th>
								<th class="px-5 py-4 text-center font-bold">Unidad / Present.</th>
								<th class="px-5 py-4 text-center font-bold">Cant.</th>
								<th class="px-5 py-4 text-right font-bold">Precio Unit.</th>
								<th class="px-5 py-4 text-right font-bold">Desc.</th>
								<th class="px-5 py-4 text-right font-bold">Subtotal</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-light-black/5 bg-white">
							{#each venta.detalles as item (item.id)}
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
										{#if item.cantidad_devuelta > 0}
											<p class="mt-2 inline-block rounded-lg border border-orange-100 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
												Devuelto: {item.cantidad_devuelta} de {item.cantidad}
											</p>
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
									<td class="px-5 py-4 text-center text-lg font-bold">{item.cantidad}</td>
									<td class="px-5 py-4 text-right font-medium text-light-black/70"
										>{formatCurrency(item.precio_unitario)}</td
									>
									<td class="px-5 py-4 text-right font-medium text-red-600/80">
										{item.monto_descuento > 0 ? `-${formatCurrency(item.monto_descuento)}` : '--'}
									</td>
									<td class="px-5 py-4 text-right text-base font-bold text-light-black">
										{formatCurrency(item.subtotal)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Devoluciones y cambios -->
				{#if venta.devoluciones.length > 0}
					<div class="mt-6">
						<p class="mb-3 text-[10px] font-bold tracking-widest text-light-black/50 uppercase">
							Devoluciones y cambios
						</p>
						<div class="space-y-3">
							{#each venta.devoluciones as dev (dev.id)}
								<div class="rounded-xl border border-light-black/10 p-4">
									<div class="flex flex-wrap items-center justify-between gap-2">
										<div class="flex items-center gap-2">
											{#if dev.tipo === 'CAMBIO'}
												<span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">CAMBIO</span>
											{:else}
												<span class="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">DEVOLUCIÓN</span>
											{/if}
											<span class="font-mono font-bold text-light-black">{dev.numero_devolucion}</span>
											<span class="text-xs text-light-black/60">{formatDate(dev.fecha)}</span>
										</div>
										<div class="text-right text-xs">
											{#if dev.tipo === 'DEVOLUCION'}
												<span class="text-light-black/60">Reembolsado:</span>
												<span class="font-bold text-[#B91C1C]">{formatCurrency(dev.monto_devuelto)}</span>
											{:else}
												<span class="text-light-black/60">Diferencia:</span>
												<span class="font-bold text-light-black">{formatCurrency(dev.monto_diferencia)}</span>
											{/if}
										</div>
									</div>
									{#if dev.motivo}
										<p class="mt-2 text-xs text-light-black/60">Motivo: {dev.motivo}</p>
									{/if}

									<ul class="mt-3 space-y-2 border-t border-black/5 pt-3">
										{#each dev.items as it (it.id)}
											{@const original = detallesPorId.get(it.id_detalle_venta)}
											<li class="text-xs">
												<div class="flex justify-between gap-2">
													<span class="text-light-black">
														<span class="font-semibold text-red-700">Devuelve:</span>
														{it.cantidad_devuelta}
														{original ? unidadDe(original) : ''}
														{original?.producto.nombre_comercial ?? 'Producto'}
														{#if it.numero_serie_devuelta}
															<span class="font-mono text-light-black/60">(S/N: {it.numero_serie_devuelta})</span>
														{/if}
													</span>
													<span class="font-medium text-[#B91C1C]">-{formatCurrency(it.subtotal_devuelto)}</span>
												</div>
												{#if it.producto_entregado}
													{@const entregado = it.producto_entregado}
													<div class="mt-1 flex justify-between gap-2">
														<span class="text-light-black">
															<span class="font-semibold text-blue-700">Recibe:</span>
															{entregado.cantidad}
															{unidadDe(entregado)}
															{entregado.producto.nombre_comercial}
															{#if entregado.numero_serie}
																<span class="font-mono text-light-black/60">(S/N: {entregado.numero_serie})</span>
															{/if}
														</span>
														<span class="font-medium text-light-black">{formatCurrency(entregado.subtotal)}</span>
													</div>
												{/if}
											</li>
										{/each}
									</ul>
								</div>
							{/each}
						</div>
					</div>
				{/if}
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
