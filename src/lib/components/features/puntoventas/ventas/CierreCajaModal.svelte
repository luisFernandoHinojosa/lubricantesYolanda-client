<script lang="ts">
	import { LoaderIcon, LockIcon } from '$lib/icons/outline';
	import { Button, Modal } from '$lib/components/ui';
	import type {
		SesionCaja,
		ResumenVentasSesion,
		MetodoPagoResumen
	} from '$lib/interfaces/venta.interface';

	interface Props {
		sesionActiva: SesionCaja | null;
		montoCierre: string;
		cargandoCierre: boolean;
		resumenCierrePrevio: ResumenVentasSesion | null;
		guardandoCaja: boolean;
		onCerrar: () => void;
		onCerrarCaja: () => void;
		fmt: (n: number) => string;
	}

	let {
		sesionActiva,
		montoCierre = $bindable(),
		cargandoCierre,
		resumenCierrePrevio,
		guardandoCaja,
		onCerrar,
		onCerrarCaja,
		fmt
	}: Props = $props();

	const METODOS: { key: MetodoPagoResumen; label: string }[] = [
		{ key: 'EFECTIVO', label: 'Efectivo' },
		{ key: 'QR', label: 'QR' },
		{ key: 'TARJETA', label: 'Tarjeta' },
		{ key: 'DEPOSITO', label: 'Depósito' },
		{ key: 'CHEQUE', label: 'Cheque' },
		{ key: 'VALES', label: 'Vales' },
		{ key: 'OTROS', label: 'Otros' }
	];

	const apertura = $derived(sesionActiva ? parseFloat(sesionActiva.monto_apertura) || 0 : 0);
	const esperado = $derived(apertura + (resumenCierrePrevio?.total_efectivo ?? 0));
	const conteo = $derived(montoCierre === '' || montoCierre === null ? null : Number(montoCierre));
	// Diferencia del arqueo: positivo = sobra efectivo, negativo = falta
	const diferencia = $derived(conteo === null || Number.isNaN(conteo) ? null : conteo - esperado);
</script>

<Modal
	isOpen={true}
	title="Cerrar caja"
	description="Revise el resumen del turno y cuente el efectivo."
	onClose={onCerrar}
	maxWidth="sm:max-w-lg"
