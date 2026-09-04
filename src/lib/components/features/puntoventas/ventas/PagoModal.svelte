<script lang="ts">
	import { fade, scale, fly } from 'svelte/transition';
	import { CreditCardIcon, XIcon, PlusIcon, TrashIcon } from '$lib/icons/outline';
	import { CoinIcon } from '$lib/icons/solid';
	import { Button, Input } from '$lib/components/ui';

	type MetodoPago = 'EFECTIVO' | 'QR' | 'TARJETA' | 'TRANSFERENCIA' | 'CHEQUE' | 'OTRO';

	interface Pago {
		metodo_pago: MetodoPago;
		monto: number;
		referencia?: string;
	}

	interface Props {
		totalFinal: number;
		pagos: Pago[];
		notasVenta: string;
		procesandoVenta: boolean;
		pagoSuficiente: boolean;
		cambio: number;
		onCerrar: () => void;
		onFinalizarVenta: () => void;
		fmt: (n: number) => string;
	}

	let {
		totalFinal,
		pagos = $bindable(),
		notasVenta = $bindable(),
		procesandoVenta,
		pagoSuficiente,
		cambio,
		onCerrar,
		onFinalizarVenta,
		fmt
	}: Props = $props();

	function agregarPago() {
		pagos = [...pagos, { metodo_pago: 'EFECTIVO', monto: 0 }];
	}

	function removerPago(index: number) {
		pagos = pagos.filter((_, i) => i !== index);
	}

	let totalPagado = $derived(pagos.reduce((acc, p) => acc + (Number(p.monto) || 0), 0));
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
	transition:fade
>
	<div
		class="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-light-four bg-light-one shadow-2xl"
		transition:scale={{ duration: 200 }}
	>
		<div class="flex items-center justify-between border-b border-light-four px-6 py-5 sticky top-0 bg-light-one z-10">
			<div class="flex items-center gap-2">
				<div class="flex h-9 w-9 items-center justify-center">
					<CreditCardIcon class="h-6 w-6 text-light-three" />
				</div>
				<h3 class="text-base font-bold text-light-black">Cobrar Venta</h3>
			</div>
			<Button variant="ghost" onclick={onCerrar} size="xs">
				<XIcon class="h-5 w-5" />
			</Button>
		</div>

		<div class="space-y-5 p-6">
			<!-- Total -->
			<div class="bg-light-light-one_d rounded-2xl border border-light-four py-6 text-center">
				<span class="mb-1.5 block text-lg font-bold tracking-widest text-light-success uppercase">
					Total a cobrar
				</span>
				<span class="font-mono text-5xl font-bold text-light-two drop-shadow-sm">
					{fmt(totalFinal)}
				</span>
			</div>

			<!-- Lista de pagos -->
			<div>
				<div class="flex items-center justify-between mb-2.5">
					<label class="block text-xs font-bold text-light-black uppercase">
						Métodos de pago
					</label>
					<Button variant="ghost" size="xs" onclick={agregarPago} class="text-light-two hover:text-light-three">
						{#snippet leftIcon()}
							<PlusIcon class="h-4 w-4" />
						{/snippet}
						Agregar
					</Button>
				</div>
				
				<div class="space-y-3">
					{#each pagos as pago, i (i)}
						<div class="relative rounded-xl border border-light-four bg-white p-4 shadow-sm" transition:fly={{ y: -10, duration: 150 }}>
							{#if pagos.length > 1}
								<button 
									onclick={() => removerPago(i)}
									class="absolute right-2 top-2 text-light-error hover:bg-red-50 p-1.5 rounded-full transition-colors"
								>
									<TrashIcon class="h-4 w-4" />
								</button>
							{/if}
							
							<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
								{#each ['EFECTIVO', 'QR', 'TARJETA', 'TRANSFERENCIA'] as metodo}
									<button
										onclick={() => (pago.metodo_pago = metodo as MetodoPago)}
										class="rounded-lg border py-2 text-xs font-bold transition {pago.metodo_pago === metodo
											? 'border-light-two bg-light-two text-light-one'
											: 'border-light-four bg-light-one text-light-five hover:border-light-two_d hover:text-light-two'}"
									>
										{metodo}
									</button>
								{/each}
							</div>

							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Input
									type="number"
									label="Monto"
									autofocus={i === pagos.length - 1}
									bind:value={pago.monto}
									placeholder="0.00"
									icon={CoinIcon}
								/>
								{#if pago.metodo_pago !== 'EFECTIVO'}
									<Input
										type="text"
										label="Referencia (Opcional)"
										bind:value={pago.referencia}
										placeholder="Ej: 123456"
									/>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Cambio -->
			{#if totalPagado > 0}
				<div
					class="rounded-2xl border {totalPagado >= totalFinal
						? 'bg-light-light-one_d border-light-four'
						: 'bg-red-50 border-red-100'} p-4 text-center"
					transition:fly={{ y: 4, duration: 150 }}
				>
					{#if totalPagado >= totalFinal}
						<span class="text-xs font-bold tracking-widest text-light-black uppercase">Cambio a entregar</span>
						<p class="font-mono text-3xl font-bold text-light-success">
							{fmt(cambio)}
						</p>
					{:else}
						<span class="text-xs font-bold tracking-widest text-light-error uppercase">Faltante</span>
						<p class="font-mono text-3xl font-bold text-light-error">
							{fmt(totalFinal - totalPagado)}
						</p>
					{/if}
				</div>
			{/if}

			<!-- Notas -->
			<Input bind:value={notasVenta} placeholder="Notas u observaciones (opcional)..." />

			<div class="sticky bottom-0 bg-light-one pt-2 pb-4">
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
</div>
