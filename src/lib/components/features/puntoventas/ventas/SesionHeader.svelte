<script lang="ts">
	import { LogOutIcon } from '$lib/icons/outline';
	import { Button } from '$lib/components/ui';
	import type { SesionCaja } from '$lib/interfaces/venta.interface';

	interface Props {
		sesionActiva: SesionCaja;
		horaActual: string;
		onAbrirModalCierre: () => void;
		fmt: (n: number) => string;
	}

	let { sesionActiva, horaActual, onAbrirModalCierre, fmt }: Props = $props();
</script>

<header class="flex h-12 shrink-0 items-center justify-between">
	<div
		class="flex items-center rounded-lg border border-light-one_d bg-light-one_d/30 px-2.5 py-0.5"
	>
		<span class="text-xs font-bold text-light-two">
			Apertura: <strong>{fmt(parseFloat(sesionActiva.monto_apertura))}</strong>
		</span>
	</div>
	<div class="flex items-center gap-4">
		<span class="font-mono text-sm font-bold text-light-five">{horaActual}</span>
		<span
			class="flex items-center gap-1.5 rounded-full border border-light-success/20 bg-light-success/10 px-3 py-1 text-[11px] font-bold text-light-success"
		>
			<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-light-success"></span>
			TURNO ACTIVO
		</span>
		<Button onclick={onAbrirModalCierre} variant="primary">
			{#snippet leftIcon()}
				<LogOutIcon class="h-5 w-5" />
			{/snippet}
			CERRAR TURNO
		</Button>
	</div>
</header>
