<script lang="ts">
	import {
		UserIcon,
		PercentIcon,
		CreditCardIcon,
		XMarkIcon,
		FileDescriptionIcon,
		CheckCircleIcon
	} from '$lib/icons/outline';
	import { Button } from '$lib/components/ui';
	import type { ClientePOS, CartItem, DatosFacturacionDto } from '$lib/interfaces/venta.interface';

	interface Props {
		carrito: CartItem[];
		clienteActivo?: boolean;
		clienteSeleccionado: ClientePOS | null;
		clienteForm?: { ci: string; nombre: string; apellido_paterno?: string };
		facturar?: boolean;
		datosFacturacion?: DatosFacturacionDto;
		montoDescuentoGlobal: number;
		totalFinal: number;
		onAbrirCliente: () => void;
		onToggleFacturar?: () => void;
		onAbrirDescuento: (target: 'global' | string) => void;
		onQuitarDescuentoGlobal: () => void;
		onIrACobrar: () => void;
		fmt: (n: number) => string;
	}

	let {
		carrito,
		clienteActivo = false,
		clienteSeleccionado,
		clienteForm,
		facturar = false,
		datosFacturacion,
		montoDescuentoGlobal,
		totalFinal,
		onAbrirCliente,
		onToggleFacturar,
		onAbrirDescuento,
		onQuitarDescuentoGlobal,
		onIrACobrar,
		fmt
	}: Props = $props();

	let tieneCliente = $derived(
		(clienteActivo && clienteForm && clienteForm.nombre.trim().length > 0) ||
			clienteSeleccionado !== null
	);

	let nombreCliente = $derived(
		clienteActivo && clienteForm && clienteForm.nombre
			? `${clienteForm.nombre} ${clienteForm.apellido_paterno || ''}`.trim()
			: clienteSeleccionado
				? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido_paterno || ''}`.trim()
				: 'Público General'
	);

	let ciCliente = $derived(
		clienteActivo && clienteForm?.ci
			? clienteForm.ci
			: clienteSeleccionado?.ci ?? null
	);
</script>

<div class="flex w-64 shrink-0 flex-col border-l border-light-one_d bg-light-two text-light-one">
	<!-- Cliente -->
	<button
		onclick={onAbrirCliente}
		type="button"
		class="border-b border-light-five/30 px-5 py-3.5 text-left transition hover:bg-light-three_d"
	>
		<div class="mb-1.5 flex items-center justify-between">
			<span class="text-[11px] font-bold tracking-widest text-light-one/80 uppercase">Cliente</span>
			<span class="flex items-center gap-1 text-[11px] font-semibold text-light-one transition hover:text-white">
				<UserIcon class="h-3 w-3" />
				{tieneCliente ? 'cambiar' : 'asignar'}
			</span>
		</div>
		{#if tieneCliente}
			<p class="text-sm leading-tight font-bold text-white truncate">
				{nombreCliente}
			</p>
			{#if ciCliente}
				<p class="mt-0.5 font-mono text-xs text-light-one/80">CI/NIT: {ciCliente}</p>
			{/if}
		{:else}
			<p class="text-sm font-bold text-light-one">Público General</p>
			<p class="text-xs text-light-one/60">Sin cliente asignado</p>
		{/if}
	</button>

	<!-- Facturación SIAT -->
	<div class="border-b border-light-five/30 px-5 py-3 transition {facturar ? 'bg-emerald-950/40' : 'hover:bg-light-three_d'}">
		<div class="flex items-center justify-between mb-1">
			<button
				type="button"
				onclick={onAbrirCliente}
				class="flex items-center gap-1.5 text-left text-xs font-bold {facturar ? 'text-emerald-300' : 'text-light-one'}"
			>
				<FileDescriptionIcon class="h-3.5 w-3.5" />
				Facturación
			</button>

			{#if onToggleFacturar}
				<button
					type="button"
					onclick={onToggleFacturar}
					class="px-2 py-0.5 text-[10px] font-bold rounded-full border transition {facturar
						? 'border-emerald-400 bg-emerald-500 text-white'
						: 'border-light-one/30 text-light-one/70 hover:text-white'}"
				>
					{facturar ? 'FACTURAR: SÍ' : 'NO'}
				</button>
			{/if}
		</div>

		{#if facturar}
			<button
				type="button"
				onclick={onAbrirCliente}
				class="w-full text-left mt-1 text-[11px] text-emerald-200/90 hover:text-white"
			>
				<p class="truncate font-semibold">{datosFacturacion?.razonSocial || 'Razón Social pendiente'}</p>
				<p class="font-mono text-[10px] text-emerald-300">Doc: {datosFacturacion?.numeroDocumento || 'Sin doc'}</p>
			</button>
		{:else}
			<p class="text-[11px] text-light-one/60">Recibo de venta simple</p>
		{/if}
	</div>

	<!-- Descuento global -->
	<div
		class="flex items-center justify-between border-b border-light-five/30 px-5 py-3 transition {montoDescuentoGlobal > 0
			? 'bg-light-error/20'
			: 'hover:bg-light-three_d'}"
	>
		<button
			type="button"
			onclick={() => onAbrirDescuento('global')}
			class="flex flex-1 items-center gap-1.5 text-left text-xs font-bold {montoDescuentoGlobal > 0
				? 'text-white'
				: 'text-light-one'}"
		>
			<PercentIcon class="h-3 w-3" />Descuento global
		</button>

		<div class="flex items-center gap-1.5">
			<span
				class="font-mono text-xs font-bold {montoDescuentoGlobal > 0
					? 'text-white'
					: 'text-light-one'}"
			>
				{montoDescuentoGlobal > 0 ? `-${fmt(montoDescuentoGlobal)}` : '—'}
			</span>
			{#if montoDescuentoGlobal > 0}
				<button
					type="button"
					onclick={(e) => {
						e.stopPropagation();
						onQuitarDescuentoGlobal();
					}}
					class="flex items-center justify-center rounded p-0.5 text-white transition hover:bg-white/20"
					title="Quitar descuento global"
				>
					<XMarkIcon class="h-3 w-3" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Total -->
	<div class="flex flex-1 flex-col items-center justify-center px-5 py-6">
		<span class="mb-2 text-xs font-bold tracking-widest text-light-one/80 uppercase">
			Total a cobrar
		</span>
		<span class="font-mono text-4xl leading-none font-bold text-white tabular-nums drop-shadow-sm">
			{fmt(totalFinal)}
		</span>
		<span class="mt-2.5 text-xs font-medium text-light-one/80">
			{carrito.length} item(s) en orden
		</span>
	</div>

	<!-- Botón cobrar -->
	<div class="border-t border-light-four/20 p-4">
		<Button
			onclick={onIrACobrar}
			disabled={carrito.length === 0}
			variant="secondary"
			fullWidth
		>
			{#snippet leftIcon()}
				<CreditCardIcon class="h-5 w-5" />
			{/snippet}
			COBRAR
			<span class="ml-2 rounded px-1.5 py-0.5 text-xs font-bold text-light-black bg-white/20">[F2]</span>
		</Button>
	</div>
</div>
