<script lang="ts">
	import { TredingUpIcon, TrendingDownIcon } from '$lib/icons/outline';
	import type { Movimiento } from '$lib/interfaces';

	interface Props {
		movimiento: Movimiento;
	}

	let { movimiento }: Props = $props();

	const fmt = (n: string | number) =>
		new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(Number(n));

	const formatDateDisplay = (dateStr: string) => {
		const d = new Date(dateStr);
		const year = d.getUTCFullYear();
		const month = d.getUTCMonth();
		const day = d.getUTCDate();
		return new Date(year, month, day).toLocaleDateString('es-BO', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};
</script>

<tr class="group transition-colors hover:bg-slate-50/50">
	<td class="px-6 py-4 whitespace-nowrap">
		<span
			class="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-bold tracking-tight shadow-sm {movimiento.tipo ===
			'INGRESO'
				? 'bg-green-100/50 text-green-700'
				: 'bg-red-100/50 text-red-700'}"
		>
			{#if movimiento.tipo === 'INGRESO'}
				<TredingUpIcon class="size-4" />
				INGRESO
			{:else}
				<TrendingDownIcon class="size-4" />
				EGRESO
			{/if}
		</span>
	</td>
	<td class="px-6 py-4 whitespace-nowrap">
		<div class="flex flex-col">
			<span class="text-sm font-bold text-light-black">{formatDateDisplay(movimiento.fecha)}</span>
			<span class="text-sm font-medium text-light-two uppercase"
				>{new Date(movimiento.fecha).toLocaleTimeString('es-BO', {
					hour: '2-digit',
					minute: '2-digit'
				})}</span
			>
		</div>
	</td>
	<td class="px-6 py-4 whitespace-nowrap">
		<span class=" px-2.5 py-1 text-sm font-bold text-light-black uppercase">
			{movimiento.categoria_movimiento?.nombre || 'General'}
		</span>
	</td>
	<td class="px-6 py-4">
		<div class="flex max-w-xs flex-col md:max-w-md">
			<span class="line-clamp-1 text-sm font-bold text-light-black">{movimiento.nombre}</span>
			<span class="line-clamp-1 text-sm text-light-two italic">{movimiento.descripcion}</span>
		</div>
	</td>
	<td class="px-6 py-4 whitespace-nowrap">
		<div class="flex flex-col">
			<span class="text-sm font-bold text-light-black">{movimiento.tipoPago}</span>
			<span class="text-sm font-medium tracking-tight text-light-two uppercase"
				>{movimiento.sucursal?.nombre || 'Matriz'}</span
			>
		</div>
	</td>
	<td class="px-6 py-4 text-right whitespace-nowrap">
		<span
			class="text-base font-black {movimiento.tipo === 'INGRESO'
				? 'text-emerald-600'
				: 'text-rose-600'}"
		>
			{movimiento.tipo === 'INGRESO' ? '+' : '-'}{fmt(movimiento.monto)}
		</span>
		<div class="text-sm font-bold text-light-two">{movimiento.divisa}</div>
	</td>
</tr>
