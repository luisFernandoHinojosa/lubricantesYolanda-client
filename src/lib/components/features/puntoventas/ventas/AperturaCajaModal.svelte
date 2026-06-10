<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { WalletIcon } from '$lib/icons/outline';

	interface Props {
		montoApertura: string;
		guardandoCaja: boolean;
		onAbrirCaja: () => void;
	}

	let { montoApertura = $bindable(), guardandoCaja, onAbrirCaja }: Props = $props();
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
	transition:fade
>
	<div
		class="w-full max-w-sm overflow-hidden rounded-3xl border border-light-one_d bg-light-one shadow-2xl"
		transition:scale={{ duration: 250, easing: cubicOut }}
	>
		<div class="px-8 pt-8 pb-6 text-center">
			<div
				class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-light-success/15 ring-1 ring-light-success/30"
			>
				<WalletIcon class="h-7 w-7 text-light-success" />
			</div>
			<h2 class="text-xl font-bold text-light-black">Apertura de Caja</h2>
			<p class="mt-1 text-sm text-light-five">LUBRICANTES YOLANDA — Sucursal Central</p>
		</div>

		<div class="px-8 pb-8">
			<label class="mb-3 block text-xs font-bold tracking-widest text-light-five uppercase">
				Monto inicial en caja
			</label>
			<div class="relative mb-6">
				<span
					class="absolute top-1/2 left-5 -translate-y-1/2 font-mono text-lg font-bold text-light-five"
					>Bs</span
				>
				<input
					type="number"
					autofocus
					placeholder="0.00"
					bind:value={montoApertura}
					onkeydown={(e) => e.key === 'Enter' && onAbrirCaja()}
					class="w-full rounded-2xl border border-light-one_d bg-light-one py-4 pr-5 pl-16 text-center font-mono text-3xl font-bold text-light-black transition-all duration-200 ease-in-out outline-none placeholder:text-light-one_d focus:border-light-success focus:ring-4 focus:ring-light-success/15"
				/>
			</div>
			<button
				onclick={onAbrirCaja}
				disabled={guardandoCaja || !montoApertura}
				class="flex w-full items-center justify-center gap-2 rounded-2xl bg-light-success py-4 text-base font-bold text-white transition hover:brightness-110 disabled:opacity-40"
			>
				{guardandoCaja ? 'Abriendo turno...' : 'Abrir Caja y Comenzar'}
			</button>
		</div>
	</div>
</div>
