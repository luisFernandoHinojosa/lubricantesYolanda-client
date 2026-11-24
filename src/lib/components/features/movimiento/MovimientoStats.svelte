<script lang="ts">
	import { ScaleIcon, TredingUpIcon, TrendingDownIcon } from '$lib/icons/outline';
	import { CoinIcon } from '$lib/icons/solid';
	import type { EstadisticasMovimiento } from '$lib/interfaces/movimiento.interface';

	interface Props {
		stats: EstadisticasMovimiento;
	}

	let { stats }: Props = $props();

	const fmt = (n: number) =>
		new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(n);
</script>

<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<!-- Total Ingresos -->
	<div class="relative overflow-hidden rounded-xl bg-light-success p-6 text-light-one shadow-lg">
		<div class="relative z-10">
			<div
				class="mb-2 flex items-center gap-2 text-xs font-bold opacity-80"
			>
				<TredingUpIcon class="size-4" />
				Ingresos Totales
			</div>
			<div class="text-3xl font-semibold tracking-tight">{fmt(stats.totalIngresos)}</div>
			<div class="mt-1 text-xs font-medium opacity-70">{stats.cantidadIngresos} transacciones</div>
		</div>
		<div class="absolute -top-4 -right-4 size-24 rounded-full bg-white/10 blur-2xl"></div>
	</div>

	<!-- Total Egresos -->
	<div class="relative overflow-hidden rounded-xl bg-light-error p-6 text-light-one">
		<div class="relative z-10">
			<div
				class="mb-2 flex items-center gap-2 text-xs font-bold opacity-80"
			>
				<TrendingDownIcon class="size-4" />
				Egresos Totales
			</div>
			<div class="text-3xl font-semibold tracking-tight">{fmt(stats.totalEgresos)}</div>
			<div class="mt-1 text-xs font-medium opacity-70">{stats.cantidadEgresos} transacciones</div>
		</div>
		<div class="absolute -top-4 -right-4 size-24 rounded-full bg-white/10 blur-2xl"></div>
	</div>

	<!-- Balance -->
	<div class="relative overflow-hidden rounded-xl bg-light-black p-6 text-light-one">
		<div class="relative z-10">
			<div
				class="mb-2 flex items-center gap-2 text-xs font-bold text-light-one opacity-80"
			>
				<ScaleIcon class="text-primary size-4" />
				Balance Neto
			</div>
			<div
				class="text-3xl font-semibold tracking-tight {stats.balance >= 0 ? 'text-light-success' : 'text-light-error'}"
			>
				{fmt(stats.balance)}
			</div>
			<div class="mt-1 text-xs font-medium text-light-one">Flujo de caja actual</div>
		</div>
		<div class="bg-primary/10 absolute -top-4 -right-4 size-24 rounded-full blur-2xl"></div>
	</div>

	<!-- Total Movimientos -->
	<div
		class="relative translate-y-0 overflow-hidden rounded-xl border border-light-four bg-light-one p-6 text-light-black shadow-lg transition-transform duration-300"
	>
		<div class="relative z-10">
			<div
				class="mb-2 flex items-center gap-2 text-xs font-bold text-acero-600"
			>
				<CoinIcon class="size-4 text-acero-600" />
				Total Movimientos
			</div>
			<div class="text-3xl font-semibold tracking-tight">{stats.totalMovimientos}</div>
			<div class="mt-1 text-xs font-medium text-acero-600">Volumen de operaciones</div>
		</div>
	</div>
</div>
