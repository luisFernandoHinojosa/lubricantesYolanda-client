<script lang="ts">
	interface Props {
		rows?: number;
	}
	let { rows = 8 }: Props = $props();
</script>

<div class="overflow-x-auto rounded-3xl border border-light-four bg-light-one shadow-sm overflow-hidden">
	<table class="min-w-full divide-y divide-light-four">
		<thead class="bg-light-one_d">
			<tr>
				{#each Array(5) as _}
					<th class="px-6 py-5">
						<div class="h-4 w-20 animate-pulse rounded bg-light-three"></div>
					</th>
				{/each}
				<th class="px-6 py-5">
					<div class="ml-auto h-4 w-12 animate-pulse rounded bg-light-three"></div>
				</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-light-four bg-light-one">
			{#each Array(rows) as _, i (i)}
				<tr class="hover:bg-slate-50/50 transition-colors">
					<td class="px-6 py-4 whitespace-nowrap">
						<div class="h-8 w-20 animate-pulse rounded-xl bg-light-three"></div>
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<div class="flex flex-col gap-1.5">
							<div class="h-3.5 w-24 animate-pulse rounded bg-light-three"></div>
							<div class="h-3 w-16 animate-pulse rounded bg-light-three"></div>
						</div>
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<div class="h-6 w-24 animate-pulse rounded-lg bg-light-three"></div>
					</td>
					<td class="px-6 py-4">
						<div class="flex flex-col gap-1.5">
							<div class="h-3.5 w-48 animate-pulse rounded bg-light-three"></div>
							<div class="h-3 w-32 animate-pulse rounded bg-light-three"></div>
						</div>
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						<div class="flex flex-col gap-1.5">
							<div class="h-3.5 w-20 animate-pulse rounded bg-light-three"></div>
							<div class="h-3 w-16 animate-pulse rounded bg-light-three"></div>
						</div>
					</td>
					<td class="px-6 py-4 text-right whitespace-nowrap">
						<div class="ml-auto flex flex-col items-end gap-1.5">
							<div class="h-4 w-24 animate-pulse rounded bg-light-three"></div>
							<div class="h-3 w-12 animate-pulse rounded bg-light-three"></div>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
