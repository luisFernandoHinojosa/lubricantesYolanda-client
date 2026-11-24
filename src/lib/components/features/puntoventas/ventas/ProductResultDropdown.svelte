<script lang="ts">
	import { fly } from 'svelte/transition';
	import { AlertTriangleIcon, LoaderIcon, PackageIcon } from '$lib/icons/outline';
	import type { ProductoPOS } from '$lib/interfaces/venta.interface';
	import { clickOutside } from '$lib/utils';

	interface Props {
		buscando: boolean;
		productos: ProductoPOS[];
		onAgregarAlCarrito: (p: ProductoPOS, id_pres: string | null) => void;
		onCerrar?: () => void;
		fmt: (n: number) => string;
	}

	let { buscando, productos, onAgregarAlCarrito, onCerrar, fmt }: Props = $props();

	let lista = $state<HTMLElement>();

	// Flechas para recorrer resultados; Escape vuelve al buscador
	function onKeydown(e: KeyboardEvent) {
		const botones = Array.from(
			lista?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? []
		);
		const i = botones.indexOf(document.activeElement as HTMLButtonElement);
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			botones[Math.min(i + 1, botones.length - 1)]?.focus();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (i <= 0) document.getElementById('scan-input')?.focus();
			else botones[i - 1]?.focus();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			onCerrar?.();
			document.getElementById('scan-input')?.focus();
		}
	}

	const sinStock = (n: number) => n <= 0;
</script>

<div
	bind:this={lista}
	id="pos-resultados"
	class="absolute inset-x-0 top-full z-30 mt-1.5 max-h-[min(26rem,60vh)] overflow-y-auto rounded-lg border border-acero-200 bg-white shadow-[0_16px_40px_-16px_rgb(23_26_31/0.4)]"
	transition:fly={{ y: -4, duration: 120 }}
	use:clickOutside={{
		callback: () => onCerrar?.(),
		exclude:
			typeof document !== 'undefined'
				? (document.getElementById('scan-input') ?? undefined)
				: undefined
	}}
	onkeydown={onKeydown}
	role="listbox"
	aria-label="Resultados de búsqueda"
	tabindex="-1"
>
	{#if buscando && productos.length === 0}
		<div class="flex items-center justify-center gap-2 py-6 text-sm text-acero-500">
			<LoaderIcon class="size-4 animate-spin" /> Buscando productos
		</div>
	{:else if productos.length === 0}
		<div class="px-5 py-6 text-center text-sm text-acero-500">
			No hay productos con ese nombre o código.
		</div>
	{:else}
		<ul class="divide-y divide-acero-100">
			{#each productos as p (p.id)}
				{@const agotado = !p.disponible || sinStock(p.stock_disponible)}
				{@const bajo = !agotado && p.stock_disponible <= p.stock_minimo}
				<li>
					<button
						type="button"
						role="option"
						aria-selected="false"
						onclick={() => onAgregarAlCarrito(p, null)}
						disabled={agotado}
						class="flex w-full items-center gap-3 px-4 py-2.5 text-left outline-none hover:bg-acero-50 focus-visible:bg-acero-100 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<span
							class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-acero-100 text-acero-400"
							aria-hidden="true"
						>
							{#if p.imagen_url}
								<img src={p.imagen_url} alt="" class="size-full object-cover" loading="lazy" />
							{:else}
								<PackageIcon class="size-4" />
							{/if}
						</span>
						<span class="min-w-0 flex-1">
							<span class="block truncate font-semibold text-acero-950">{p.nombre_comercial}</span>
							<span class="flex items-center gap-2 text-xs text-acero-500">
								{#if p.codigo_barras}<span class="tabular-nums">{p.codigo_barras}</span>{/if}
								{#if p.unidad_medida_nombre}<span>{p.unidad_medida_nombre}</span>{/if}
							</span>
						</span>
						{#if p.alerta_vencimiento}
							<span class="text-aceite-oscuro" title="Tiene lotes por vencer">
								<AlertTriangleIcon class="size-4" />
								<span class="sr-only">Lotes por vencer</span>
							</span>
						{/if}
						<span
							class="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums {agotado
								? 'bg-marca-tinte text-marca-oscuro'
								: bajo
									? 'bg-aceite-tinte text-aceite-oscuro'
									: 'bg-acero-100 text-acero-600'}"
						>
							{agotado ? 'Agotado' : `${p.stock_disponible} en stock`}
						</span>
						<span
							class="w-24 shrink-0 text-right font-display text-lg font-semibold text-acero-950 tabular-nums"
						>
							{fmt(p.precio_venta ?? 0)}
						</span>
					</button>
					{#each p.presentaciones as pres (pres.id)}
						<button
							type="button"
							role="option"
							aria-selected="false"
							onclick={() => onAgregarAlCarrito(p, pres.id)}
							disabled={sinStock(pres.stock_disponible)}
							class="flex w-full items-center gap-3 border-t border-dashed border-acero-100 py-2 pr-4 pl-16 text-left text-sm outline-none hover:bg-acero-50 focus-visible:bg-acero-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<span class="min-w-0 flex-1 truncate text-acero-700">
								<span class="text-acero-400">Presentación</span>
								<span class="font-semibold text-acero-900">{pres.nombre}</span>
							</span>
							<span class="shrink-0 text-xs text-acero-500 tabular-nums"
								>{pres.stock_disponible} disp.</span
							>
							<span class="w-24 shrink-0 text-right font-semibold text-acero-950 tabular-nums">
								{fmt(pres.precio_especial)}
							</span>
						</button>
					{/each}
				</li>
			{/each}
		</ul>
	{/if}
</div>
