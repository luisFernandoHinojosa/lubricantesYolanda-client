<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { Compra, UpdateCompraDto } from '$lib/interfaces/compra.interface';
	import { comprasService } from '$lib/services';

	interface Props {
		isOpen: boolean;
		compra: Compra | null;
		onClose: () => void;
		onUpdated?: (compra: Compra) => void;
		onDeleted?: (id: string) => void;
	}

	let { isOpen, compra, onClose, onUpdated, onDeleted }: Props = $props();

	// ─── Estado local ────────────────────────────────────────────────────────────
	type View = 'detail' | 'edit' | 'confirmDelete';
	let view = $state<View>('detail');
	let isSaving = $state(false);
	let isDeleting = $state(false);
	let errorMsg = $state('');

	// Campos editables
	let editEstadoPago = $state<Compra['estado_pago']>('PAGADO');
	let editNotas = $state('');

	// Cuando cambia la compra, sincronizar campos de edición
	$effect(() => {
		if (compra) {
			editEstadoPago = compra.estado_pago;
			editNotas = compra.notas ?? '';
		}
		view = 'detail';
		errorMsg = '';
	});

	// ─── Helpers ─────────────────────────────────────────────────────────────────
	function formatCurrency(amount: string | number) {
		return new Intl.NumberFormat('es-BO', {
			style: 'currency',
			currency: 'BOB'
		}).format(Number(amount));
	}

	function formatDate(dateString?: string) {
		if (!dateString) return '—';
		return new Date(dateString).toLocaleString('es-BO', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const estadoBadge: Record<Compra['estado_pago'], string> = {
		PAGADO: 'border-green-200 bg-green-50 text-green-700',
		PENDIENTE: 'border-[#B91C1C]/20 bg-[#D19999]/20 text-[#8B1515]',
		PAGADO_PARCIAL: 'border-orange-200 bg-orange-50 text-orange-700'
	};

	// ─── Acciones ─────────────────────────────────────────────────────────────────
	async function handleUpdate() {
		if (!compra?.id) return;
		isSaving = true;
		errorMsg = '';
		try {
			const payload: UpdateCompraDto = {
				estado_pago: editEstadoPago,
				notas: editNotas || undefined
			};
			const updated = await comprasService.updateCompra(compra.id, payload);
			onUpdated?.(updated);
			view = 'detail';
		} catch (err: any) {
			errorMsg = err?.response?.data?.message ?? 'Error al actualizar la compra.';
		} finally {
			isSaving = false;
		}
	}

	async function handleDelete() {
		if (!compra?.id) return;
		isDeleting = true;
		errorMsg = '';
		try {
			await comprasService.deleteCompra(compra.id);
			onDeleted?.(compra.id);
			onClose();
		} catch (err: any) {
			errorMsg = err?.response?.data?.message ?? 'Error al eliminar la compra.';
			view = 'detail';
		} finally {
			isDeleting = false;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

{#if isOpen && compra}
	<!-- Backdrop -->
	<div
		role="dialog"
		aria-modal="true"
		aria-label="Detalle de Compra"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 150 }}
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		tabindex="-1"
	>
		<!-- Panel -->
		<div
			class="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
			transition:fly={{ y: 24, duration: 200 }}
		>
			<!-- ── Header ─────────────────────────────────────────────────────────── -->
			<div class="flex items-center justify-between bg-[#B91C1C] px-6 py-4 text-white">
				<div>
					<p class="text-[10px] font-bold tracking-widest uppercase opacity-70">
						{#if view === 'edit'}Editando compra{:else if view === 'confirmDelete'}Confirmar
							eliminación{:else}Detalle de Compra{/if}
					</p>
					<h2 class="text-xl font-extrabold tracking-tight">
						{compra.numero_comprobante ?? 'S/N'}
					</h2>
				</div>
				<button
					onclick={onClose}
					class="rounded-lg p-1.5 transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
					aria-label="Cerrar"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- ── Contenido ──────────────────────────────────────────────────────── -->
			<div class="flex-1 overflow-y-auto">
				<!-- ════ VISTA DETALLE ════ -->
				{#if view === 'detail'}
					<div class="space-y-5 p-6">
						<!-- Metadata grid -->
						<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
							<div class="col-span-2 sm:col-span-1">
								<p class="mb-0.5 text-[10px] font-bold text-gray-400 uppercase">Proveedor</p>
								{#if compra.proveedor}
									<p class="font-bold text-gray-800">{compra.proveedor.nombre}</p>
									<p class="text-xs text-gray-500">NIT: {compra.proveedor.nit_ci}</p>
								{:else}
									<p class="text-sm text-gray-400 italic">Desconocido</p>
								{/if}
							</div>

							<div>
								<p class="mb-0.5 text-[10px] font-bold text-gray-400 uppercase">Responsable</p>
								{#if compra.empleado}
									<p class="font-medium text-gray-700">
										{compra.empleado.nombre}
										{compra.empleado.apellido_paterno}
									</p>
								{:else}
									<p class="text-sm text-gray-400 italic">—</p>
								{/if}
							</div>

							<div>
								<p class="mb-0.5 text-[10px] font-bold text-gray-400 uppercase">Fecha</p>
								<p class="font-medium text-gray-700">
									{formatDate(compra.fecha_compra ?? compra.createdAt)}
								</p>
							</div>

							<div>
								<p class="mb-0.5 text-[10px] font-bold text-gray-400 uppercase">Estado de Pago</p>
								<span
									class="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase {estadoBadge[
										compra.estado_pago
									]}"
								>
									{compra.estado_pago}
								</span>
							</div>

							<div>
								<p class="mb-0.5 text-[10px] font-bold text-gray-400 uppercase">Total</p>
								<p class="text-lg font-extrabold text-[#B91C1C]">{formatCurrency(compra.total)}</p>
							</div>

							{#if compra.notas}
								<div class="col-span-2 sm:col-span-3">
									<p class="mb-0.5 text-[10px] font-bold text-gray-400 uppercase">Notas</p>
									<p class="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{compra.notas}</p>
								</div>
							{/if}
						</div>

						<!-- Tabla de detalles -->
						{#if compra.detalles && compra.detalles.length > 0}
							<div>
								<p class="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
									Productos ({compra.detalles.length})
								</p>
								<div class="overflow-hidden rounded-xl border border-gray-100">
									<table class="w-full text-left text-xs">
										<thead>
											<tr
												class="bg-[#D19999]/30 text-[10px] font-bold tracking-wider text-[#8B1515] uppercase"
											>
												<th class="px-4 py-3">Producto</th>
												<th class="px-4 py-3">Lote</th>
												<th class="px-4 py-3 text-right">Cant.</th>
												<th class="px-4 py-3 text-right">Costo u.</th>
												<th class="px-4 py-3 text-right">Subtotal</th>
											</tr>
										</thead>
										<tbody class="divide-y divide-gray-100">
											{#each compra.detalles as det, i (det.id ?? i)}
												<tr
													class="{i % 2 === 0
														? 'bg-white'
														: 'bg-gray-50/50'} transition-colors hover:bg-red-50/30"
												>
													<td class="px-4 py-3">
														<p class="font-semibold text-gray-700">
															{det.producto?.nombre_comercial ??
																`Producto ${det.id_producto.substring(0, 8)}`}
														</p>
														{#if det.fecha_vencimiento_lote}
															<p class="mt-0.5 text-[10px] text-gray-400">
																Vence: {new Date(det.fecha_vencimiento_lote).toLocaleDateString(
																	'es-BO'
																)}
															</p>
														{/if}
													</td>
													<td class="px-4 py-3 font-mono text-gray-500">
														{det.lote?.codigo_lote ?? '—'}
													</td>
													<td class="px-4 py-3 text-right font-bold text-gray-700"
														>{det.cantidad}</td
													>
													<td class="px-4 py-3 text-right text-gray-600"
														>{formatCurrency(det.costo_unitario)}</td
													>
													<td class="px-4 py-3 text-right font-bold text-[#B91C1C]"
														>{formatCurrency(det.subtotal)}</td
													>
												</tr>
											{/each}
										</tbody>
										<tfoot>
											<tr class="border-t-2 border-[#B91C1C]/20 bg-[#D19999]/10">
												<td
													colspan="4"
													class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase"
													>Total</td
												>
												<td class="px-4 py-3 text-right text-base font-extrabold text-[#B91C1C]">
													{formatCurrency(compra.total)}
												</td>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>
						{:else}
							<p
								class="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400 italic"
							>
								No hay ítems de detalle disponibles.
							</p>
						{/if}
					</div>

					<!-- ════ VISTA EDICIÓN ════ -->
				{:else if view === 'edit'}
					<div class="space-y-5 p-6">
						<p class="text-sm text-gray-500">
							Sólo puedes modificar el <strong>estado de pago</strong> y las <strong>notas</strong> de
							la compra. Los ítems no son editables una vez registrada.
						</p>

						<div class="space-y-4">
							<div>
								<label
									for="edit-estado"
									class="mb-1.5 block text-xs font-bold tracking-wider text-gray-500 uppercase"
								>
									Estado de Pago
								</label>
								<select
									id="edit-estado"
									bind:value={editEstadoPago}
									class="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus:outline-none"
								>
									<option value="PENDIENTE">Pendiente</option>
									<option value="PAGADO_PARCIAL">Pagado Parcial</option>
									<option value="PAGADO">Pagado</option>
								</select>
							</div>

							<div>
								<label
									for="edit-notas"
									class="mb-1.5 block text-xs font-bold tracking-wider text-gray-500 uppercase"
								>
									Notas
								</label>
								<textarea
									id="edit-notas"
									bind:value={editNotas}
									rows="4"
									placeholder="Observaciones adicionales..."
									class="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus:outline-none"
								></textarea>
							</div>
						</div>

						{#if errorMsg}
							<p
								class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-[#B91C1C]"
							>
								{errorMsg}
							</p>
						{/if}
					</div>

					<!-- ════ VISTA CONFIRMAR ELIMINAR ════ -->
				{:else if view === 'confirmDelete'}
					<div class="flex flex-col items-center gap-4 px-8 py-10 text-center">
						<div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-7 w-7 text-[#B91C1C]"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
								/>
							</svg>
						</div>
						<div>
							<h3 class="text-base font-bold text-gray-800">¿Eliminar esta compra?</h3>
							<p class="mt-1 text-sm text-gray-500">
								Se eliminará <strong>{compra.numero_comprobante ?? 'S/N'}</strong> de forma
								permanente.<br />
								Esta acción no se puede deshacer.
							</p>
						</div>

						{#if errorMsg}
							<p
								class="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-[#B91C1C]"
							>
								{errorMsg}
							</p>
						{/if}
					</div>
				{/if}
			</div>

			<!-- ── Footer / Acciones ──────────────────────────────────────────────── -->
			<div
				class="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-6 py-4"
			>
				{#if view === 'detail'}
					<!-- Botones de modo detalle -->
					<button
						onclick={() => {
							view = 'confirmDelete';
							errorMsg = '';
						}}
						class="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-[#B91C1C] transition-colors hover:bg-red-100 focus:ring-2 focus:ring-[#B91C1C]/30 focus:outline-none"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
						Eliminar
					</button>

					<div class="flex gap-2">
						<button
							onclick={onClose}
							class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none"
						>
							Cerrar
						</button>
						<button
							onclick={() => {
								view = 'edit';
								errorMsg = '';
							}}
							class="inline-flex items-center gap-1.5 rounded-lg bg-[#B91C1C] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#991b1b] focus:ring-2 focus:ring-[#B91C1C]/40 focus:outline-none"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z"
								/>
							</svg>
							Editar
						</button>
					</div>
				{:else if view === 'edit'}
					<button
						onclick={() => {
							view = 'detail';
							errorMsg = '';
						}}
						class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none"
					>
						Cancelar
					</button>

					<button
						onclick={handleUpdate}
						disabled={isSaving}
						class="inline-flex items-center gap-2 rounded-lg bg-[#B91C1C] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#991b1b] focus:ring-2 focus:ring-[#B91C1C]/40 focus:outline-none disabled:opacity-60"
					>
						{#if isSaving}
							<svg
								class="h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								></path>
							</svg>
							Guardando...
						{:else}
							Guardar Cambios
						{/if}
					</button>
				{:else if view === 'confirmDelete'}
					<button
						onclick={() => {
							view = 'detail';
							errorMsg = '';
						}}
						class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none"
					>
						Cancelar
					</button>

					<button
						onclick={handleDelete}
						disabled={isDeleting}
						class="inline-flex items-center gap-2 rounded-lg bg-[#B91C1C] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#991b1b] focus:ring-2 focus:ring-[#B91C1C]/40 focus:outline-none disabled:opacity-60"
					>
						{#if isDeleting}
							<svg
								class="h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								></path>
							</svg>
							Eliminando...
						{:else}
							Sí, eliminar
						{/if}
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
