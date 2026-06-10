<script lang="ts">
	import { fly } from 'svelte/transition';
	import { PackageIcon, AlertTriangleIcon } from '$lib/icons/outline';
	import type { ProductoPOS } from '$lib/interfaces/venta.interface';

	interface Props {
		buscando: boolean;
		productos: ProductoPOS[];
		onAgregarAlCarrito: (p: ProductoPOS, id_pres: string | null) => void;
		fmt: (n: number) => string;
	}

	let { buscando, productos, onAgregarAlCarrito, fmt }: Props = $props();
</script>

{#if productos.length > 0 || buscando}
	<div
		class="max-h-60 overflow-y-auto border-b border-slate-200 bg-white shadow-lg"
		transition:fly={{ y: -6, duration: 120 }}
	>
		{#if buscando}
			<div class="flex items-center justify-center py-5 text-sm text-slate-400">
				Buscando productos...
			</div>
		{:else}
			{#each productos as p (p.id)}
				<div class="border-b border-slate-100 last:border-0">
					<button
						onclick={() => onAgregarAlCarrito(p, null)}
						disabled={!p.disponible || p.stock_disponible <= 0}
						class="flex w-full items-center gap-4 px-5 py-3 text-left transition hover:bg-slate-50 disabled:opacity-40"
					>
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400"
						>
							<PackageIcon class="h-4 w-4" />
						</div>
						<span class="flex-1 text-sm font-semibold text-slate-700">{p.nombre_comercial}</span>
						<span class="font-mono text-[11px] text-slate-400">{p.codigo_barras ?? ''}</span>
						<span
							class="rounded-md px-2 py-0.5 text-[10px] font-bold {p.stock_disponible <=
							p.stock_minimo
								? 'bg-red-100 text-red-600'
								: 'bg-slate-100 text-slate-500'}">{p.stock_disponible} uds</span
						>
						{#if p.alerta_vencimiento}<AlertTriangleIcon class="h-3.5 w-3.5 text-amber-500" />{/if}
						<span class="font-mono text-sm font-bold text-emerald-600"
							>{fmt(p.precio_venta ?? 0)}</span
						>
					</button>
					{#each p.presentaciones as pres (pres.id)}
						<button
							onclick={() => onAgregarAlCarrito(p, pres.id)}
							disabled={pres.stock_disponible <= 0}
							class="flex w-full items-center gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-2 pl-20 text-left transition hover:bg-blue-50 disabled:opacity-40"
						>
							<span class="flex-1 text-xs font-medium text-blue-600">{pres.nombre}</span>
							<span
								class="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600"
								>{pres.stock_disponible} disp.</span
							>
							<span class="font-mono text-xs font-bold text-blue-600"
								>{fmt(pres.precio_especial)}</span
							>
						</button>
					{/each}
				</div>
			{/each}
		{/if}
	</div>
{/if}
