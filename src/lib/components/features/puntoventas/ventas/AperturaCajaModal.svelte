<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { WalletIcon } from '$lib/icons/outline';
	import { Button } from '$lib/components/ui';

	interface Props {
		montoApertura: string;
		guardandoCaja: boolean;
		onAbrirCaja: () => void;
	}

	let { montoApertura = $bindable(), guardandoCaja, onAbrirCaja }: Props = $props();

	const montoValido = $derived(
		montoApertura !== '' && montoApertura !== null && Number(montoApertura) >= 0
	);
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-acero-950/55 p-4 backdrop-blur-[2px]"
	transition:fade={{ duration: 150 }}
>
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="apertura-titulo"
		aria-describedby="apertura-desc"
		class="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-[0_24px_60px_-20px_rgb(23_26_31/0.5)]"
		transition:scale={{ duration: 200, start: 0.97, easing: cubicOut }}
	>
		<div class="border-b border-acero-100 px-6 pt-6 pb-5">
			<div class="mb-4 flex size-11 items-center justify-center rounded-lg bg-acero-900 text-white">
				<WalletIcon class="size-6" />
			</div>
			<h2 id="apertura-titulo" class="font-display text-2xl font-semibold text-acero-950">
				Abrir caja
			</h2>
			<p id="apertura-desc" class="mt-1 text-[0.9375rem] text-acero-600">
				Cuente el efectivo que hay en la caja antes de empezar a vender.
			</p>
		</div>

		<form
			class="px-6 pt-5 pb-6"
			onsubmit={(e) => {
				e.preventDefault();
				if (montoValido && !guardandoCaja) onAbrirCaja();
			}}
		>
			<label for="monto-apertura" class="mb-1.5 block text-sm font-medium text-acero-800">
				Fondo inicial en efectivo
			</label>
			<div class="relative mb-5">
				<span
					class="pointer-events-none absolute inset-y-0 left-4 flex items-center font-display text-xl font-medium text-acero-400"
					aria-hidden="true">Bs</span
				>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					id="monto-apertura"
					type="number"
					min="0"
					step="0.01"
					inputmode="decimal"
					autofocus
					placeholder="0,00"
					bind:value={montoApertura}
					class="h-16 w-full rounded-lg border border-acero-200 bg-white pr-4 pl-14 text-right font-display text-4xl font-semibold text-acero-950 tabular-nums outline-none placeholder:text-acero-300 focus:border-acero-600 focus:ring-[3px] focus:ring-acero-200"
				/>
			</div>
			<Button
				type="submit"
				variant="primary"
				size="lg"
				fullWidth
				loading={guardandoCaja}
				disabled={!montoValido}
			>
				Abrir caja
			</Button>
		</form>
	</div>
</div>
