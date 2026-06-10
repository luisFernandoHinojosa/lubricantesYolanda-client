<script lang="ts">
	interface Props {
		rows?: number;
	}
	let { rows = 8 }: Props = $props();
</script>

<div class="overflow-x-auto rounded-xl border border-light-four bg-light-one shadow-sm">
	<table class="min-w-full divide-y divide-light-four">
		<thead class="bg-light-one_d">
			<tr>
				<th class="px-6 py-4 text-left">
					<div class="h-4 w-32 animate-pulse rounded bg-light-three"></div>
				</th>
				<th class="px-6 py-4 text-left">
					<div class="h-4 w-24 animate-pulse rounded bg-light-three"></div>
				</th>
				<th class="px-6 py-4 text-left">
					<div class="h-4 w-24 animate-pulse rounded bg-light-three"></div>
				</th>
				<th class="px-6 py-4 text-left">
					<div class="h-4 w-28 animate-pulse rounded bg-light-three"></div>
				</th>
				<th class="px-6 py-4 text-left">
					<div class="h-4 w-24 animate-pulse rounded bg-light-three"></div>
				</th>
				<th class="px-6 py-4 text-left">
					<div class="h-4 w-32 animate-pulse rounded bg-light-three"></div>
				</th>
				<th class="px-6 py-4 text-left">
					<div class="h-4 w-32 animate-pulse rounded bg-light-three"></div>
				</th>
				<th class="px-6 py-4 text-right">
					<div class="ml-auto h-4 w-12 animate-pulse rounded bg-light-three"></div>
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-light-four bg-light-one">
			{#each Array(rows) as _, i (i)}
				<tr>
					<td class="px-6 py-5 whitespace-nowrap">
						<div class="h-4 w-40 animate-pulse rounded bg-light-three"></div>
					</td>
					<td class="px-6 py-5 whitespace-nowrap">
						<div class="h-4 w-20 animate-pulse rounded bg-light-three"></div>
					</td>
					<td class="px-6 py-5 whitespace-nowrap">
						<div class="h-4 w-24 animate-pulse rounded bg-light-three"></div>
					</td>
					<td class="px-6 py-5 whitespace-nowrap">
						<div class="h-4 w-28 animate-pulse rounded bg-light-three"></div>
					</td>
					<td class="px-6 py-5 whitespace-nowrap">
						<div class="h-4 w-20 animate-pulse rounded bg-light-three"></div>
					</td>
					<td class="px-6 py-5 whitespace-nowrap">
						<div class="flex flex-col gap-2">
							<div class="h-3 w-16 animate-pulse rounded bg-light-three"></div>
							<div class="h-4 w-32 animate-pulse rounded bg-light-three"></div>
						</div>
					</td>
					<td class="px-6 py-5 whitespace-nowrap">
						<div class="flex flex-col gap-2">
							<div class="h-3 w-16 animate-pulse rounded bg-light-three"></div>
							<div class="h-4 w-32 animate-pulse rounded bg-light-three"></div>
						</div>
					</td>
					<td class="px-6 py-5 text-right whitespace-nowrap">
						<div class="ml-auto h-8 w-8 animate-pulse rounded-full bg-light-three"></div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
