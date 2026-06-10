<script lang="ts">
	import type { Movimiento } from '$lib/interfaces';
	import HistorialMovimientoRow from './HistorialMovimientoRow.svelte';

	interface Props {
		movimientos: Movimiento[];
	}

	let { movimientos }: Props = $props();
</script>

<div
	class="overflow-hidden overflow-x-auto rounded-xl border border-light-four bg-light-one shadow-sm"
>
	<table class="min-w-full divide-y divide-light-four">
		<thead class="bg-light-one_d">
			<tr>
				<th class="px-6 py-5 text-left text-xs font-bold tracking-widest text-light-two uppercase"
					>Tipo</th
				>
				<th class="px-6 py-5 text-left text-xs font-bold tracking-widest text-light-two uppercase"
					>Fecha</th
				>
				<th class="px-6 py-5 text-left text-xs font-bold tracking-widest text-light-two uppercase"
					>Categoría</th
				>
				<th class="px-6 py-5 text-left text-xs font-bold tracking-widest text-light-two uppercase"
					>Descripción / Nombre</th
				>
				<th class="px-6 py-5 text-left text-xs font-bold tracking-widest text-light-two uppercase"
					>Pago / Sucursal</th
				>
				<th class="px-6 py-5 text-right text-xs font-bold tracking-widest text-light-two uppercase"
					>Monto</th
				>
			</tr>
		</thead>
		<tbody class="divide-y divide-light-four bg-light-one">
			{#each movimientos as mov (mov.id)}
				<HistorialMovimientoRow movimiento={mov} />
			{/each}
		</tbody>
	</table>
</div>
