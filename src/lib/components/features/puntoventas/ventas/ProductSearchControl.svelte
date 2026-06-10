<script lang="ts">
	import { ScanBarcodeIcon, SearchIcon } from '$lib/icons/outline';
	import { Input } from '$lib/components/ui';
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
		onIrACobrar,
		setMostrarDropdown,
		children
	}: Props = $props();
</script>

<div class="shrink-0 print:hidden">
	<!-- Fila de controles -->
	<div class="flex items-center gap-3 py-3">
		<div class="flex shrink-0 overflow-hidden">
			<button
				onclick={() => onModoBusqueda('ESCANER')}
				class="flex items-center gap-2 px-4 py-2 text-xs font-bold transition {modoBusqueda ===
				'ESCANER'
					? 'bg-light-two text-light-one'
					: 'bg-light-one text-light-two hover:bg-light-one_d'}"
			>
				<ScanBarcodeIcon class="h-3.5 w-3.5" />ESCANEO
			</button>
			<button
				onclick={() => onModoBusqueda('TEXTO')}
				class="flex items-center gap-2 border-l border-light-one_d px-4 py-2 text-xs font-bold transition {modoBusqueda ===
				'TEXTO'
					? 'bg-light-two text-light-one'
					: 'bg-light-one text-light-two hover:bg-light-one_d'}"
			>
				<SearchIcon class="h-3.5 w-3.5" />TEXTO
			</button>
		</div>

		<div class="relative flex-1 rounded-xl transition-all">
			{#if modoBusqueda === 'ESCANER'}
				<ScanBarcodeIcon
					class="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-light-success"
				/>
			{:else}
				<SearchIcon
					class="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-light-accent"
				/>
			{/if}
			<Input
				id="scan-input"
				type="text"
				autocomplete="off"
				value={busqueda}
				oninput={onBusqueda}
				onkeydown={onBarcode}
				placeholder={modoBusqueda === 'ESCANER'
					? 'Escanee código de barras...'
					: 'Buscar por nombre, código...'}
				autofocus
			/>
			{#if buscando}<span
					class="absolute top-1/2 right-3.5 -translate-y-1/2 text-xs text-light-five"
					>buscando...</span
				>{/if}
		</div>

		<!-- <kbd
			class="hidden shrink-0 rounded-lg border border-light-one_d bg-light-one_d/30 px-2.5 py-1 font-mono text-[10px] font-medium text-light-five lg:block"
			>F2 cobrar</kbd
		> -->
	</div>
	{@render children()}
</div>
