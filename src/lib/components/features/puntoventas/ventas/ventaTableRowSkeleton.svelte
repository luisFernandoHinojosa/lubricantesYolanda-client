<script lang="ts">
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
	<td class="border-r border-gray-200/50 px-6 py-4">
		<div class="h-4 w-32 rounded bg-gray-300/50"></div>
		<div class="mt-2 h-3 w-20 rounded bg-gray-200/50"></div>
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4">
		<div class="h-4 w-24 rounded bg-gray-300/50"></div>
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4">
		<div class="h-4 w-36 rounded bg-gray-300/50"></div>
		<div class="mt-2 h-3 w-24 rounded bg-gray-200/50"></div>
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4">
		<div class="h-4 w-28 rounded bg-gray-300/50"></div>
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4 text-center">
		<div class="mx-auto h-6 w-16 rounded-full bg-gray-300/50"></div>
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4 text-right">
		<div class="ml-auto h-5 w-24 rounded bg-gray-300/50"></div>
		<div class="ml-auto mt-2 h-3 w-16 rounded bg-gray-200/50"></div>
	</td>
	<td class="px-6 py-4 text-center">
		<div class="mx-auto h-8 w-8 rounded bg-gray-300/50"></div>
	</td>
</tr>
