<script lang="ts">
	import { LoaderIcon, ScanBarcodeIcon, SearchIcon } from '$lib/icons/outline';
	import type { Snippet } from 'svelte';

	interface Props {
		modoBusqueda: 'ESCANER' | 'TEXTO';
		busqueda: string;
		buscando: boolean;
		onModoBusqueda: (modo: 'ESCANER' | 'TEXTO') => void;
		onBusqueda: (e: Event) => void;
		onBarcode: (e: KeyboardEvent) => void;
		onIrACobrar: () => void;
		setMostrarDropdown: (val: boolean) => void;
		children: Snippet;
	}

	let {
		modoBusqueda = $bindable(),
		busqueda,
		buscando,
		onModoBusqueda,
		onBusqueda,
		onBarcode,
		setMostrarDropdown,
		children
	}: Props = $props();

	const MODOS = [
		{ id: 'ESCANER', label: 'Escáner', icon: ScanBarcodeIcon },
		{ id: 'TEXTO', label: 'Buscar', icon: SearchIcon }
	] as const;

	const esEscaner = $derived(modoBusqueda === 'ESCANER');
</script>

<div class="relative shrink-0 print:hidden">
	<div class="flex items-stretch gap-2">
		<div
			class="flex shrink-0 rounded-lg border border-acero-200 bg-white p-1"
			role="radiogroup"
			aria-label="Modo de búsqueda"
		>
			{#each MODOS as m (m.id)}
				<button
					type="button"
					role="radio"
					aria-checked={modoBusqueda === m.id}
					onclick={() => onModoBusqueda(m.id)}
					class="flex items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors {modoBusqueda ===
					m.id
						? 'bg-acero-900 text-white'
						: 'text-acero-600 hover:bg-acero-100 hover:text-acero-950'}"
				>
					<m.icon class="size-4" />
					<span class="hidden sm:inline">{m.label}</span>
				</button>
			{/each}
		</div>

		<div class="relative min-w-0 flex-1">
			<label for="scan-input" class="sr-only">
				{esEscaner ? 'Código de barras' : 'Buscar producto por nombre o código'}
			</label>
			<span
				class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 {esEscaner
					? 'text-ok'
					: 'text-acero-400'}"
				aria-hidden="true"
			>
				{#if esEscaner}<ScanBarcodeIcon class="size-5" />{:else}<SearchIcon class="size-5" />{/if}
			</span>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				id="scan-input"
				type="text"
				autocomplete="off"
				spellcheck="false"
				value={busqueda}
				oninput={onBusqueda}
				onkeydown={(e) => {
					if (e.key === 'ArrowDown' && !esEscaner) {
						const first = document.querySelector<HTMLButtonElement>(
							'#pos-resultados button:not([disabled])'
						);
						if (first) {
							e.preventDefault();
							first.focus();
							return;
						}
					}
					onBarcode(e);
				}}
				onclick={() => !esEscaner && setMostrarDropdown(true)}
				placeholder={esEscaner
					? 'Escanee o escriba el código y presione Enter'
					: 'Nombre del producto o código'}
				autofocus
				class="block h-12 w-full rounded-lg border border-acero-200 bg-white pr-4 pl-11 text-base text-acero-950 shadow-[inset_0_1px_1px_rgb(23_26_31/0.04)] outline-none placeholder:text-acero-400 hover:border-acero-300 focus:border-acero-600 focus:ring-[3px] focus:ring-acero-200 2xl:pr-44"
			/>
			<span
				class="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-2 pr-3.5 text-xs text-acero-500"
			>
				{#if buscando}
					<LoaderIcon class="size-4 animate-spin" />
					<span>Buscando</span>
				{:else if esEscaner}
					<span class="hidden items-center gap-1.5 2xl:flex">
						<span class="size-1.5 rounded-full bg-ok" aria-hidden="true"></span>Listo para escanear
					</span>
				{/if}
			</span>
		</div>
	</div>
	{@render children()}
</div>
