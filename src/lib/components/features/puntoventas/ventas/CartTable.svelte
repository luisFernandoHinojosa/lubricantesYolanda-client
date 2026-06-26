<script lang="ts">
	import { fly } from 'svelte/transition';
	import { ScanBarcodeIcon, XIcon, PercentIcon, MinusIcon, PlusIcon } from '$lib/icons/outline';
	import type { CartItem } from '$lib/interfaces/venta.interface';
	import { Button } from '$lib/components/ui';

	interface Props {
		carrito: CartItem[];
		itemRecienAgregado: string | null;
		subtotalItems: number;
		montoDescuentoGlobal: number;
		onCambiarCantidad: (cartId: string, delta: number) => void;
		onSetCantidad: (cartId: string, nueva: number) => void;
		onEliminarItem: (cartId: string) => void;
		onAbrirDescuento: (target: 'global' | string) => void;
		onActualizarSerie: (cartId: string, serie: string) => void;
		fmt: (n: number) => string;
	}

	let {
		carrito,
		itemRecienAgregado,
		subtotalItems,
		montoDescuentoGlobal,
		onCambiarCantidad,
		onSetCantidad,
		onEliminarItem,
		onAbrirDescuento,
		onActualizarSerie,
		fmt
	}: Props = $props();
</script>

<div class="flex min-w-0 flex-1 flex-col">
	<!-- Cabecera columnas -->
	<div
		class="grid shrink-0 grid-cols-[2.5rem_1fr_8rem_7rem_6.5rem_7rem_3rem] border-b-2 border-light-four bg-light-one px-4 text-xs font-bold tracking-widest text-light-black uppercase"
	>
		<div class="py-3 text-center">#</div>
		<div class="py-3 pl-2">Producto</div>
		<div class="py-3 text-center">Unidad medida</div>
		<div class="py-3 text-center">Cantidad</div>
		<div class="py-3 pr-3 text-right">P. Unit.</div>
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
					class="group grid grid-cols-[2.5rem_1fr_8rem_7rem_6.5rem_7rem_3rem] items-center border-b border-light-five px-4 transition-colors hover:bg-light-one_d {itemRecienAgregado ===
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
						<p class="truncate font-bold text-light-black">
							{item.nombre_comercial}
						</p>
						<div class="mt-1 flex flex-wrap items-center gap-1.5">
							{#if item.nombre_presentacion}
								<span class="rounded-md bg-light-accent px-1.5 py-0.5 font-bold text-light-two"
									>{item.nombre_presentacion}</span
								>
							{/if}
							{#if item.monto_descuento > 0}
								<span class="rounded-md bg-light-one_d px-1.5 py-0.5 font-bold text-light-error"
									>-{fmt(item.monto_descuento)}</span
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

					<!-- Subtotal -->
					<div class="py-3.5 pr-3 text-right text-light-black">
						{fmt(item.subtotal)}
					</div>

					<!-- Acciones -->
					<div class="flex flex-col items-center justify-center gap-1.5 py-3.5">
						<Button onclick={() => onEliminarItem(item.cartId)} variant="ghost" size="xs">
							<XIcon class="h-5 w-5" />
						</Button>
						<!-- <button
							onclick={() => onAbrirDescuento(item.cartId)}
							class="flex h-6 w-6 items-center justify-center rounded-lg transition {item.monto_descuento >
							0
								? 'bg-light-error/10 text-light-error'
								: 'text-light-two hover:bg-light-accent/10 hover:text-light-two_d'}"
							title="Descuento"
						>
							<PercentIcon class="h-3.5 w-3.5" />
						</button> -->
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<!-- Footer subtotales -->
	{#if carrito.length > 0}
		<div
			class="flex shrink-0 items-center justify-between border-t-2 border-light-one_d bg-light-one px-5 py-3 print:hidden"
		>
			<span class="text-xs font-semibold tracking-wide text-light-black uppercase"
				>{carrito.length} artículo(s) en venta</span
			>
			<div class="flex items-center gap-6 text-sm">
				<span class="text-light-black"
					>Subtotal: <span class="font-mono font-bold text-light-black">{fmt(subtotalItems)}</span
					></span
				>
				{#if montoDescuentoGlobal > 0}
					<span class="font-bold text-light-error"
						>Descuento: <span class="font-mono">-{fmt(montoDescuentoGlobal)}</span></span
					>
				{/if}
			</div>
		</div>
	{/if}
</div>
