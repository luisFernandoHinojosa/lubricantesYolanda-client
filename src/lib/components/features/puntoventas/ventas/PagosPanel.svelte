<script lang="ts">
	import { ChevronDownIcon, PlusIcon, TrashIcon } from '$lib/icons/outline';
	import { CoinIcon } from '$lib/icons/solid';
	import { Input } from '$lib/components/ui';
	import { METODO_PAGO_FACTURA } from '$lib/constants/dataFacturacion';
	import type { MetodoPagoVenta, PagoVenta } from '$lib/interfaces/venta.interface';
	import { PISTA, SEGMENTO, SEGMENTO_ACTIVO, SEGMENTO_INACTIVO, TITULO_SECCION } from './segmentos';

	// Nombres legibles para los códigos de método de pago
	const NOMBRE_METODO: Record<string, string> = {
		EFECTIVO: 'Efectivo',
		QR: 'QR',
		TARJETA: 'Tarjeta',
		CHEQUE: 'Cheque',
		DEPOSITO: 'Depósito',
		VALES: 'Vales',
		OTROS: 'Otros'
	};
	const nombreMetodo = (m: string) =>
		NOMBRE_METODO[m] ?? m.charAt(0) + m.slice(1).toLowerCase().replaceAll('_', ' ');

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

<section class="space-y-2" aria-labelledby="pos-pago">
	<div class="flex items-center justify-between">
		<h3 id="pos-pago" class={TITULO_SECCION}>Pago</h3>
		<button
			type="button"
			onclick={onAgregarPago}
			class="flex items-center gap-1 rounded px-1 text-sm font-semibold text-acero-700 hover:text-acero-950 hover:underline"
		>
			<PlusIcon class="h-4 w-4" /> Dividir pago
		</button>
	</div>

	{#each pagos as pago, i (i)}
		{@const esSecundario = SECUNDARIOS.includes(pago.metodo_pago)}
		<div class="space-y-1.5 {pagos.length > 1 ? 'rounded-lg border border-acero-200 p-2' : ''}">
			<div class="flex items-center gap-1">
				<div class="{PISTA} flex-1 grid-cols-4" role="radiogroup" aria-label="Método de pago">
					{#each PRINCIPALES as metodo (metodo)}
						<button
							type="button"
							role="radio"
							aria-checked={pago.metodo_pago === metodo}
							onclick={() => (pago.metodo_pago = metodo)}
							class="{SEGMENTO} px-1 {pago.metodo_pago === metodo
								? SEGMENTO_ACTIVO
								: SEGMENTO_INACTIVO}"
						>
							{nombreMetodo(metodo)}
						</button>
					{/each}

					<!-- Select nativo invisible sobre el segmento: teclado y táctil sin componentes extra -->
					<label
						class="{SEGMENTO} relative flex cursor-pointer items-center justify-center gap-0.5 px-1 focus-within:ring-2 focus-within:ring-marca {esSecundario
							? SEGMENTO_ACTIVO
							: SEGMENTO_INACTIVO}"
					>
						<span class="truncate">{esSecundario ? nombreMetodo(pago.metodo_pago) : 'Otro'}</span>
						<ChevronDownIcon className="h-3 w-3 shrink-0" />
						<select
							class="absolute inset-0 cursor-pointer bg-white text-sm font-medium text-acero-950 opacity-0"
							aria-label="Otros métodos de pago"
							value={esSecundario ? pago.metodo_pago : ''}
							onchange={(e) =>
								(pago.metodo_pago = (e.target as HTMLSelectElement).value as MetodoPagoVenta)}
						>
							<option value="" disabled>Otros métodos</option>
							{#each SECUNDARIOS as metodo (metodo)}
								<option value={metodo}>{nombreMetodo(metodo)}</option>
							{/each}
						</select>
					</label>
				</div>
				{#if pagos.length > 1}
					<button
						type="button"
						onclick={() => onRemoverPago(i)}
						class="rounded-md p-1.5 text-acero-400 transition-colors hover:bg-marca-tinte hover:text-marca"
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
					size="sm"
					min="0"
					icon={CoinIcon}
					bind:value={pago.monto}
					oninput={onMontoManual}
					aria-label="Monto recibido en {nombreMetodo(pago.metodo_pago)}"
					placeholder="Monto recibido"
				/>
				<Input
					size="sm"
					aria-label="Referencia del pago"
					bind:value={pago.referencia}
					placeholder={PLACEHOLDER_REFERENCIA[pago.metodo_pago] ?? 'Referencia (opcional)'}
				/>
			</div>
		</div>
	{/each}

	{#if totalFinal > 0 && !completo}
		<p class="flex items-center justify-between text-sm font-semibold text-marca">
			<span>Falta cobrar</span>
			<span class="tabular-nums">{fmt(totalFinal - totalPagado)}</span>
		</p>
	{/if}

	<Input
		size="sm"
		bind:value={notasVenta}
		aria-label="Notas de la venta"
		placeholder="Notas de la venta (opcional)"
	/>
</section>