>
	{#if cargandoCierre}
		<div class="flex items-center justify-center gap-2 py-10 text-acero-500" role="status">
			<LoaderIcon class="size-5 animate-spin" /> Calculando totales del turno
		</div>
	{:else if resumenCierrePrevio}
		{@const r = resumenCierrePrevio}
		<div class="space-y-5 text-[0.9375rem]">
			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-lg bg-acero-50 px-4 py-3">
					<p class="text-sm text-acero-500">Ventas del turno</p>
					<p class="font-display text-3xl font-semibold text-acero-950 tabular-nums">
						{r.cantidad_ventas}
					</p>
				</div>
				<div class="rounded-lg bg-acero-50 px-4 py-3">
					<p class="text-sm text-acero-500">Total vendido</p>
					<p class="font-display text-3xl font-semibold text-acero-950 tabular-nums">
						{fmt(r.gran_total)}
					</p>
				</div>
			</div>

			<div>
				<h3 class="mb-1.5 text-sm font-semibold text-acero-900">Cobrado por método de pago</h3>
				<dl class="divide-y divide-acero-100 rounded-lg border border-acero-200">
					{#each METODOS as m (m.key)}
						{@const monto = r.totales_por_metodo?.[m.key] ?? 0}
						{#if monto > 0 || m.key === 'EFECTIVO'}
							<div class="flex justify-between px-3 py-2">
								<dt class="text-acero-700">{m.label}</dt>
								<dd class="font-semibold text-acero-950 tabular-nums">{fmt(monto)}</dd>
							</div>
						{/if}
					{/each}
				</dl>
			</div>

			<dl class="grid grid-cols-3 gap-2 text-center text-sm">
				<div class="rounded-lg border border-acero-200 px-2 py-2">
					<dt class="text-acero-500">Anuladas</dt>
					<dd class="font-display text-xl font-semibold text-acero-950 tabular-nums">
						{r.cantidad_anuladas}
					</dd>
				</div>
				<div class="rounded-lg border border-acero-200 px-2 py-2">
					<dt class="text-acero-500">Devoluciones</dt>
					<dd class="font-display text-xl font-semibold text-acero-950 tabular-nums">
						{r.cantidad_devoluciones}
					</dd>
				</div>
				<div class="rounded-lg border border-acero-200 px-2 py-2">
					<dt class="text-acero-500">Cambios</dt>
					<dd class="font-display text-xl font-semibold text-acero-950 tabular-nums">
						{r.cantidad_cambios}
					</dd>
				</div>
			</dl>

			<dl class="space-y-1 text-sm">
				<div class="flex justify-between text-acero-600">
					<dt>Descuentos aplicados</dt>
					<dd class="text-acero-900 tabular-nums">{fmt(r.total_descuentos)}</dd>
				</div>
				<div class="flex justify-between text-acero-600">
					<dt>Total reembolsado</dt>
					<dd class="text-acero-900 tabular-nums">{fmt(r.total_reembolsado)}</dd>
				</div>
				<div class="flex justify-between text-acero-600">
					<dt>Diferencias cobradas</dt>
					<dd class="text-acero-900 tabular-nums">{fmt(r.total_diferencias_cobradas)}</dd>
				</div>
			</dl>

			<!-- Arqueo de efectivo -->
			<div class="rounded-lg bg-acero-900 p-4 text-acero-300">
				<h3 class="mb-2 text-sm font-semibold text-white">Arqueo de efectivo</h3>
				<dl class="space-y-1 text-sm">
					<div class="flex justify-between">
						<dt>Fondo inicial</dt>
						<dd class="tabular-nums">{fmt(apertura)}</dd>
					</div>
					<div class="flex justify-between">
						<dt>Ventas en efectivo</dt>
						<dd class="tabular-nums">+{fmt(r.total_efectivo)}</dd>
					</div>
					<div
						class="mt-1.5 flex items-baseline justify-between border-t border-acero-700 pt-2 text-white"
					>
						<dt class="font-semibold">Debería haber</dt>
						<dd class="font-display text-2xl font-semibold tabular-nums">{fmt(esperado)}</dd>
					</div>
				</dl>
			</div>
		</div>
	{/if}

	<form
		class="mt-5"
		onsubmit={(e) => {
			e.preventDefault();
			if (montoCierre !== '' && !guardandoCaja) onCerrarCaja();
		}}
	>
		<label for="monto-cierre" class="mb-1.5 block text-sm font-medium text-acero-800">
			Efectivo contado en caja
		</label>
		<div class="relative">
			<span
				class="pointer-events-none absolute inset-y-0 left-4 flex items-center font-display text-xl font-medium text-acero-400"
				aria-hidden="true">Bs</span
			>
			<input
				id="monto-cierre"
				type="number"
				min="0"
				step="0.01"
				inputmode="decimal"
				bind:value={montoCierre}
				placeholder="0,00"
				aria-describedby="arqueo-diferencia"
				class="h-14 w-full rounded-lg border border-acero-200 pr-4 pl-14 text-right font-display text-3xl font-semibold text-acero-950 tabular-nums outline-none placeholder:text-acero-300 focus:border-acero-600 focus:ring-[3px] focus:ring-acero-200"
			/>
		</div>
		<p id="arqueo-diferencia" class="mt-2 min-h-5 text-sm" aria-live="polite">
			{#if diferencia !== null && resumenCierrePrevio}
				{#if Math.abs(diferencia) < 0.005}
					<span class="font-semibold text-ok">La caja cuadra.</span>
				{:else if diferencia > 0}
					<span class="font-semibold text-aceite-oscuro">Sobran {fmt(diferencia)}</span>
					<span class="text-acero-500"> respecto a lo esperado.</span>
				{:else}
					<span class="font-semibold text-marca">Faltan {fmt(-diferencia)}</span>
					<span class="text-acero-500"> respecto a lo esperado.</span>
				{/if}
			{/if}
		</p>

		<div class="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<Button type="button" variant="secondary" onclick={onCerrar} disabled={guardandoCaja}
				>Seguir vendiendo</Button
			>
			<Button
				type="submit"
				variant="primary"
				disabled={guardandoCaja || montoCierre === ''}
				loading={guardandoCaja}
			>
				{#snippet leftIcon()}
					<LockIcon class="size-4" />
				{/snippet}
				Cerrar caja
			</Button>
		</div>
	</form>
</Modal>
