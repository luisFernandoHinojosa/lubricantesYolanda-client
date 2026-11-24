<script lang="ts">
	import { ScanBarcodeIcon, MinusIcon, PlusIcon, TrashIcon } from '$lib/icons/outline';
	import type { CartItem } from '$lib/interfaces/venta.interface';

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

	const SIN_SPIN =
		'[&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]';
</script>

<section
	class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-acero-200 bg-white"
	aria-label="Productos en la venta"
>
	{#if carrito.length === 0}
		<div
			class="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center select-none"
		>
			<div
				class="flex size-16 items-center justify-center rounded-full bg-acero-100 text-acero-500"
			>
				<ScanBarcodeIcon class="size-8" />
			</div>
			<div>
				<p class="font-display text-xl font-semibold text-acero-900">
					Escanee un producto para empezar
				</p>
				<p class="mt-1 max-w-sm text-sm text-acero-500">
					O cambie a <span class="font-semibold text-acero-700">Buscar</span> para encontrarlo por
					nombre. Cuando esté listo, cobre con
					<kbd
						class="rounded border border-acero-300 bg-acero-50 px-1.5 py-0.5 text-xs font-semibold text-acero-700"
						>F2</kbd
					>.
				</p>
			</div>
		</div>
	{:else}
		<div class="min-h-0 flex-1 overflow-auto">
			<table class="w-full border-separate border-spacing-0 text-[0.9375rem]">
				<thead class="sticky top-0 z-10 bg-acero-50 text-left text-sm text-acero-600">
					<tr class="[&>th]:border-b [&>th]:border-acero-200 [&>th]:py-2.5 [&>th]:font-semibold">
						<th scope="col" class="w-10 pl-4 text-center"><span class="sr-only">Número</span>#</th>
						<th scope="col" class="px-3">Producto</th>
						<th scope="col" class="hidden px-3 2xl:table-cell">Unidad</th>
						<th scope="col" class="px-2 text-center">Cantidad</th>
						<th scope="col" class="hidden px-3 text-right lg:table-cell">Precio</th>
						<th scope="col" class="px-2 text-right">Descuento</th>
						<th scope="col" class="px-3 text-right">Importe</th>
						<th scope="col" class="w-12 pr-3"><span class="sr-only">Quitar</span></th>
					</tr>
				</thead>
				<tbody>
					{#each carrito as item, idx (item.cartId)}
						{@const recien = itemRecienAgregado === item.cartId}
						<tr
							class="align-top transition-colors duration-500 [&>td]:border-b [&>td]:border-acero-100 {recien
								? 'bg-ok-tinte'
								: 'hover:bg-acero-50/70'}"
						>
							<td class="py-3 pl-4 text-center text-sm font-semibold text-acero-400 tabular-nums">
								{idx + 1}
							</td>

							<td class="min-w-[11rem] px-3 py-3">
								<p class="leading-snug font-semibold text-acero-950" title={item.nombre_comercial}>
									{#each lineasNombre(item.nombre_comercial) as linea, i (i)}
										<span class="block">{linea}</span>
									{/each}
								</p>
								<div
									class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-acero-500"
								>
									{#if item.nombre_presentacion}
										<span
											class="rounded bg-acero-100 px-1.5 py-0.5 text-xs font-semibold text-acero-700"
											>{item.nombre_presentacion}</span
										>
									{/if}
									<span class="2xl:hidden">{item.unidad_medida_nombre}</span>
									<span class="tabular-nums lg:hidden">· {fmt(item.precio_unitario)} c/u</span>
								</div>
								{#if item.maneja_serie}
									<label class="mt-2 flex items-center gap-2 text-sm">
										<span class="text-acero-600">N.º de serie</span>
										<input
											placeholder="Obligatorio"
											value={item.numero_serie}
											oninput={(e) =>
												onActualizarSerie(item.cartId, (e.target as HTMLInputElement).value)}
											aria-invalid={!item.numero_serie ? 'true' : undefined}
											class="h-8 w-40 rounded-md border px-2 text-sm outline-none focus:ring-[3px] {item.numero_serie
												? 'border-acero-200 bg-white text-acero-950 focus:ring-acero-200'
												: 'border-aceite bg-aceite-tinte text-acero-950 placeholder:text-aceite-oscuro focus:ring-aceite/30'}"
										/>
									</label>
								{/if}
							</td>

							<td class="hidden px-3 py-3 text-acero-700 2xl:table-cell">
								{item.unidad_medida_nombre}
								<span class="text-acero-400">({item.unidad_medida_abreviatura})</span>
							</td>

							<td class="px-2 py-2.5">
								<div
									class="mx-auto flex w-fit items-center rounded-lg border border-acero-200 bg-white"
									role="group"
									aria-label="Cantidad de {item.nombre_comercial}"
								>
									<button
										type="button"
										onclick={() => onCambiarCantidad(item.cartId, -1)}
										class="flex size-9 items-center justify-center rounded-l-lg text-acero-600 transition-colors hover:bg-acero-100 hover:text-acero-950"
										aria-label="Restar uno"
									>
										<MinusIcon class="size-4" />
									</button>
									<input
										type="number"
										step="any"
										min="0"
										value={item.cantidad}
										oninput={(e) =>
											onSetCantidad(item.cartId, parseFloat((e.target as HTMLInputElement).value))}
										aria-label="Cantidad"
										class="h-9 w-14 border-x border-y-0 border-acero-200 bg-transparent px-1 text-center font-display text-lg font-semibold text-acero-950 tabular-nums outline-none focus:bg-acero-50 focus:ring-0 {SIN_SPIN}"
									/>
									<button
										type="button"
										onclick={() => onCambiarCantidad(item.cartId, 1)}
										class="flex size-9 items-center justify-center rounded-r-lg text-acero-600 transition-colors hover:bg-acero-100 hover:text-acero-950"
										aria-label="Sumar uno"
									>
										<PlusIcon class="size-4" />
									</button>
								</div>
								{#if item.cantidad >= item.stock_disponible}
									<p class="mt-1 text-center text-xs text-aceite-oscuro">
										Máx. {item.stock_disponible}
									</p>
								{/if}
							</td>

							<td class="hidden px-3 py-3 text-right text-acero-700 tabular-nums lg:table-cell">
								{fmt(item.precio_unitario)}
							</td>

							<td class="px-2 py-2.5 text-right">
								<label class="relative ml-auto block w-24">
									<span class="sr-only">Descuento en bolivianos para {item.nombre_comercial}</span>
									<span
										class="pointer-events-none absolute inset-y-0 left-2 flex items-center text-xs text-acero-400"
										aria-hidden="true">Bs</span
									>
									<input
										type="number"
										min="0"
										step="0.01"
										placeholder="0,00"
										value={item.monto_descuento || ''}
										oninput={(e) => {
											const input = e.target as HTMLInputElement;
											// Mientras se escribe un decimal incompleto ("1.") no se pisa lo tecleado
											if (input.validity.badInput) return;
											onSetDescuentoItem(item.cartId, parseFloat(input.value));
										}}
										class="h-9 w-full rounded-md border pr-2 pl-7 text-right text-sm tabular-nums outline-none focus:ring-[3px] {SIN_SPIN} {item.monto_descuento >
										0
											? 'border-marca/40 bg-marca-tinte font-semibold text-marca-oscuro focus:ring-marca-tinte'
											: 'border-acero-200 bg-white text-acero-950 placeholder:text-acero-300 focus:border-acero-600 focus:ring-acero-200'}"
									/>
								</label>
							</td>

							<td class="px-3 py-3 text-right whitespace-nowrap">
								<span class="font-display text-lg font-semibold text-acero-950 tabular-nums">
									{fmt(item.subtotal)}
								</span>
								{#if item.monto_descuento > 0}
									<span class="block text-xs text-acero-400 tabular-nums line-through">
										{fmt(item.precio_unitario * item.cantidad)}
									</span>
								{/if}
							</td>

							<td class="py-2.5 pr-3 text-right">
								<button
									type="button"
									onclick={() => onEliminarItem(item.cartId)}
									class="inline-flex size-9 items-center justify-center rounded-md text-acero-400 transition-colors hover:bg-marca-tinte hover:text-marca"
									aria-label="Quitar {item.nombre_comercial}"
									title="Quitar de la venta"
								>
									<TrashIcon class="size-[18px]" />
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
