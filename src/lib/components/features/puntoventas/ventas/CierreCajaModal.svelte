<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { LockIcon, XIcon } from '$lib/icons/outline';
	import { CoinIcon } from '$lib/icons/solid';
	import { Button, Input } from '$lib/components/ui';
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

	const apertura = $derived(sesionActiva ? parseFloat(sesionActiva.monto_apertura) : 0);
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
	transition:fade
>
	<div
		class="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-light-four bg-light-one shadow-2xl"
		transition:scale={{ duration: 200 }}
	>
		<div class="flex items-center justify-between border-b border-light-four p-4">
			<div class="flex items-center gap-3">
				<div class="= flex h-9 w-9 items-center justify-center">
					<LockIcon class="h-6 w-6 text-light-three" />
				</div>
				<h3 class="font-bold text-light-black">Cierre de Caja — Arqueo</h3>
			</div>
			<Button onclick={onCerrar} variant="ghost"><XIcon class="h-5 w-5" /></Button>
		</div>

		<div class="space-y-5 overflow-y-auto p-6">
			{#if sesionActiva}
				{#if cargandoCierre}
					<div
						class="rounded-2xl border border-light-one_d bg-light-one_d/10 p-5 py-8 text-center text-sm text-light-five"
					>
						Calculando totales...
					</div>
				{:else if resumenCierrePrevio}
					{@const r = resumenCierrePrevio}
					<div class="space-y-4 text-sm">
						<!-- KPIs -->
						<div class="grid grid-cols-2 gap-3">
							<div class="rounded-2xl border border-light-one_d bg-light-one_d/10 p-4">
								<p class="text-xs text-light-five">Ventas realizadas</p>
								<p class="text-2xl font-bold text-light-black">{r.cantidad_ventas}</p>
							</div>
							<div class="rounded-2xl border border-light-one_d bg-light-one_d/10 p-4">
								<p class="text-xs text-light-five">Gran total</p>
								<p class="text-2xl font-bold text-light-black">{fmt(r.gran_total)}</p>
							</div>
						</div>

						<!-- Totales por método de pago -->
						<div class="rounded-2xl border border-light-one_d bg-light-one_d/10 p-4">
							<p class="mb-2 text-xs font-semibold tracking-wide text-light-five uppercase">
								Por método de pago
							</p>
							<div class="space-y-1.5 font-mono">
								{#each METODOS as m (m.key)}
									{@const monto = r.totales_por_metodo?.[m.key] ?? 0}
									<div
										class="flex justify-between {monto > 0
											? 'text-light-black'
											: 'text-light-five'}"
									>
										<span>{m.label}</span><span class={monto > 0 ? 'font-semibold' : ''}
											>{fmt(monto)}</span
										>
									</div>
								{/each}
							</div>
						</div>

						<!-- Ajustes y movimientos -->
						<div class="grid grid-cols-3 gap-3 text-center">
							<div class="rounded-2xl border border-light-one_d bg-light-one_d p-3">
								<p class="text-xs text-light-five">Anuladas</p>
								<p class="text-lg font-bold text-light-black">{r.cantidad_anuladas}</p>
							</div>
							<div class="rounded-2xl border border-light-one_d bg-light-one_d/10 p-3">
								<p class="text-xs text-light-five">Devoluciones</p>
								<p class="text-lg font-bold text-light-black">{r.cantidad_devoluciones}</p>
							</div>
							<div class="rounded-2xl border border-light-one_d bg-light-one_d/10 p-3">
								<p class="text-xs text-light-five">Cambios</p>
								<p class="text-lg font-bold text-light-black">{r.cantidad_cambios}</p>
							</div>
						</div>

						<div
							class="space-y-1.5 rounded-2xl border border-light-one_d bg-light-one_d/10 p-4 font-mono"
						>
							<div class="flex justify-between text-light-five">
								<span>Descuentos aplicados</span><span class="text-light-black"
									>{fmt(r.total_descuentos)}</span
								>
							</div>
							<div class="flex justify-between text-light-five">
								<span>Total reembolsado</span><span class="text-light-black"
									>{fmt(r.total_reembolsado)}</span
								>
							</div>
							<div class="flex justify-between text-light-five">
								<span>Diferencias cobradas</span><span class="text-light-black"
									>{fmt(r.total_diferencias_cobradas)}</span
								>
							</div>
						</div>

						<!-- Arqueo de efectivo -->
						<div
							class="space-y-2.5 rounded-2xl border border-light-one_d bg-light-one_d/10 p-4 font-mono"
						>
							<div class="flex justify-between text-light-five">
								<span>Apertura:</span><span class="text-light-black">{fmt(apertura)}</span>
							</div>
							<div class="flex justify-between text-light-success">
								<span class="font-medium">Ventas efectivo (+):</span><span class="font-bold"
									>{fmt(r.total_efectivo)}</span
								>
							</div>
							<div
								class="flex justify-between border-t border-light-one_d pt-3 font-bold text-light-black"
							>
								<span>TOTAL ESPERADO:</span><span class="text-lg"
									>{fmt(apertura + r.total_efectivo)}</span
								>
							</div>
						</div>
					</div>
				{/if}
			{/if}

			<div>
				<div class="relative">
					<Input
						label="Conteo físico — ¿Cuánto hay en caja?"
						type="number"
						bind:value={montoCierre}
						placeholder="0.00"
						icon={CoinIcon}
						size="xl"
					/>
				</div>
			</div>

			<Button
				onclick={onCerrarCaja}
				disabled={guardandoCaja || montoCierre === ''}
				variant="primary"
				fullWidth
				loading={guardandoCaja}
			>
				{#snippet leftIcon()}
					<LockIcon class="h-5 w-5" />
				{/snippet}
				Cerrar Turno
			</Button>
		</div>
	</div>
</div>
