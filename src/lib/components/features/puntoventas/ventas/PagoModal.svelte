<script lang="ts">
	import { fade, scale, fly } from 'svelte/transition';
	import { CreditCardIcon, XIcon } from '$lib/icons/outline';
	import { CoinIcon } from '$lib/icons/solid';
	import { Button, Input } from '$lib/components/ui';

	interface Props {
		totalFinal: number;
		metodoPago: 'EFECTIVO' | 'QR' | 'TARJETA' | 'TRANSFERENCIA';
		montoPagado: string;
		notasVenta: string;
		procesandoVenta: boolean;
		pagoSuficiente: boolean;
		cambio: number;
		onCerrar: () => void;
		onCambiarMetodo: (metodo: 'EFECTIVO' | 'QR' | 'TARJETA' | 'TRANSFERENCIA') => void;
		onFinalizarVenta: () => void;
		fmt: (n: number) => string;
	}

	let {
		totalFinal,
		metodoPago,
		montoPagado = $bindable(),
		notasVenta = $bindable(),
		procesandoVenta,
		pagoSuficiente,
		cambio,
		onCerrar,
		onCambiarMetodo,
		onFinalizarVenta,
		fmt
	}: Props = $props();
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
	transition:fade
>
	<div
		class="w-full max-w-lg overflow-hidden rounded-3xl border border-light-four bg-light-one shadow-2xl"
		transition:scale={{ duration: 200 }}
	>
		<div class="flex items-center justify-between border-b border-light-four px-6 py-5">
			<div class="flex items-center gap-2">
				<div class="flex h-9 w-9 items-center justify-center">
					<CreditCardIcon class="h-6 w-6 text-light-three" />
				</div>
				<h3 class="text-base font-bold text-light-black">Cobrar Venta</h3>
			</div>
			<Button variant="ghost" onclick={onCerrar} size="xs"
				><XIcon class="h-5 w-5" /></Button
			>
		</div>

		<div class="space-y-5 p-6">
			<!-- Total -->
			<div class="bg-light-light-one_d rounded-2xl border border-light-four py-6 text-center">
				<span class="mb-1.5 block text-lg font-bold tracking-widest text-light-success uppercase"
					>Total a cobrar</span
				>
				<span class="font-mono text-5xl font-bold text-light-two drop-shadow-sm"
					>{fmt(totalFinal)}</span
				>
			</div>

			<div>
				<label class="mb-2.5 block text-xs font-bold text-light-black uppercase"
					>Método de pago</label
				>
				<div class="grid grid-cols-4 gap-2">
					{#each ['EFECTIVO', 'QR', 'TARJETA', 'TRANSFERENCIA'] as metodo, index (index)}
						<button
							onclick={() => onCambiarMetodo(metodo as any)}
							class="rounded-xl border py-2.5 text-xs font-bold transition {metodoPago === metodo
								? 'border-light-two bg-light-two text-light-one'
								: 'border-light-four bg-light-one text-light-five hover:border-light-two_d hover:text-light-two'}"
						>
							{metodo}
						</button>
					{/each}
				</div>
			</div>

			<!-- Monto recibido -->
			<div>
				<Input
					type="number"
					label="Monto recibido"
					autofocus
					bind:value={montoPagado}
					placeholder="0.00"
					icon={CoinIcon}
					size="xl"
				/>
			</div>

			<!-- Cambio -->
			{#if montoPagado && parseFloat(montoPagado) > 0}
				<div
					class="rounded-2xl border {parseFloat(montoPagado) >= totalFinal
						? 'bg-light-light-one_d border-light-four'
						: 'bg-light-light-one_d border-light-four'} p-4 text-center"
					transition:fly={{ y: 4, duration: 150 }}
				>
					<span class="text-xs font-bold tracking-widest text-light-black uppercase"
						>Cambio a entregar</span
					>
					<p
						class="font-mono text-3xl font-bold {parseFloat(montoPagado) >= totalFinal
							? 'text-light-success'
							: 'text-light-error'}"
					>
						{fmt(cambio)}
					</p>
				</div>
			{/if}

			<!-- Notas -->
			<Input bind:value={notasVenta} placeholder="Notas u observaciones (opcional)..." />

			<Button
				onclick={onFinalizarVenta}
				disabled={!pagoSuficiente || procesandoVenta}
				variant="primary"
				size="lg"
				fullWidth
				loading={procesandoVenta}
			>
				Confirmar Venta
			</Button>
		</div>
	</div>
</div>
