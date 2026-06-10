<script lang="ts">
	import { HomeDotIcon } from '$lib/icons/outline';

	interface Props {
		total: number;
		stockTotal?: number;
	}

	let { total, stockTotal = 0 }: Props = $props();
</script>

<div class="mb-8 flex gap-4">
	<div
		class="group relative max-w-[280px] flex-1 overflow-hidden rounded-xl bg-light-two p-4 text-light-one"
	>
		<div class="relative z-10">
			<div class="mb-1 flex items-center gap-1 text-xs font-bold uppercase opacity-80">
				<span>Cantidad en Productos</span>
				<span class="cursor-help">ⓘ</span>
			</div>
			<div class="text-4xl font-extrabold tracking-tighter">{total}</div>
		</div>
		<div class="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-light-warning/10 p-2">
			<HomeDotIcon class="h-6 w-6 text-light-warning" />
		</div>
	</div>

	<div
		class="group relative max-w-[280px] flex-1 overflow-hidden rounded-xl bg-light-two p-4 text-light-one"
	>
		<div class="relative z-10">
			<div class="mb-1 flex items-center gap-1 text-xs font-bold uppercase opacity-80">
				<span>Stock Total en Unidades</span>
				<span class="cursor-help">ⓘ</span>
			</div>
			<div class="text-4xl font-extrabold tracking-tighter">{stockTotal > 0 ? stockTotal : '--'}</div>
		</div>
		<div class="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-light-warning/10 p-2">
			<HomeDotIcon class="h-6 w-6 text-light-warning" />
		</div>
	</div>
</div>
