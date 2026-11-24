<script lang="ts">
	interface Props {
		index: number;
	}

	let { index }: Props = $props();
	// Anchos variados para que la carga no parezca una rejilla perfecta
	const w = ['w-40', 'w-56', 'w-32', 'w-48'][index % 4];
</script>

<tr class="animate-pulse" aria-hidden="true">
	<td class="px-4 py-3">
		<div class="flex items-center gap-3">
			<div class="size-10 shrink-0 rounded-md bg-acero-100"></div>
			<div class="space-y-1.5">
				<div class="h-3.5 {w} rounded bg-acero-200"></div>
				<div class="h-3 w-24 rounded bg-acero-100"></div>
			</div>
		</div>
	</td>
	<td class="px-4 py-3">
		<div class="h-3.5 w-24 rounded bg-acero-200"></div>
		<div class="mt-1.5 h-3 w-16 rounded bg-acero-100"></div>
	</td>
	<td class="hidden px-4 py-3 xl:table-cell"><div class="h-3.5 w-28 rounded bg-acero-100"></div></td
	>
	<td class="hidden px-4 py-3 lg:table-cell"><div class="h-3.5 w-24 rounded bg-acero-100"></div></td
	>
	<td class="px-4 py-3"><div class="ml-auto h-5 w-14 rounded bg-acero-200"></div></td>
	<td class="hidden px-4 py-3 md:table-cell"
		><div class="h-6 w-20 rounded-md bg-acero-100"></div></td
	>
	<td class="px-4 py-3"><div class="mx-auto size-8 rounded-md bg-acero-100"></div></td>
</tr>
