<script lang="ts">
	import { PhotoIcon } from '$lib/icons/outline';

	interface Props {
		index: number;
	}

	let { index }: Props = $props();
</script>

<tr
	class="{index % 2 === 0
		? 'bg-[#D19999]/10'
		: 'bg-[#D19999]/20'} animate-pulse transition-colors"
>
	<td class="border-r border-gray-100 px-4 py-2 text-center">
		<div
			class="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 text-gray-300"
		>
			<PhotoIcon class="h-5 w-5" />
		</div>
	</td>
	<td class="border-r border-gray-100 px-4 py-5">
		<div class="h-4 w-32 rounded bg-gray-200"></div>
	</td>
	<td class="border-r border-gray-100 px-4 py-5">
		<div class="h-4 w-24 rounded bg-gray-200"></div>
	</td>
	<td class="border-r border-gray-100 px-4 py-5 font-bold">
		<div class="h-4 w-12 rounded bg-gray-200 ml-auto mr-auto"></div>
	</td>
	<td class="border-r border-gray-100 px-4 py-5">
		<div class="h-4 w-20 rounded bg-gray-200"></div>
	</td>
	<td class="border-r border-gray-100 px-4 py-5">
		<div class="h-4 w-24 rounded bg-gray-200"></div>
	</td>
	<td class="border-r border-gray-100 px-4 py-5">
		<div class="h-4 w-28 rounded bg-gray-200"></div>
	</td>
	<td class="border-r border-gray-100 px-4 py-5 text-center">
		<div class="h-4 w-16 rounded bg-gray-200 mx-auto mb-1"></div>
		<div class="h-3 w-20 rounded bg-gray-100 mx-auto"></div>
	</td>
	<td class="border-r border-gray-100 px-4 py-5 text-center">
		<div class="h-4 w-10 rounded bg-gray-200 mx-auto"></div>
	</td>
	<td class="px-4 py-5 text-center">
		<div class="h-4 w-8 rounded bg-gray-100 mx-auto"></div>
	</td>
</tr>
