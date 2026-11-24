<script lang="ts">
	import { LockIcon } from '$lib/icons/outline';
	import { Button } from '$lib/components/ui';
	import type { SesionCaja } from '$lib/interfaces/venta.interface';

	interface Props {
		sesionActiva: SesionCaja;
		horaActual: string;
		onAbrirModalCierre: () => void;
		fmt: (n: number) => string;
	}

	let { sesionActiva, horaActual, onAbrirModalCierre, fmt }: Props = $props();

	const fondoInicial = $derived(Number.parseFloat(sesionActiva.monto_apertura));

	const horaApertura = $derived.by(() => {
		const d = new Date(sesionActiva.fecha_apertura);
		return Number.isNaN(d.getTime())
			? null
			: d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
	});
</script>

<div
	class="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-3 print:hidden"
	role="region"
	aria-label="Turno de caja"
>
	<div class="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm">
		<span class="inline-flex items-center gap-2 font-semibold text-ok">
			<span class="relative flex size-2.5" aria-hidden="true">
				<span class="absolute inline-flex size-full animate-ping rounded-full bg-ok/50"></span>
				<span class="relative inline-flex size-2.5 rounded-full bg-ok"></span>
			</span>
			Caja abierta{#if horaApertura}<span class="font-normal text-acero-500"
					>&nbsp;desde {horaApertura}</span
				>{/if}
		</span>
		<span class="text-acero-500">
			Fondo inicial
			<span class="font-semibold text-acero-900 tabular-nums">
				{Number.isFinite(fondoInicial) ? fmt(fondoInicial) : '—'}
			</span>
		</span>
	</div>

	<div class="flex items-center gap-3">
		<time
			class="font-display text-lg font-semibold text-acero-700 tabular-nums"
			aria-label="Hora actual">{horaActual}</time
		>
		<Button onclick={onAbrirModalCierre} variant="secondary" size="sm">
			{#snippet leftIcon()}
				<LockIcon class="size-4" />
			{/snippet}
			Cerrar caja
		</Button>
	</div>
</div>
