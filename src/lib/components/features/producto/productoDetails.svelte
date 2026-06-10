<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import type { Producto } from '$lib/interfaces';
	import {
		XIcon,
		PhotoIcon,
		TagIcon,
		PackageIcon,
		MapPinIcon,
		StopwatchIcon,
		ScaleIcon,
		HomeDotIcon
	} from '$lib/icons/outline';
	import { Badge, Button, Text, Heading, Card } from '$lib/components/ui';

	interface Props {
		producto: Producto | null;
		isOpen: boolean;
		onClose: () => void;
	}

	let { producto, isOpen, onClose }: Props = $props();

	function formatDate(dateString: string | null) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	// Prevent scrolling when drawer is open
	$effect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

{#if isOpen}
	<!-- Backdrop -->
	<!-- eslint-disable-next-line svelte/valid-compile -->
	<div
		class="fixed inset-0 z-50 bg-light-black/20 backdrop-blur-sm transition-opacity"
		onclick={onClose}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="button"
		tabindex="0"
		aria-label="Cerrar panel"
		transition:fade={{ duration: 200 }}
	></div>

	<!-- Drawer Panel -->
	<div
		class="fixed inset-y-0 right-0 z-50 flex w-full max-w-4xl flex-col bg-white shadow-2xl ring-1 ring-light-four"
		transition:fly={{ x: 600, duration: 400, opacity: 1 }}
	>
		{#if producto}
			<!-- Header with Image Background -->
			<div class="relative h-64 w-full shrink-0 overflow-hidden bg-light-one_d">
				{#if producto.imagen_url}
					<img
						src={producto.imagen_url}
						alt={producto.nombre_comercial}
						class="h-full w-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
					/>
				{:else}
					<div class="flex h-full w-full flex-col items-center justify-center text-light-three">
						<PhotoIcon class="size-20 opacity-20" />
						<Text variant="body-base" class="mt-2 font-bold tracking-widest uppercase"
							>Sin Imagen</Text
						>
					</div>
				{/if}

				<!-- Gradient Overlay -->
				<div class="absolute inset-0 bg-linear-to-t from-white via-white/40 to-transparent"></div>

				<!-- Close Button -->
				<div class="absolute top-4 right-4">
					<Button
						variant="ghost"
						class="size-10 rounded-full bg-white/80 p-0! text-light-black shadow-md backdrop-blur-md hover:bg-white"
						onclick={onClose}
					>
						{#snippet leftIcon()}
							<XIcon class="size-6" />
						{/snippet}
					</Button>
				</div>

				<!-- Floating Info -->
				<div class="absolute right-8 bottom-6 left-8">
					<div class="flex flex-col gap-2">
						<div class="flex items-center gap-3">
							<Badge variant={producto.estado ? 'success' : 'error'} class="px-3 py-1 shadow-sm">
								{producto.estado ? 'Activo' : 'Inactivo'}
							</Badge>
							<Text class="font-mono text-sm font-bold tracking-wider text-light-two">
								{producto.codigo_barras}
							</Text>
						</div>
						<Heading level="h3" class="line-clamp-2 text-3xl font-black text-light-black">
							{producto.nombre_comercial}
						</Heading>
					</div>
				</div>
			</div>

			<!-- Main Content Area -->
			<div class="flex-1 overflow-y-auto px-8 py-6">
				<div class="space-y-8">
					<!-- Quick Stats Grid -->
					<div class="grid grid-cols-2 gap-4">
						<Card class="bg-primary/5 border-primary/10 flex flex-col gap-1 p-5 shadow-sm">
							<div class="flex items-center gap-2 tracking-tighter text-light-three uppercase">
								<StopwatchIcon class="size-4" />
								<span class="text-[10px] font-black">Stock Consolidado</span>
							</div>
							<div class="flex items-baseline gap-2">
								<span class="text-3xl font-black text-light-black">
									{producto.stock_actual_consolidado ?? producto.stock_actual}
								</span>
								<span class="text-sm font-bold text-light-two"
									>{producto.unidad_medida?.abreviatura}</span
								>
							</div>
						</Card>

						<Card class="flex flex-col gap-1 border-light-four bg-white p-5 shadow-sm">
							<div class="flex items-center gap-2 tracking-tighter text-light-three uppercase">
								<MapPinIcon class="size-4" />
								<span class="text-[10px] font-black">Ubicación Primaria</span>
							</div>
							<div class="flex flex-col">
								<span class="text-lg font-black text-light-black">
									{#if producto.ubicacion}
										{producto.ubicacion.nombre}
									{:else}
										<span class="font-bold text-light-three italic">No asignada</span>
									{/if}
								</span>
								<span class="text-[10px] font-bold text-light-three uppercase italic">
									{producto.ubicacion?.tipo_area || '--'}
								</span>
							</div>
						</Card>
					</div>

					<!-- Detailed breakdown sections -->
					<div class="space-y-10">
						<!-- Informacion Base -->
						<section>
							<Heading
								level="h5"
								class="mb-4 border-b border-light-four pb-2 text-[11px] font-black tracking-[0.2em] text-light-three uppercase"
							>
								Especificaciones Base
							</Heading>
							<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
								<div class="flex items-start gap-3">
									<TagIcon class="mt-1 size-5 shrink-0 text-light-two" />
									<div>
										<Text
											variant="body-base"
											class="text-[10px] font-black tracking-tight uppercase"
											>Marca y Categoría</Text
										>
										<p class="font-bold text-light-black">
											{producto.marca?.nombre || '--'} • {producto.categoria?.nombre || '--'}
										</p>
									</div>
								</div>
								<div class="flex items-start gap-3">
									<ScaleIcon class="mt-1 size-5 shrink-0 text-light-two" />
									<div>
										<Text
											variant="body-base"
											class="text-[10px] font-black tracking-tight uppercase"
											>Proveedor Principal</Text
										>
										<p class="font-bold text-light-black">{producto.proveedor?.nombre || '--'}</p>
									</div>
								</div>
							</div>
						</section>

						<!-- Presentaciones Section -->
						<section>
							<div class="mb-4 flex items-center justify-between border-b border-light-four pb-2">
								<Heading
									level="h5"
									class="text-[11px] font-black tracking-[0.2em] text-light-three uppercase"
								>
									Presentaciones
								</Heading>
								<span class="text-[10px] font-bold text-light-two"
									>{producto.presentaciones?.length || 0} Disponibles</span
								>
							</div>

							{#if producto.presentaciones && producto.presentaciones.length > 0}
								<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
									{#each producto.presentaciones as pres (pres.id)}
										<div
											class="group flex flex-col gap-2 rounded-xl border border-light-four bg-light-one_d p-3 transition-colors hover:border-light-two"
										>
											<div class="flex items-center justify-between">
												<span class="text-xs font-black text-light-black uppercase"
													>{pres.nombre}</span
												>
												<Badge variant="success" class="text-[9px]"
													>Bs. {pres.precio_especial}</Badge
												>
											</div>
											<div class="flex items-center justify-between text-[10px]">
												<span class="font-bold tracking-tighter text-light-three">FACTOR</span>
												<span class="font-black text-light-black">{pres.factor_conversion} X</span>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div
									class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-light-four py-8"
								>
									<PackageIcon class="size-8 text-light-four opacity-50" />
									<Text variant="body-base" class="mt-2 text-xs font-bold"
										>Unica presentación base registrada</Text
									>
								</div>
							{/if}
						</section>

						<!-- Lotes / Stock breakdown -->
						<section>
							<div class="mb-4 flex items-center justify-between border-b border-light-four pb-2">
								<Heading
									level="h5"
									class="text-[11px] font-black tracking-[0.2em] text-light-three uppercase"
								>
									Inventario por Lotes
								</Heading>
								<span class="text-[10px] font-bold tracking-tighter text-light-error uppercase"
									>{producto.lotes?.length || 0} Lotes activos</span
								>
							</div>

							{#if producto.lotes && producto.lotes.length > 0}
								<div class="space-y-4">
									{#each producto.lotes as lote (lote.id)}
										<div
											class="overflow-hidden rounded-2xl border border-light-four bg-white shadow-sm"
										>
											<!-- Lote Header -->
											<div class="flex items-center justify-between bg-light-one_d px-4 py-3">
												<div class="flex flex-col">
													<Text class="text-xs font-black tracking-tight text-light-black">
														LOTE: {lote.codigo_lote}
													</Text>
													<Text variant="body-base" class="text-[9px] font-bold uppercase">
														PROV: {lote.proveedor?.nombre || 'General'}
													</Text>
												</div>
												<div class="text-right">
													<div class="text-sm font-black text-light-black">
														{lote.stock_lote_total}
														<span class="text-[10px]">{producto.unidad_medida?.abreviatura}</span>
													</div>
													<Text class="text-[9px] font-bold text-light-error uppercase">
														VENCE: {formatDate(lote.fecha_vencimiento)}
													</Text>
												</div>
											</div>

											<!-- Distributions -->
											{#if lote.stock_distribuciones && lote.stock_distribuciones.length > 0}
												<div class="divide-y divide-light-four px-4">
													{#each lote.stock_distribuciones as dist (dist.id)}
														<div class="flex items-center justify-between py-2 text-[11px]">
															<div class="flex items-center gap-2">
																<div class="bg-primary/20 rounded-full p-1">
																	<HomeDotIcon class="text-primary size-2.5" />
																</div>
																<span class="font-bold text-light-black"
																	>{dist.ubicacion?.nombre}</span
																>
																<span
																	class="rounded-md border border-light-four bg-light-one_d px-1 text-[8px] font-black text-light-three uppercase"
																	>{dist.ubicacion?.tipo_area}</span
																>
															</div>
															<span class="font-black text-light-black">{dist.cantidad_actual}</span
															>
														</div>
													{/each}
												</div>
											{/if}
										</div>
									{/each}
								</div>
							{:else}
								<div class="flex h-32 flex-col items-center justify-center text-center">
									<StopwatchIcon class="size-8 text-light-four opacity-40" />
									<Text variant="body-base" class="mt-2 text-xs font-bold"
										>No hay desglose de lotes disponible</Text
									>
								</div>
							{/if}
						</section>
					</div>
				</div>
			</div>

			<!-- Footer Actions -->
			<div class="border-t border-light-four bg-light-one_d px-8 py-6">
				<div class="flex items-center justify-end gap-3">
					<Button variant="outline" onclick={onClose} class="font-bold tracking-widest uppercase">
						Cerrar
					</Button>
					<Button
						variant="primary"
						class="font-black tracking-widest uppercase"
						onclick={() => {
							onClose();
							// Navigate or trigger edit action
						}}
					>
						Gestionar Inventario
					</Button>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Custom styles if needed beyond Tailwind */
	:global(body.overflow-hidden) {
		overflow: hidden;
	}
</style>
