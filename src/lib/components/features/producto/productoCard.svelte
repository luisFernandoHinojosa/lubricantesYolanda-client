<script lang="ts">
	import type { Producto } from '$lib/interfaces';
	import {
		PhotoIcon,
		DotsVerticalIcon,
		EyeIcon,
		PencilIcon,
		TrashIcon,
		ArrowsLeftRightIcon,
		BoxIcon,
		LoaderIcon,
		MapPinIcon
	} from '$lib/icons/outline';
	import { DropdownMenu } from '$lib/components/ui';
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

	let {
		producto,
		onView,
		onEdit,
		onDelete,
		onTraslado,
		onManagePresentaciones,
		isFetching
	}: Props = $props();

	let isDropdownOpen = $state(false);
	let triggerElement = $state<HTMLElement>();

	const dropdownOptions: DropdownOption[] = [
		{ id: 'view', label: 'Ver detalle', icon: EyeIcon, action: () => onView?.(producto) },
		{ id: 'edit', label: 'Editar', icon: PencilIcon, action: () => onEdit?.(producto.id) },
		{
			id: 'traslado',
			label: 'Trasladar stock',
			icon: ArrowsLeftRightIcon,
			action: () => onTraslado?.(producto)
		},
		{
			id: 'presentaciones',
			label: 'Presentaciones',
			icon: BoxIcon,
			action: () => onManagePresentaciones?.(producto)
		},
		{
			id: 'delete',
			label: 'Eliminar',
			icon: TrashIcon,
			action: () => onDelete?.(producto),
			divider: true
		}
	];

	const nivel = $derived(
		producto.stock_actual <= 0
			? 'agotado'
			: producto.stock_actual <= producto.stock_minimo
				? 'bajo'
				: 'ok'
	);
	const presentaciones = $derived(producto.presentaciones ?? []);
</script>

<article
	class="flex flex-col overflow-hidden rounded-xl border border-acero-200 bg-white transition-colors hover:border-acero-300"
>
	<div class="relative aspect-[4/3] w-full bg-acero-50">
		{#if producto.imagen_url}
			<img src={producto.imagen_url} alt="" class="size-full object-contain p-3" loading="lazy" />
		{:else}
			<div class="flex size-full items-center justify-center text-acero-300" aria-hidden="true">
				<PhotoIcon class="size-10" />
			</div>
		{/if}
		{#if nivel !== 'ok'}
			<span
				class="absolute top-2 left-2 rounded-md px-2 py-0.5 text-xs font-semibold {nivel ===
				'agotado'
					? 'bg-marca text-white'
					: 'bg-aceite text-acero-950'}"
			>
				{nivel === 'agotado' ? 'Agotado' : 'Stock bajo'}
			</span>
		{/if}
		<button
			bind:this={triggerElement}
			type="button"
			class="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-md bg-white/90 text-acero-600 shadow-sm hover:bg-white hover:text-acero-950"
			onclick={() => (isDropdownOpen = !isDropdownOpen)}
			aria-label="Acciones para {producto.nombre_comercial}"
			aria-haspopup="menu"
			aria-expanded={isDropdownOpen}
			disabled={isFetching}
		>
			{#if isFetching}<LoaderIcon class="size-4 animate-spin" />{:else}<DotsVerticalIcon
					class="size-4"
				/>{/if}
		</button>
		<DropdownMenu
			bind:isOpen={isDropdownOpen}
			{triggerElement}
			options={dropdownOptions}
			width={200}
		/>
	</div>

	<div class="flex flex-1 flex-col p-4">
		<p class="text-sm text-acero-500">
			{producto.marca?.nombre || 'Sin marca'} · {producto.categoria?.nombre || 'Sin categoría'}
		</p>
		<h3 class="mt-0.5 line-clamp-2 leading-snug font-semibold text-acero-950">
			<button type="button" class="text-left hover:underline" onclick={() => onView?.(producto)}>
				{producto.nombre_comercial}
			</button>
		</h3>
		{#if producto.codigo_barras}
			<p class="mt-1 text-sm text-acero-500 tabular-nums">{producto.codigo_barras}</p>
		{/if}

		<div class="mt-auto flex items-end justify-between gap-3 pt-4">
			<div>
				<p class="text-xs text-acero-500">Stock</p>
				<p
					class="font-display text-2xl leading-none font-semibold tabular-nums {nivel === 'agotado'
						? 'text-marca'
						: nivel === 'bajo'
							? 'text-aceite-oscuro'
							: 'text-acero-950'}"
				>
					{producto.stock_actual}
					<span class="font-sans text-sm font-normal text-acero-500"
						>/ mín. {producto.stock_minimo}</span
					>
				</p>
			</div>
			{#if presentaciones.length > 0}
				<button
					type="button"
					onclick={() => onManagePresentaciones?.(producto)}
					class="inline-flex items-center gap-1 rounded-md border border-acero-200 px-2 py-1 text-xs font-semibold text-acero-700 hover:bg-acero-50"
				>
					<BoxIcon class="size-3.5" />
					{presentaciones.length}
					{presentaciones.length === 1 ? 'presentación' : 'presentaciones'}
				</button>
			{/if}
		</div>

		{#if producto.ubicacion || producto.maneja_vencimiento}
			<div
				class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-acero-100 pt-3 text-sm text-acero-600"
			>
				{#if producto.ubicacion}
					<span class="inline-flex items-center gap-1">
						<MapPinIcon class="size-4 text-acero-400" />{producto.ubicacion.nombre}
					</span>
				{/if}
				{#if producto.maneja_vencimiento}
					<span class="rounded bg-aceite-tinte px-1.5 text-xs font-semibold text-aceite-oscuro"
						>Con vencimiento</span
					>
				{/if}
			</div>
		{/if}
	</div>
</article>
