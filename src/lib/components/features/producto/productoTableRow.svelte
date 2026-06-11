<script lang="ts">
	import type { Producto } from '$lib/interfaces';
	import {
		PhotoIcon,
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

<tr class="bg-light-one hover:bg-light-one_d">
	<td class=" px-4 py-2 text-center">
		{#if producto.imagen_url}
			<img
				src={producto.imagen_url}
				alt={producto.nombre_comercial}
				class="mx-auto h-10 w-10 rounded-lg object-cover shadow-sm"
			/>
		{:else}
			<div
				class="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-light-three text-light-one"
			>
				<PhotoIcon class="h-5 w-5" />
			</div>
		{/if}
	</td>
	<td class="px-4 py-5 font-medium text-light-black">
		<div class="line-clamp-2">
			{producto.nombre_comercial}
		</div>
		{#if producto.descripcion}
			<div class="mt-1 line-clamp-2 text-xs text-light-two">
				{producto.descripcion}
			</div>
		{/if}
	</td>
	<td class="max-w-[200px] px-4 py-5 font-bold text-light-black">
		<span class="font-semibold text-light-black"
			>{producto.codigo_barras}
			<span class="text-sm"
				><span class="mr-2 text-light-two">Venc:</span>{producto.maneja_vencimiento
					? 'SI'
					: 'NO'}</span
			>
		</span>
	</td>

	<td class="px-4 py-5 text-light-black">{producto.marca?.nombre || '--'}</td>
	<td class="px-4 py-5 text-light-black">{producto.categoria?.nombre || '--'}</td>
	<td class="px-4 py-5 text-light-black">{producto.proveedor?.nombre || '--'}</td>
	<td class="px-4 py-5 text-center text-light-black">
		{#if producto.ubicacion}
			<span class="block font-bold text-light-black">{producto.ubicacion.tipo_area}</span>
			<span class="block text-sm">{producto.ubicacion.nombre}</span>
		{:else}
			--
		{/if}
	</td>
	<td class="px-4 py-5 text-center">
		<div class="flex flex-col items-center justify-center gap-1">
			<span
				class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black {producto.stock_actual <=
				producto.stock_minimo
					? 'bg-red-100 text-red-800'
					: 'bg-green-100 text-green-800'}"
			>
				Actual: {producto.stock_actual}
			</span>
			<span class="text-sm font-bold text-light-black">Mín: {producto.stock_minimo}</span>
		</div>
	</td>
	<td class="px-4 py-5 text-center">
		{#if producto.presentaciones && producto.presentaciones.length > 0}
			<div
				class="flex justify-center"
				onmouseenter={openPopover}
				onmouseleave={() => (showPresentaciones = false)}
				role="button"
				tabindex="0"
			>
				<button
					class="inline-flex cursor-help items-center rounded-xl border border-light-four bg-light-one px-3 py-1 text-xs font-bold text-light-black transition-colors hover:bg-light-one_d"
				>
					{producto.presentaciones.length} Presentaciones
				</button>

				{#if showPresentaciones}
					<div
						class="pointer-events-none fixed z-50 mb-2 w-max -translate-x-1/2 -translate-y-full rounded-2xl border border-light-four bg-white p-4 shadow-xl transition-all duration-100"
						style="top: {popoverTop}px; left: {popoverLeft}px;"
					>
						<div class="flex flex-col gap-3 text-left">
							<div class="text-sm font-black tracking-tight text-light-black uppercase">
								Detalles de Presentaciones
							</div>
							<div class="flex flex-col gap-2">
								{#each producto.presentaciones as pres (pres.id)}
									<div
										class="flex items-center justify-between gap-6 rounded-lg border border-light-four bg-light-one p-2"
									>
										<div class="flex flex-col">
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
											<span class="mt-2 text-sm font-bold text-light-black uppercase">
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
		{:else}
			<span
				class="inline-flex rounded-xl border border-light-four bg-light-one px-3 py-1 text-sm font-bold text-light-black/40"
				>Única Pres.</span
			>
		{/if}
	</td>
	<td class="px-4 py-5 text-center text-light-black"
		>{producto.unidad_medida?.abreviatura || '--'}</td
	>
	<td class="px-4 py-5 text-center">
		<div class="relative flex items-center justify-center">
			<div bind:this={triggerElement} class="inline-block">
				<Button
					variant="ghost"
					class="size-8 p-0! text-light-two hover:bg-light-one_d hover:text-light-black"
					onclick={() => (isDropdownOpen = !isDropdownOpen)}
					loading={isFetching}
				>
					{#snippet leftIcon()}
						<DotsVerticalIcon class="size-5" />
					{/snippet}
				</Button>
			</div>

			<DropdownMenu
				bind:isOpen={isDropdownOpen}
				{triggerElement}
				options={dropdownOptions}
				width={180}
			/>
		</div>
	</td>
</tr>
