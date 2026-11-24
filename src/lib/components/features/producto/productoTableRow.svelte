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
		LoaderIcon
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

	let showPresentaciones = $state(false);
	let popoverTop = $state(0);
	let popoverLeft = $state(0);

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

	function openPopover(e: Event) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		popoverTop = rect.top - 8;
		popoverLeft = rect.left + rect.width / 2;
		showPresentaciones = true;
	}
</script>

<tr class="group transition-colors hover:bg-acero-50/70">
	<td class="px-4 py-3">
		<div class="flex min-w-[14rem] items-center gap-3">
			{#if producto.imagen_url}
				<img
					src={producto.imagen_url}
					alt=""
					class="size-10 shrink-0 rounded-md border border-acero-100 object-cover"
					loading="lazy"
				/>
			{:else}
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-md bg-acero-100 text-acero-400"
					aria-hidden="true"
				>
					<PhotoIcon class="size-5" />
				</div>
			{/if}
			<div class="min-w-0">
				<button
					type="button"
					onclick={() => onView?.(producto)}
					class="text-left leading-snug font-semibold text-acero-950 decoration-acero-300 underline-offset-2 hover:underline"
				>
					{producto.nombre_comercial}
				</button>
				<p class="flex flex-wrap items-center gap-x-2 text-sm text-acero-500">
					{#if producto.codigo_barras}<span class="tabular-nums">{producto.codigo_barras}</span
						>{/if}
					{#if producto.unidad_medida?.nombre}<span>{producto.unidad_medida.nombre}</span>{/if}
					{#if producto.maneja_vencimiento}
						<span class="rounded bg-aceite-tinte px-1.5 text-xs font-semibold text-aceite-oscuro"
							>Con vencimiento</span
						>
					{/if}
				</p>
			</div>
		</div>
	</td>
	<td class="px-4 py-3">
		<p class="text-acero-900">{producto.marca?.nombre || '—'}</p>
		<p class="text-sm text-acero-500">{producto.categoria?.nombre || 'Sin categoría'}</p>
	</td>
	<td class="hidden min-w-[10rem] px-4 py-3 text-acero-700 xl:table-cell"
		>{producto.proveedor?.nombre || '—'}</td
	>
	<td class="hidden px-4 py-3 lg:table-cell">
		{#if producto.ubicacion}
			<p class="whitespace-nowrap text-acero-900">{producto.ubicacion.nombre}</p>
			<p class="text-sm text-acero-500">{producto.ubicacion.tipo_area}</p>
		{:else}
			<span class="text-acero-400">—</span>
		{/if}
	</td>
	<td class="px-4 py-3 text-right whitespace-nowrap">
		<p
			class="inline-flex items-center gap-1.5 font-display text-xl font-semibold tabular-nums {nivel ===
			'agotado'
				? 'text-marca'
				: nivel === 'bajo'
					? 'text-aceite-oscuro'
					: 'text-acero-950'}"
		>
			{#if nivel !== 'ok'}
				<span
					class="size-2 rounded-full {nivel === 'agotado' ? 'bg-marca' : 'bg-aceite'}"
					aria-hidden="true"
				></span>
			{/if}
			{producto.stock_actual}
		</p>
		<p class="text-xs text-acero-500 tabular-nums">
			{#if nivel === 'agotado'}Agotado ·
			{:else if nivel === 'bajo'}Stock bajo ·
			{/if}mín. {producto.stock_minimo}
		</p>
	</td>
	<td class="hidden px-4 py-3 md:table-cell">
		{#if presentaciones.length > 0}
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-md border border-acero-200 bg-white px-2.5 py-1 text-sm font-semibold whitespace-nowrap text-acero-800 transition-colors hover:border-acero-300 hover:bg-acero-50"
				onmouseenter={openPopover}
				onfocus={openPopover}
				onmouseleave={() => (showPresentaciones = false)}
				onblur={() => (showPresentaciones = false)}
				onclick={() => onManagePresentaciones?.(producto)}
				aria-label="{presentaciones.length} presentaciones de {producto.nombre_comercial}. Abrir para administrarlas"
			>
				<BoxIcon class="size-4 text-acero-400" />
				{presentaciones.length}
				{presentaciones.length === 1 ? 'presentación' : 'presentaciones'}
			</button>

			{#if showPresentaciones}
				<div
					class="pointer-events-none fixed z-50 w-72 -translate-x-1/2 -translate-y-full rounded-lg border border-acero-200 bg-white p-3 text-left shadow-[0_16px_40px_-16px_rgb(23_26_31/0.4)]"
					style="top: {popoverTop}px; left: {popoverLeft}px;"
					role="tooltip"
				>
					<ul class="divide-y divide-acero-100">
						{#each presentaciones as pres (pres.id)}
							<li class="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
								<div class="min-w-0">
									<p class="truncate font-semibold text-acero-950">{pres.nombre}</p>
									<p class="text-xs text-acero-500">
										×{pres.factor_conversion}
										{#if pres.codigo_barras}· <span class="tabular-nums">{pres.codigo_barras}</span
											>{/if}
										{#if !pres.esta_activo}· <span class="text-marca">Inactiva</span>{/if}
									</p>
								</div>
								<span class="shrink-0 font-semibold text-acero-950 tabular-nums"
									>Bs {pres.precio_especial}</span
								>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		{:else}
			<span class="text-sm text-acero-400">Solo unidad</span>
		{/if}
	</td>
	<td class="px-2 py-3 text-center">
		<button
			bind:this={triggerElement}
			type="button"
			class="inline-flex size-9 items-center justify-center rounded-md text-acero-500 transition-colors hover:bg-acero-100 hover:text-acero-950"
			onclick={() => (isDropdownOpen = !isDropdownOpen)}
			aria-label="Acciones para {producto.nombre_comercial}"
			aria-haspopup="menu"
			aria-expanded={isDropdownOpen}
			disabled={isFetching}
		>
			{#if isFetching}
				<LoaderIcon class="size-5 animate-spin" />
			{:else}
				<DotsVerticalIcon class="size-5" />
			{/if}
		</button>
		<DropdownMenu
			bind:isOpen={isDropdownOpen}
			{triggerElement}
			options={dropdownOptions}
			width={200}
		/>
	</td>
</tr>
