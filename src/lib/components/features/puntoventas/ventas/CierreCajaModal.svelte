<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { LockIcon, XIcon } from '$lib/icons/outline';
	import { CoinIcon } from '$lib/icons/solid';
	import { Button, Input } from '$lib/components/ui';
	import type { SesionCaja, ResumenVentasSesion } from '$lib/interfaces/venta.interface';

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
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
	transition:fade
>
	<div
		class="w-full max-w-md overflow-hidden rounded-3xl border border-light-four bg-light-one shadow-2xl"
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

		<div class="space-y-5 p-6">
			{#if sesionActiva}
				<div
					class="rounded-2xl border border-light-one_d bg-light-one_d/10 p-5 font-mono text-sm"
				>
					{#if cargandoCierre}
						<div class="py-4 text-center text-sm text-light-five">Calculando totales...</div>
					{:else if resumenCierrePrevio}
						<div class="space-y-2.5">
							<div class="flex justify-between text-light-five">
								<span>Apertura:</span><span class="text-light-black"
									>{fmt(parseFloat(sesionActiva.monto_apertura))}</span
								>
							</div>
							<div class="flex justify-between text-light-success">
								<span class="font-medium">Ventas efectivo (+):</span><span class="font-bold"
									>{fmt(resumenCierrePrevio.total_efectivo)}</span
								>
							</div>
							<div
								class="flex justify-between border-t border-light-one_d pt-3 font-bold text-light-black"
							>
								<span>TOTAL ESPERADO:</span><span class="text-lg"
									>{fmt(
										parseFloat(sesionActiva.monto_apertura) + resumenCierrePrevio.total_efectivo
									)}</span
								>
							</div>
						</div>
					{/if}
				</div>
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
