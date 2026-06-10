<script lang="ts">
	import { UserIcon, PercentIcon, CreditCardIcon } from '$lib/icons/outline';
	import { Button } from '$lib/components/ui';
	import type { ClientePOS, CartItem } from '$lib/interfaces/venta.interface';

	interface Props {
		carrito: CartItem[];
		clienteSeleccionado: ClientePOS | null;
		montoDescuentoGlobal: number;
		totalFinal: number;
		onAbrirCliente: () => void;
		onAbrirDescuento: (target: 'global' | string) => void;
		onIrACobrar: () => void;
		fmt: (n: number) => string;
	}

	let {
		carrito,
		clienteSeleccionado,
		montoDescuentoGlobal,
		totalFinal,
		onAbrirCliente,
		onAbrirDescuento,
		onIrACobrar,
		fmt
	}: Props = $props();
</script>

<div class="flex w-64 shrink-0 flex-col border-l border-light-one_d bg-light-two">
	<!-- Cliente -->
	<button
		onclick={onAbrirCliente}
		class="border-b border-light-five px-5 py-4 text-left transition hover:bg-light-three_d"
	>
		<div class="mb-2 flex items-center justify-between">
			<span class="text-xs font-bold tracking-widest text-light-one uppercase">Cliente</span>
			<span
				class="flex items-center gap-1 text-xs font-semibold text-light-one transition hover:text-white"
				><UserIcon class="h-2.5 w-2.5" />cambiar</span
			>
		</div>
		{#if clienteSeleccionado}
			<p class="text-sm leading-tight font-bold text-white">
				{clienteSeleccionado.nombre}
				{clienteSeleccionado.apellido_paterno}
			</p>
			<p class="mt-0.5 font-mono text-xs text-light-one">CI: {clienteSeleccionado.ci}</p>
		{:else}
			<p class="text-sm font-bold text-light-one">Público General</p>
			<p class="text-xs text-light-one">Sin cliente asignado</p>
		{/if}
	</button>

	<!-- Descuento global -->
	<button
		onclick={() => onAbrirDescuento('global')}
		class="flex items-center justify-between border-b border-light-five px-5 py-3 transition hover:bg-light-three_d {montoDescuentoGlobal >
		0
			? 'bg-light-error/20'
			: ''}"
	>
		<span
			class="flex items-center gap-1.5 text-xs font-bold {montoDescuentoGlobal > 0
				? 'text-white'
				: 'text-light-one'}"
		>
			<PercentIcon class="h-3 w-3" />Descuento global
		</span>
		<span
			class="font-mono text-xs font-bold {montoDescuentoGlobal > 0
				? 'text-white'
				: 'text-light-one'}"
		>
			{montoDescuentoGlobal > 0 ? `-${fmt(montoDescuentoGlobal)}` : '—'}
		</span>
	</button>

	<!-- Total -->
	<div class="flex flex-1 flex-col items-center justify-center px-5 py-6">
		<span class="mb-2 text-lg font-bold tracking-widest text-light-one uppercase"
			>Total a cobrar</span
		>
		<span
			class="font-mono text-4xl leading-none font-bold text-light-one tabular-nums drop-shadow-sm"
			>{fmt(totalFinal)}</span
		>
		<span class="mt-2.5 text-sm font-bold text-light-one">{carrito.length} item(s)</span>
	</div>

	<!-- Botón cobrar -->
	<div class="border-t border-light-four p-4">
		<Button onclick={onIrACobrar} disabled={carrito.length === 0} variant="secondary" fullWidth>
			{#snippet leftIcon()}
				<CreditCardIcon class="h-5 w-5" />
			{/snippet}
			COBRAR
			<span class="ml-2 rounded px-1.5 py-0.5 text-sm font-bold text-light-black">[F2]</span>
		</Button>
	</div>
</div>
