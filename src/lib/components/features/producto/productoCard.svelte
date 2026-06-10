<script lang="ts">
	import type { Producto } from '$lib/interfaces';
	import {
		PhotoIcon,
		TagIcon,
		HomeDotIcon,
		ScaleIcon,
		DotsVerticalIcon,
		EyeIcon,
		PencilIcon,
		TrashIcon,
		ArrowsLeftRightIcon,
		BoxIcon
	} from '$lib/icons/outline';
	import { Button, DropdownMenu } from '$lib/components/ui';
	import type { DropdownOption } from '$lib/interfaces';

	interface Props {
		producto: Producto;
		onView?: (p: Producto) => void;
		onEdit?: (id: string) => void;
		onDelete?: (p: Producto) => void;
		onTraslado?: (p: Producto) => void;
		onManagePresentaciones?: (p: Producto) => void;
		isFetching?: boolean;
	}

	let { producto, onView, onEdit, onDelete, onTraslado, onManagePresentaciones, isFetching }: Props = $props();

	let showPresentaciones = $state(false);
	let popoverTop = $state(0);
	let popoverLeft = $state(0);

	let isDropdownOpen = $state(false);
	let triggerElement = $state<HTMLElement>();

	const dropdownOptions: DropdownOption[] = [
		{
			id: 'view',
			label: 'Ver detalles',
			icon: EyeIcon,
			action: () => onView?.(producto)
		},
		{
			id: 'edit',
			label: 'Editar',
			icon: PencilIcon,
			action: () => onEdit?.(producto.id)
		},
		{
			id: 'delete',
			label: 'Eliminar',
			icon: TrashIcon,
			action: () => onDelete?.(producto)
		},
		{
			id: 'traslado',
			label: 'Trasladar',
			icon: ArrowsLeftRightIcon,
			action: () => onTraslado?.(producto)
		},
		{
			id: 'presentaciones',
			label: 'Presentaciones',
			icon: BoxIcon,
			action: () => onManagePresentaciones?.(producto)
		}
	];

	function openPopover(e: MouseEvent) {
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		popoverTop = rect.top - 8;
		popoverLeft = rect.left + rect.width / 2;
		showPresentaciones = true;
	}
</script>

<div
	class="group relative overflow-hidden rounded-xl border border-light-four bg-light-one transition-all hover:shadow-lg"
