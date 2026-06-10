<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { XIcon } from '$lib/icons/outline';
	import type { Devolucion } from '$lib/interfaces/devolucion.interface';
	import { fade, fly } from 'svelte/transition';

	let {
		isOpen = false,
		devolucion = null,
		onClose
	}: {
		isOpen: boolean;
		devolucion: Devolucion | null;
		onClose: () => void;
	} = $props();

	function formatCurrency(amount: string | number) {
		return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(
			Number(amount)
		);
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('es-BO', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

{#if isOpen && devolucion}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		transition:fade={{ duration: 200 }}
	>
		<!-- Modal -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="relative mx-4 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-light-four bg-light-one shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Header -->
			<div
				class="sticky top-0 z-10 flex items-center justify-between border-b border-light-four bg-light-one/95 px-6 py-4 backdrop-blur-sm"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex size-10 items-center justify-center rounded-xl {devolucion.tipo ===
						'DEVOLUCION'
							? 'bg-red-100 text-red-600'
							: 'bg-blue-100 text-blue-600'}"
					>
						{#if devolucion.tipo === 'DEVOLUCION'}
							<svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
								<path d="M9 14l-4 -4l4 -4"></path>
								<path d="M5 10h11a4 4 0 1 1 0 8h-1"></path>
							</svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
								<path d="M7 10h14l-4 -4"></path>
								<path d="M17 14h-14l4 4"></path>
							</svg>
						{/if}
					</div>
					<div>
						<h3 class="text-lg font-bold text-light-black">
							{devolucion.tipo === 'DEVOLUCION' ? 'Devolución' : 'Cambio'}
						</h3>
						<p class="text-xs font-mono text-light-two">{devolucion.numero_devolucion}</p>
					</div>
				</div>

				<button
					class="rounded-xl p-2 text-light-two transition-colors hover:bg-light-one_d hover:text-light-black"
					onclick={onClose}
				>
					<XIcon class="size-5" />
				</button>
			</div>

			<!-- Body -->
			<div class="space-y-6 p-6">
				<!-- Info Grid -->
				<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
					<div class="rounded-xl bg-light-one_d p-4">
						<span class="text-[10px] font-bold tracking-wider text-light-two uppercase"
							>Fecha</span
						>
						<p class="mt-1 text-sm font-bold text-light-black">
							{formatDate(devolucion.createdAt)}
						</p>
					</div>
					<div class="rounded-xl bg-light-one_d p-4">
						<span class="text-[10px] font-bold tracking-wider text-light-two uppercase"
							>Estado</span
						>
						<p class="mt-1">
							<span
								class="rounded-full px-3 py-1 text-[10px] font-bold uppercase {devolucion.estado ===
								'COMPLETADA'
									? 'bg-green-100 text-green-700'
									: 'bg-red-100 text-red-700'}"
							>
								{devolucion.estado}
							</span>
						</p>
					</div>
					<div class="rounded-xl bg-light-one_d p-4">
						<span class="text-[10px] font-bold tracking-wider text-light-two uppercase"
							>Tipo</span
						>
						<p class="mt-1">
							<span
								class="rounded-full px-3 py-1 text-[10px] font-bold uppercase {devolucion.tipo ===
								'DEVOLUCION'
									? 'bg-red-100 text-red-700'
									: 'bg-blue-100 text-blue-700'}"
							>
								{devolucion.tipo}
							</span>
						</p>
					</div>
					{#if devolucion.venta_original}
						<div class="rounded-xl bg-light-one_d p-4">
							<span class="text-[10px] font-bold tracking-wider text-light-two uppercase"
								>Venta Original</span
							>
							<p class="mt-1 text-sm font-bold text-light-black">
								{devolucion.venta_original.numero_comprobante}
							</p>
						</div>
					{/if}
					{#if devolucion.cliente}
						<div class="rounded-xl bg-light-one_d p-4">
							<span class="text-[10px] font-bold tracking-wider text-light-two uppercase"
								>Cliente</span
							>
							<p class="mt-1 text-sm font-bold text-light-black">
								{devolucion.cliente.nombre}
								{devolucion.cliente.apellido_paterno}
							</p>
							<p class="text-xs text-light-two">CI: {devolucion.cliente.ci}</p>
						</div>
					{/if}
					{#if devolucion.empleado}
						<div class="rounded-xl bg-light-one_d p-4">
							<span class="text-[10px] font-bold tracking-wider text-light-two uppercase"
								>Responsable</span
							>
							<p class="mt-1 text-sm font-bold text-light-black">
								{devolucion.empleado.nombre}
								{devolucion.empleado.apellido_paterno}
							</p>
						</div>
					{/if}
				</div>

				<!-- Motivo -->
				{#if devolucion.motivo}
					<div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
						<span class="text-[10px] font-bold tracking-wider text-amber-600 uppercase"
							>Motivo</span
						>
						<p class="mt-1 text-sm text-amber-800">{devolucion.motivo}</p>
					</div>
				{/if}

				<!-- Detalles Table -->
				{#if devolucion.detalles && devolucion.detalles.length > 0}
					<div>
						<h4 class="mb-3 text-xs font-bold tracking-wider text-light-two uppercase">
							Productos Devueltos
						</h4>
						<div class="overflow-x-auto rounded-xl border border-light-four">
							<table class="min-w-full divide-y divide-light-four">
								<thead class="bg-light-one_d">
									<tr>
										<th
											class="px-4 py-3 text-left text-[10px] font-bold tracking-wider text-light-two uppercase"
											>Producto</th
										>
										<th
											class="px-4 py-3 text-center text-[10px] font-bold tracking-wider text-light-two uppercase"
											>Cantidad</th
										>
										<th
											class="px-4 py-3 text-right text-[10px] font-bold tracking-wider text-light-two uppercase"
											>Precio</th
										>
										<th
											class="px-4 py-3 text-right text-[10px] font-bold tracking-wider text-light-two uppercase"
											>Subtotal</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-light-four bg-light-one">
									{#each devolucion.detalles as det (det.id)}
										<tr class="transition-colors hover:bg-light-one_d">
											<td class="px-4 py-3">
												<p class="text-sm font-bold text-light-black">
													{det.producto_original?.nombre_comercial || '—'}
												</p>
												{#if det.presentacion_original}
													<span
														class="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-semibold text-blue-700"
													>
														{det.presentacion_original.nombre}
													</span>
												{/if}
												{#if det.numero_serie_devuelta}
													<span
														class="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-semibold text-purple-700"
													>
														S/N: {det.numero_serie_devuelta}
													</span>
												{/if}
											</td>
											<td class="px-4 py-3 text-center text-sm font-bold text-light-black">
												{det.cantidad_devuelta}
											</td>
											<td class="px-4 py-3 text-right text-sm text-light-two">
												{formatCurrency(det.precio_original)}
											</td>
											<td class="px-4 py-3 text-right text-sm font-bold text-red-600">
												{formatCurrency(det.subtotal_devuelto)}
											</td>
										</tr>

										<!-- New product row for CAMBIO -->
										{#if devolucion.tipo === 'CAMBIO' && det.producto_nuevo}
											<tr class="bg-blue-50/50">
												<td class="px-4 py-3" colspan="1">
													<div class="flex items-center gap-2">
														<span
															class="rounded-full bg-blue-200 px-2 py-0.5 text-[9px] font-bold text-blue-700"
															>NUEVO</span
														>
														<p class="text-sm font-bold text-blue-800">
															{det.producto_nuevo.nombre_comercial}
														</p>
													</div>
													{#if det.presentacion_nueva}
														<span
															class="ml-12 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-semibold text-blue-700"
														>
															{det.presentacion_nueva.nombre}
														</span>
													{/if}
												</td>
												<td class="px-4 py-3 text-center text-sm font-bold text-blue-700">
													{det.cantidad_nueva}
												</td>
												<td class="px-4 py-3 text-right text-sm text-blue-600">
													{formatCurrency(det.precio_nuevo || 0)}
												</td>
												<td class="px-4 py-3 text-right text-sm font-bold text-blue-700">
													{formatCurrency(det.subtotal_nuevo || 0)}
												</td>
											</tr>
										{/if}
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}

				<!-- Totals -->
				<div
					class="rounded-xl border p-5 {devolucion.tipo === 'DEVOLUCION'
						? 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50'
						: 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'}"
				>
					<div class="space-y-2">
						<div class="flex items-center justify-between text-sm">
							<span class="text-light-two">Monto devuelto</span>
							<span class="font-bold text-red-600">
								{formatCurrency(devolucion.monto_devuelto)}
							</span>
						</div>
						{#if devolucion.tipo === 'CAMBIO'}
							<div class="flex items-center justify-between text-sm">
								<span class="text-light-two">Diferencia (nuevo - devuelto)</span>
								<span
									class="font-bold {parseFloat(devolucion.monto_diferencia) >= 0
										? 'text-amber-600'
										: 'text-green-600'}"
								>
									{formatCurrency(devolucion.monto_diferencia)}
								</span>
							</div>
						{/if}
						<div class="flex items-center justify-between border-t pt-2 {devolucion.tipo === 'DEVOLUCION' ? 'border-red-200' : 'border-blue-200'}">
							<span class="font-bold text-light-black">Método de reembolso</span>
							<span class="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
								{devolucion.metodo_reembolso}
							</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div
				class="sticky bottom-0 flex justify-end border-t border-light-four bg-light-one/95 px-6 py-4 backdrop-blur-sm"
			>
				<Button variant="outline" onclick={onClose}>Cerrar</Button>
			</div>
		</div>
	</div>
{/if}
