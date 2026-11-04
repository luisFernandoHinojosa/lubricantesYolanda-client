<script lang="ts">
	import { ChevronDownIcon, PlusIcon, TrashIcon } from '$lib/icons/outline';
	import { CoinIcon } from '$lib/icons/solid';
	import { Input } from '$lib/components/ui';
	import { METODO_PAGO_FACTURA } from '$lib/constants/dataFacturacion';
	import type { MetodoPagoVenta, PagoVenta } from '$lib/interfaces/venta.interface';

	interface Props {
		pagos: PagoVenta[];
		notasVenta: string;
		totalFinal: number;
		totalPagado: number;
		cambio: number;
		onAgregarPago: () => void;
		onRemoverPago: (index: number) => void;
		onMontoManual: () => void;
		fmt: (n: number) => string;
	}

	let {
		pagos = $bindable(),
		notasVenta = $bindable(),
		totalFinal,
		totalPagado,
		cambio,
		onAgregarPago,
		onRemoverPago,
		onMontoManual,
		fmt
	}: Props = $props();

	// Ayuda en el input de referencia según el método elegido
	const PLACEHOLDER_REFERENCIA: Partial<Record<MetodoPagoVenta, string>> = {
		QR: 'Nº de transacción',
		TARJETA: 'Nº de voucher',
		CHEQUE: 'Nº de cheque',
		DEPOSITO: 'Nº de comprobante'
	};

	// Los más usados van a un toque; el resto del catálogo SIAT queda en "Más"
	const PRINCIPALES: MetodoPagoVenta[] = ['EFECTIVO', 'QR', 'TARJETA'];
	const SECUNDARIOS = METODO_PAGO_FACTURA.map((m) => m.codigo as MetodoPagoVenta).filter(
		(codigo) => !PRINCIPALES.includes(codigo)
	);

	let completo = $derived(totalPagado >= totalFinal);
</script>

<section class="space-y-2">
	<div class="flex items-center justify-between">
		<h3 class="text-[11px] font-bold tracking-widest text-light-five uppercase">Pago</h3>
		<button
			type="button"
			onclick={onAgregarPago}
			class="flex items-center gap-1 text-xs font-semibold text-light-two hover:underline"
		>
			<PlusIcon class="h-3.5 w-3.5" /> Dividir pago
		</button>
	</div>

	{#each pagos as pago, i (i)}
		{@const esSecundario = SECUNDARIOS.includes(pago.metodo_pago)}
		<div class="space-y-1.5 {pagos.length > 1 ? 'rounded-xl border border-light-four p-2' : ''}">
			<div class="flex items-center gap-1">
				<div
					class="grid flex-1 grid-cols-4 gap-0.5 rounded-lg bg-light-one_d p-0.5"
					role="radiogroup"
					aria-label="Método de pago"
				>
					{#each PRINCIPALES as metodo (metodo)}
						<button
							type="button"
							role="radio"
							aria-checked={pago.metodo_pago === metodo}
							onclick={() => (pago.metodo_pago = metodo)}
							class="rounded-md py-1.5 text-xs font-bold transition {pago.metodo_pago === metodo
								? 'bg-light-two text-light-one shadow-sm'
								: 'text-light-five hover:bg-light-one hover:text-light-black'}"
						>
							{metodo}
						</button>
					{/each}

					<!-- Select nativo invisible sobre el segmento: teclado y táctil sin componentes extra -->
					<label
						class="relative flex cursor-pointer items-center justify-center gap-0.5 rounded-md py-1.5 text-xs font-bold transition {esSecundario
							? 'bg-light-two text-light-one shadow-sm'
							: 'text-light-five hover:bg-light-one hover:text-light-black'}"
					>
						<span class="truncate">{esSecundario ? pago.metodo_pago : 'MÁS'}</span>
						<ChevronDownIcon className="h-3 w-3 shrink-0" />
						<select
							class="absolute inset-0 cursor-pointer bg-light-one text-sm font-medium text-light-black opacity-0"
							aria-label="Otros métodos de pago"
							value={esSecundario ? pago.metodo_pago : ''}
							onchange={(e) =>
								(pago.metodo_pago = (e.target as HTMLSelectElement).value as MetodoPagoVenta)}
						>
							<option value="" disabled>Otros métodos</option>
							{#each SECUNDARIOS as metodo (metodo)}
								<option value={metodo}>{metodo}</option>
							{/each}
						</select>
					</label>
				</div>
				{#if pagos.length > 1}
					<button
						type="button"
						onclick={() => onRemoverPago(i)}
						class="rounded-full p-1 text-light-error transition-colors hover:bg-red-50"
						title="Eliminar método de pago"
						aria-label="Eliminar método de pago"
					>
						<TrashIcon class="h-4 w-4" />
					</button>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-1.5">
				<Input
					type="number"
					size="xs"
					min="0"
					icon={CoinIcon}
					bind:value={pago.monto}
					oninput={onMontoManual}
					placeholder="Monto recibido"
				/>
				<Input
					size="xs"
					bind:value={pago.referencia}
					placeholder={PLACEHOLDER_REFERENCIA[pago.metodo_pago] ?? 'Referencia (opcional)'}
				/>
			</div>
		</div>
	{/each}

	{#if totalFinal > 0}
		<div
			class="flex items-center justify-between text-sm font-bold {completo
				? 'text-emerald-700'
				: 'text-light-error'}"
		>
			<span>{completo ? 'Cambio' : 'Falta'}</span>
			<span class="font-mono">{fmt(completo ? cambio : totalFinal - totalPagado)}</span>
		</div>
	{/if}

	<Input size="xs" bind:value={notasVenta} placeholder="Notas de la venta (opcional)" />
</section>
