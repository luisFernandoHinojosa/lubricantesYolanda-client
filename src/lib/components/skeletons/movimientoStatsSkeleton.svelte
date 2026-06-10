<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
	{#each Array(4) as _, i (i)}
		<div class="h-32 rounded-2xl bg-light-one border border-light-four p-6 flex flex-col justify-between overflow-hidden relative">
			<div class="space-y-2 relative z-10">
				<div class="h-3 w-24 animate-pulse rounded bg-light-three"></div>
				<div class="h-8 w-32 animate-pulse rounded bg-light-three"></div>
			</div>
			<div class="h-3 w-20 animate-pulse rounded bg-light-three relative z-10"></div>
			<div class="absolute -right-4 -top-4 size-24 rounded-full bg-light-four/20 blur-2xl"></div>
		</div>
	{/each}
</div>
