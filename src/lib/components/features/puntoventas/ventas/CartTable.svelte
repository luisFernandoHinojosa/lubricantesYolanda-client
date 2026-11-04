<script lang="ts">
	import { fly } from 'svelte/transition';
	import { ScanBarcodeIcon, MinusIcon, PlusIcon, XMarkIcon } from '$lib/icons/outline';
	import type { CartItem } from '$lib/interfaces/venta.interface';
	import { Button } from '$lib/components/ui';

	interface Props {
		carrito: CartItem[];
		itemRecienAgregado: string | null;
		onCambiarCantidad: (cartId: string, delta: number) => void;
		onSetCantidad: (cartId: string, nueva: number) => void;
		onEliminarItem: (cartId: string) => void;
		onSetDescuentoItem: (cartId: string, monto: number) => void;
		onActualizarSerie: (cartId: string, serie: string) => void;
		fmt: (n: number) => string;
	}

	let {
		carrito,
		itemRecienAgregado,
		onCambiarCantidad,
		onSetCantidad,
		onEliminarItem,
		onSetDescuentoItem,
		onActualizarSerie,
		fmt
	}: Props = $props();

	const PALABRAS_POR_LINEA = 4;

	// El nombre se muestra completo, partido en líneas de hasta 4 palabras
	function lineasNombre(nombre: string): string[] {
		const palabras = nombre.trim().split(/\s+/);
		const lineas: string[] = [];
		for (let i = 0; i < palabras.length; i += PALABRAS_POR_LINEA) {
			lineas.push(palabras.slice(i, i + PALABRAS_POR_LINEA).join(' '));
		}
		return lineas;
	}
</script>

<div class="flex min-h-0 min-w-0 flex-1 flex-col">
	<!-- Cabecera columnas -->
	<div
		class="grid shrink-0 grid-cols-[2.5rem_1fr_8rem_7rem_6.5rem_6.5rem_7rem_3rem] border-b-2 border-light-four bg-light-one px-4 text-xs font-bold tracking-widest text-light-black uppercase"
	>
		<div class="py-3 text-center">#</div>
		<div class="py-3 pl-2">Producto</div>
		<div class="py-3 text-center">Unidad medida</div>
		<div class="py-3 text-center">Cantidad</div>
		<div class="py-3 pr-3 text-right">P. Unit.</div>
		<div class="py-3 text-center">Desc. Bs</div>
		<div class="py-3 pr-3 text-right">Total</div>
		<div class="py-3"></div>
	</div>

	<!-- Filas -->
	<div class="flex-1 overflow-y-auto">
		{#if carrito.length === 0}
			<div class="flex h-full flex-col items-center justify-center gap-4 select-none">
				<div class="flex h-24 w-24 items-center justify-center rounded-3xl">
					<ScanBarcodeIcon class="h-12 w-12 text-light-five" />
				</div>
				<p class="font-bold tracking-widest text-light-five">ESPERANDO PRODUCTO</p>
				<p class=" text-light-five">Escanee un código o use la búsqueda por texto</p>
			</div>
		{:else}
			{#each carrito as item, idx (item.cartId)}
				<div
					class="group grid grid-cols-[2.5rem_1fr_8rem_7rem_6.5rem_6.5rem_7rem_3rem] items-center border-b border-light-five px-4 transition-colors hover:bg-light-one_d {itemRecienAgregado ===
					item.cartId
						? 'bg-light-success'
						: 'bg-light-one'}"
					in:fly={{ y: -6, duration: 150 }}
				>
					<!-- # -->
					<div class="py-3.5 text-center font-mono font-bold text-light-black">
						{idx + 1}
					</div>

					<!-- Nombre -->
					<div class="min-w-0 py-3.5 pl-2">
						<p class="font-bold wrap-break-word text-light-black" title={item.nombre_comercial}>
							{#each lineasNombre(item.nombre_comercial) as linea, i (i)}
								<span class="block">{linea}</span>
							{/each}
						</p>
						<div class="mt-1 flex flex-wrap items-center gap-1.5">
							{#if item.nombre_presentacion}
								<span class="rounded-md bg-light-accent px-1.5 py-0.5 font-bold text-light-two"
									>{item.nombre_presentacion}</span
								>
							{/if}
							{#if item.maneja_serie}
								<input
									placeholder="Nº Serie..."
									value={item.numero_serie}
									oninput={(e) =>
										onActualizarSerie(item.cartId, (e.target as HTMLInputElement).value)}
									class="mt-1 w-32 rounded-lg border px-2 py-0.5 transition outline-none {item.numero_serie
										? 'border-emerald-300 bg-emerald-50 text-emerald-800'
										: 'animate-pulse border-amber-300 bg-amber-50 text-amber-800'}"
								/>
							{/if}
						</div>
					</div>

					<!-- Unidad medida -->
					<div class="flex items-center justify-center py-3.5">
						<p class="truncate font-bold text-light-black">
							{item.unidad_medida_nombre} ({item.unidad_medida_abreviatura})
						</p>
					</div>

					<!-- Cantidad -->
					<div class="flex items-center justify-center py-3.5">
						<div
							class="flex items-center overflow-hidden rounded-xl border border-light-four bg-light-three"
						>
							<button
								onclick={() => onCambiarCantidad(item.cartId, -1)}
								class="flex h-7 w-7 items-center justify-center font-bold text-light-one transition hover:bg-light-three_d hover:text-light-one_d"
							>
								<MinusIcon class="h-4 w-4" />
							</button>
							<input
								type="number"
								step="any"
								value={item.cantidad}
								oninput={(e) =>
									onSetCantidad(item.cartId, parseFloat((e.target as HTMLInputElement).value))}
								class="w-20 border-x border-x-light-four border-t-transparent border-b-transparent bg-transparent text-center text-xl leading-7 font-bold text-light-one ring-0 outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
							/>
							<button
								onclick={() => onCambiarCantidad(item.cartId, 1)}
								class="flex h-7 w-7 items-center justify-center font-bold text-light-one transition hover:bg-light-three_d hover:text-light-one_d"
							>
								<PlusIcon class="h-4 w-4" />
							</button>
						</div>
					</div>

					<!-- P. Unit -->
					<div class="py-3.5 pr-3 text-right text-light-black">
						{fmt(item.precio_unitario)}
					</div>

					<!-- Descuento en Bs -->
					<div class="flex items-center justify-center py-3.5">
						<input
							type="number"
							min="0"
							step="0.01"
							placeholder="0.00"
							value={item.monto_descuento || ''}
							oninput={(e) => {
								const input = e.target as HTMLInputElement;
								// Mientras se escribe un decimal incompleto ("1.") no se pisa lo tecleado
								if (input.validity.badInput) return;
								onSetDescuentoItem(item.cartId, parseFloat(input.value));
							}}
							class="w-24 rounded-lg border px-2 py-1 text-right font-mono outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none {item.monto_descuento >
							0
								? 'border-light-error/40 bg-light-error/5 text-light-error'
								: 'border-light-four bg-light-one text-light-black'}"
						/>
					</div>

					<!-- Subtotal -->
					<div class="py-3.5 pr-3 text-right text-light-black">
						{fmt(item.subtotal)}
					</div>

					<!-- Acciones -->
					<div class="flex items-center justify-center py-3.5">
						<Button onclick={() => onEliminarItem(item.cartId)} variant="ghost" size="xs">
							<XMarkIcon class="h-5 w-5" />
						</Button>
					</div>
				</div>
			{/each}
		{/if}
	</div>

</div>
