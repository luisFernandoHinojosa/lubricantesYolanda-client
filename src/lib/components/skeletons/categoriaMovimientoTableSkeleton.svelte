<script lang="ts">
	interface Props {
		rows?: number;
	}

	let { rows = 5 }: Props = $props();
</script>

<div class="overflow-x-auto rounded-xl border border-light-four bg-light-one shadow-sm">
	<table class="min-w-full divide-y divide-light-four">
		<thead class="bg-light-one_d font-bold">
			<tr>
				<th class="px-6 py-4 text-left text-xs font-bold text-light-two uppercase tracking-wider">
					<div class="h-4 w-24 animate-pulse rounded bg-light-three"></div>
				</th>
				<th class="px-6 py-4 text-left text-xs font-bold text-light-two uppercase tracking-wider">
					<div class="h-4 w-16 animate-pulse rounded bg-light-three"></div>
				</th>
				<th class="px-6 py-4 text-left text-xs font-bold text-light-two uppercase tracking-wider">
					<div class="h-4 w-48 animate-pulse rounded bg-light-three"></div>
				</th>
				<th class="px-6 py-4 text-right text-xs font-bold text-light-two uppercase tracking-wider">
					<div class="ml-auto h-4 w-12 animate-pulse rounded bg-light-three"></div>
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-light-four bg-light-one">
			{#each Array(rows) as _, i (i)}
				<tr>
					<td class="px-6 py-4 whitespace-nowrap">
						<div class="h-4 w-32 animate-pulse rounded bg-light-three"></div>
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<div class="h-4 w-16 animate-pulse rounded-full bg-light-three"></div>
					</td>
					<td class="px-6 py-4">
						<div class="h-4 w-64 animate-pulse rounded bg-light-three"></div>
					</td>
					<td class="px-6 py-4 text-right">
						<div class="ml-auto h-8 w-8 animate-pulse rounded-full bg-light-three"></div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
