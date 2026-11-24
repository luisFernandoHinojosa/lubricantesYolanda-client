<script lang="ts">
	import { PRESETS_PERIODO, rangoDePreset, type PresetPeriodo } from './kardex.utils';

	interface Props {
		desde?: string;
		hasta?: string;
		preset?: PresetPeriodo;
		onchange: () => void;
	}

	let {
		desde = $bindable(''),
		hasta = $bindable(''),
		preset = $bindable('todo'),
		onchange
	}: Props = $props();

	function aplicarPreset(p: PresetPeriodo) {
		preset = p;
		const rango = rangoDePreset(p);
		desde = rango.desde;
		hasta = rango.hasta;
		onchange();
	}

	function cambiarFecha() {
		preset = 'personalizado';
		if (desde && hasta && desde > hasta) hasta = desde;
		onchange();
	}

	const inputClass =
		'h-11 rounded-xl border border-light-four bg-light-one px-3 text-sm text-light-black outline-none hover:ring-1 hover:ring-light-two_d focus:ring-2 focus:ring-light-three';
</script>

<div class="flex flex-col gap-1">
	<span class="text-sm leading-6 font-medium text-light-black sm:text-base">Periodo</span>
	<div class="flex flex-wrap items-center gap-2">
		<div class="flex flex-wrap gap-1 rounded-xl border border-light-four bg-light-one p-1">
			{#each PRESETS_PERIODO as p (p.value)}
				<button
					type="button"
					class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors {preset === p.value
						? 'bg-light-two text-light-one shadow'
						: 'text-light-two hover:bg-light-one_d'}"
					onclick={() => aplicarPreset(p.value)}
				>
					{p.label}
				</button>
			{/each}
		</div>
		<div class="flex items-center gap-2">
			<input
				type="date"
				aria-label="Desde"
				class={inputClass}
				bind:value={desde}
				max={hasta || undefined}
				onchange={cambiarFecha}
			/>
			<span class="text-xs text-light-two">a</span>
			<input
				type="date"
				aria-label="Hasta"
				class={inputClass}
				bind:value={hasta}
				min={desde || undefined}
				onchange={cambiarFecha}
			/>
		</div>
	</div>
</div>
