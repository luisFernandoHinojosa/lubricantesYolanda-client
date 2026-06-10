<script lang="ts">
	import { Modal, Badge, Heading } from '$lib/components/ui';
	import { PhotoIcon, PackageIcon, TagIcon, MapPinIcon, StopwatchIcon } from '$lib/icons/outline';
	import type { Producto } from '$lib/interfaces';

	interface Props {
		isOpen: boolean;
		producto: Producto | null;
		onClose: () => void;
	}

	let { isOpen, producto, onClose }: Props = $props();

	function formatDate(dateString: string | null) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<Modal {isOpen} title="Detalles del Producto" {onClose} maxWidth="sm:max-w-4xl">
	{#if producto}
		<div class="space-y-8">
			<!-- Hero Section -->
			<div class="flex flex-col gap-6 md:flex-row">
				<div
					class="flex h-48 w-48 shrink-0 items-center justify-center rounded-2xl border border-light-four bg-light-one_d"
				>
					{#if producto.imagen_url}
						<img
							src={producto.imagen_url}
							alt={producto.nombre_comercial}
							class="h-full w-full rounded-2xl object-cover"
						/>
					{:else}
						<PhotoIcon class="size-16 text-light-three" />
					{/if}
				</div>

				<div class="flex flex-col justify-center gap-2">
					<div class="flex items-center gap-3">
						<Heading level="h3" class="line-clamp-5">{producto.nombre_comercial}</Heading>
					</div>

					<div class="flex flex-wrap gap-4 text-sm font-medium text-light-two">
						<span class="flex items-center gap-1">
							<TagIcon class="size-4" />
							{producto.categoria?.nombre || 'Sin Categoría'}
						</span>
						<span class="flex items-center gap-1 text-xs">
							<PackageIcon class="size-4" />
							{producto.marca?.nombre || 'Sin Marca'}
						</span>
						<span class="flex items-center gap-1 font-bold text-light-black">
							Stock Total: {producto.stock_actual_consolidado ?? producto.stock_actual}
							{producto.unidad_medida?.abreviatura}
						</span>
					</div>
					<div class="mt-2 flex flex-col gap-1 font-mono text-xs text-light-three">
						<div>Código de barras: {producto.codigo_barras || '—'}</div>
						<div class="flex items-center gap-1 font-bold text-emerald-600">
							Precio de Venta: Bs. {Number(producto.precio_venta || 0).toFixed(2)}
						</div>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<!-- Presentations Section -->
				<div class="space-y-4">
					<div class="flex items-center justify-between border-b border-light-four pb-2">
						<Heading level="h5" class="mr-2 flex items-center gap-2">
							<PackageIcon class="size-5 text-light-three" />
							Presentaciones
						</Heading>
						<span class="text-xs font-bold text-light-three">
							{producto.presentaciones?.length || 0} Registradas
						</span>
					</div>
					<div class="grid gap-3">
						{#if producto.presentaciones && producto.presentaciones.length > 0}
							{#each producto.presentaciones as pres (pres.id)}
								<div
									class="rounded-xl border border-light-four bg-light-one p-3 transition-colors hover:bg-light-one_d"
								>
									<div class="flex items-center justify-between">
										<span class="text-sm font-bold text-light-black uppercase">{pres.nombre}</span>
										<Badge variant="info" class="text-[10px]"
											>Factor: {pres.factor_conversion}</Badge
										>
									</div>
									<div class="mt-2 flex items-center justify-between">
										<span class="text-xs font-medium text-light-two">SKU: {pres.sku || 'N/A'}</span>
										<span class="font-black text-emerald-600">Bs. {pres.precio_especial}</span>
									</div>
								</div>
							{/each}
						{:else}
							<div
								class="rounded-xl border border-dashed border-light-four p-4 text-center text-sm text-light-three"
							>
								No hay presentaciones adicionales.
							</div>
						{/if}
					</div>
				</div>

				<!-- Batches Section -->
				<div class="space-y-4">
					<div class="flex items-center justify-between border-b border-light-four pb-2">
						<Heading level="h5" class="flex items-center gap-2 ">
							<StopwatchIcon class="size-5 text-light-three" />
							Lotes y Stock
						</Heading>
						<span class="text-xs font-bold text-light-three">
							{producto.lotes?.length || 0} Lotes
						</span>
					</div>
					<div class="grid gap-3">
						{#if producto.lotes && producto.lotes.length > 0}
							{#each producto.lotes as lote (lote.id)}
								<div class="rounded-xl border border-light-four bg-light-one p-3">
									<div
										class="mb-2 flex items-center justify-between border-b border-light-four pb-2"
									>
										<div class="flex flex-col">
											<span class="text-xs font-black text-light-black"
												>Lote: {lote.codigo_lote}</span
											>
											<span class="text-[10px] text-light-three uppercase"
												>{lote.proveedor?.nombre || 'Sin Proveedor'}</span
											>
										</div>
										<div class="text-right">
											<span class="block text-[10px] font-bold text-light-two uppercase"
												>Vencimiento</span
											>
											<span
												class="text-xs font-medium {lote.fecha_vencimiento
													? 'text-light-error'
													: 'text-light-three'}"
											>
												{formatDate(lote.fecha_vencimiento)}
											</span>
										</div>
									</div>

									<div class="space-y-2">
										<div class="text-[10px] font-bold tracking-widest text-light-three uppercase">
											Distribución
										</div>
										{#if lote.stock_distribuciones && lote.stock_distribuciones.length > 0}
											{#each lote.stock_distribuciones as dist (dist.id)}
												<div class="flex items-center justify-between text-xs">
													<span class="flex items-center gap-1 text-light-two">
														<MapPinIcon class="size-3" />
														{dist.ubicacion?.nombre} ({dist.ubicacion?.tipo_area})
													</span>
													<span class="font-black text-light-black"
														>{dist.cantidad_actual} {producto.unidad_medida?.abreviatura}</span
													>
												</div>
											{/each}
										{:else}
											<div class="text-xs text-light-three italic">Sin distribución de stock</div>
										{/if}
									</div>
								</div>
							{/each}
						{:else}
							<div
								class="rounded-xl border border-dashed border-light-four p-4 text-center text-sm text-light-three"
							>
								No hay lotes registrados para este producto.
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</Modal>