>
	<div class="relative aspect-video w-full overflow-hidden bg-gray-100">
		{#if producto.imagen_url}
			<img
				src={producto.imagen_url}
				alt={producto.nombre_comercial}
				class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center text-gray-300">
				<PhotoIcon class="h-12 w-12" />
			</div>
		{/if}

		<!-- Action Menu Trigger -->
		<div class="absolute top-2 right-2 z-10">
			<div bind:this={triggerElement} class="inline-block">
				<Button
					variant="ghost"
					class="size-8 rounded-full bg-white/80 p-0! text-light-two shadow-sm backdrop-blur-sm hover:bg-white hover:text-light-black"
					onclick={() => (isDropdownOpen = !isDropdownOpen)}
					loading={isFetching}
				>
					{#snippet leftIcon()}
						<DotsVerticalIcon class="size-4" />
					{/snippet}
				</Button>
			</div>

			<DropdownMenu
				bind:isOpen={isDropdownOpen}
				{triggerElement}
				options={dropdownOptions}
				width={160}
			/>
		</div>

		<!-- Badge for Vencimiento or Serie -->
		<!-- <div class="absolute top-3 right-3 flex flex-col items-center justify-center gap-2">
			{#if producto.maneja_vencimiento}
				<span class="rounded-full bg-light-one px-2 py-1 text-sm font-bold text-light-error">
					VENCIMIENTO <span class="text-light-three">(SI)</span>
				</span>
			{/if}
			{#if producto.maneja_serie}
				<span class="rounded-full bg-light-one px-2 py-1 text-sm font-bold text-light-warning">
					SERIE <span class="text-light-three">(SI)</span>
				</span>
			{/if}
		</div> -->
	</div>

	<!-- Card Content -->
	<div class="p-4">
		<div class="mb-2 flex items-start justify-between gap-2">
			<div>
				<h3 class="line-clamp-2 leading-tight font-bold text-light-black">
					{producto.nombre_comercial}
				</h3>
				<p class="mt-1 font-mono text-xs text-light-two">{producto.codigo_barras || '—'}</p>
			</div>
			<div class="text-right">
				<span class="block text-[0.6rem] font-black text-light-three uppercase tracking-wider"
					>Precio</span
				>
				<span class="text-lg font-black text-emerald-600">
					Bs. {Number(producto.precio_venta || 0).toFixed(2)}
				</span>
			</div>
		</div>

		<div class="space-y-2">
			<div class="flex items-center gap-2">
				<TagIcon class="h-4 w-4 shrink-0 text-light-three" />
				<span class="truncate text-light-black"
					>{producto.marca?.nombre || '--'} • {producto.categoria?.nombre || '--'}</span
				>
			</div>

			<div class="flex items-center gap-2">
				<HomeDotIcon class="h-4 w-4 shrink-0 text-light-three" />
				<span class="truncate text-light-black">
					{#if producto.ubicacion}
						{producto.ubicacion.tipo_area} - {producto.ubicacion.nombre}
					{:else}
						Sin ubicación
					{/if}
				</span>
			</div>

			<div class="flex flex-col items-center justify-between border-t border-light-four pt-2">
				<div class="flex w-full items-center justify-between gap-2">
					<!-- {#if producto.maneja_vencimiento} -->
					<span class="rounded-full bg-light-one px-2 py-1 text-sm font-bold text-light-error">
						VENCIMIENTO <span class="text-light-three"
							>{producto.maneja_vencimiento ? 'SI' : 'NO'}</span
						>
					</span>
				</div>
				<div class="flex w-full items-center justify-between gap-2">
					<div class="flex items-center gap-1.5">
						<div class="rounded p-1 text-light-three">
							<ScaleIcon class="h-4 w-4" />
						</div>
						<span class="font-medium text-light-black">
							{producto.unidad_medida?.abreviatura || '--'}
						</span>
					</div>
					<div class="text-right">
						<span class="block text-sm font-bold text-light-two uppercase">Proveedor</span>
						<span class="block max-w-[100px] truncate font-semibold text-light-black">
							{producto.proveedor?.nombre || '--'}
						</span>
					</div>
				</div>
				<div class="mt-2 flex w-full flex-col gap-1 border-t border-light-four pt-2">
					<div class="flex w-full items-center justify-between">
						<span class="text-sm font-bold text-light-two uppercase">Stock Actual</span>
						<span
							class="rounded-full px-2 py-0.5 text-sm font-black {producto.stock_actual <=
							producto.stock_minimo
								? 'bg-red-100 text-red-800'
								: 'bg-green-100 text-green-800'}"
						>
							{producto.stock_actual}
							{producto.unidad_medida?.abreviatura || ''}
						</span>
					</div>
					<div class="flex w-full items-center justify-between">
						<span class="text-sm font-bold text-light-two uppercase">Stock Mínimo</span>
						<span class="text-sm font-bold text-light-black/50">
							{producto.stock_minimo}
							{producto.unidad_medida?.abreviatura || ''}
						</span>
					</div>
				</div>

				{#if producto.presentaciones && producto.presentaciones.length > 0}
					<div
						class="mt-2 flex w-full items-center justify-between border-t border-light-four pt-3"
					>
						<span class="text-sm font-bold text-light-two uppercase">Presentaciones</span>

						<div
							class="flex justify-end"
							onmouseenter={openPopover}
							onmouseleave={() => (showPresentaciones = false)}
							role="button"
							tabindex="0"
						>
							<button
								class="inline-flex cursor-help items-center rounded-xl border border-light-four bg-light-one px-3 py-1 text-sm font-bold text-light-black transition-colors hover:bg-light-one_d"
							>
								{producto.presentaciones.length} Disp.
							</button>

							{#if showPresentaciones}
								<div
									class="pointer-events-none fixed z-50 mb-2 w-max -translate-x-1/2 -translate-y-full rounded-2xl border border-light-four bg-white p-4 shadow-xl transition-all duration-100"
									style="top: {popoverTop}px; left: {popoverLeft}px;"
								>
									<div class="flex flex-col gap-3 text-left">
										<div
											class="border-b border-light-four pb-2 text-sm font-black tracking-tight text-light-black uppercase"
										>
											Detalles de Presentaciones
										</div>
										<div class="flex flex-col gap-2">
											{#each producto.presentaciones as pres (pres.id)}
												<div
													class="flex items-center justify-between gap-6 rounded-lg border border-light-four bg-light-one p-2"
												>
													<div class="flex flex-col text-left">
														<span class="text-xs font-black text-light-black uppercase"
															>{pres.nombre}</span
														>
														<span class="text-sm font-bold text-light-two">
															SKU: <span class="text-light-black">{pres.sku || 'N/A'}</span> <br />
															Cod. Barras:
															<span class="text-light-black">{pres.codigo_barras || 'N/A'}</span>
														</span>
													</div>
													<div class="flex flex-col items-end text-right">
														<span
															class="rounded-lg bg-emerald-50 px-2 py-1 text-sm font-black text-emerald-600"
															>Bs. {pres.precio_especial}</span
														>
														<span class="mt-2 text-sm font-bold text-light-two uppercase">
															Factor {pres.factor_conversion} X
														</span>
														<span class="mt-2 text-sm font-bold text-light-two uppercase">
															Estado: <span
																class={pres.esta_activo ? 'text-light-success' : 'text-light-error'}
															>
																{pres.esta_activo ? 'Activo' : 'Inactivo'}
															</span>
														</span>
													</div>
												</div>
											{/each}
										</div>
									</div>
									<!-- Arrow -->
									<div
										class="absolute top-full left-1/2 -mt-1 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b border-light-four bg-white"
									></div>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div
						class="mt-2 flex w-full items-center justify-between border-t border-light-four pt-3"
					>
						<span class="text-sm font-bold text-light-two uppercase">Presentaciones</span>
						<span
							class="inline-flex rounded-xl border border-light-four bg-light-one px-3 py-1 text-sm font-bold text-light-black/40"
							>Única Pres.</span
						>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
