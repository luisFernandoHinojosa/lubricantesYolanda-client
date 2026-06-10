<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div class="flex flex-col gap-6" in:fade>
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="h-8 w-64 animate-pulse rounded-lg bg-gray-200"></div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
		<!-- Left Column -->
		<div class="space-y-6 lg:col-span-3">
			<!-- Section: Identificación -->
			<section class="overflow-hidden rounded-2xl border border-light-four bg-light-one shadow-sm">
				<div class="h-12 border-b border-light-four bg-light-one_d px-6">
					<div class="flex h-full items-center gap-3">
						<div class="h-8 w-8 animate-pulse rounded-lg bg-gray-200"></div>
						<div class="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
					</div>
				</div>
				<div class="p-6">
					<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
						<div class="col-span-2 space-y-6">
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="space-y-2">
									<div class="h-3 w-20 animate-pulse rounded bg-gray-100"></div>
									<div class="h-10 w-full animate-pulse rounded-xl bg-gray-200"></div>
								</div>
								<div class="space-y-2">
									<div class="h-3 w-24 animate-pulse rounded bg-gray-100"></div>
									<div class="h-10 w-full animate-pulse rounded-xl bg-gray-200"></div>
								</div>
							</div>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div class="space-y-2">
									<div class="h-3 w-16 animate-pulse rounded bg-gray-100"></div>
									<div class="h-10 w-full animate-pulse rounded-xl bg-gray-200"></div>
								</div>
								<div class="space-y-2">
									<div class="h-3 w-24 animate-pulse rounded bg-gray-100"></div>
									<div class="h-10 w-full animate-pulse rounded-xl bg-gray-200"></div>
								</div>
								<div class="space-y-2">
									<div class="h-3 w-20 animate-pulse rounded bg-gray-100"></div>
									<div class="h-10 w-full animate-pulse rounded-xl bg-gray-200"></div>
								</div>
							</div>
						</div>
						<div class="space-y-2">
							<div class="h-3 w-28 animate-pulse rounded bg-gray-100"></div>
							<div class="h-32 w-full animate-pulse rounded-xl bg-gray-200"></div>
						</div>
					</div>
				</div>
			</section>

			<!-- Section: Productos -->
			<section class="overflow-hidden rounded-2xl border border-light-four bg-light-one shadow-sm">
				<div class="flex h-16 items-center justify-between border-b border-light-four bg-light-one_d px-6">
					<div class="flex items-center gap-3">
						<div class="h-8 w-8 animate-pulse rounded-lg bg-gray-200"></div>
						<div class="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
					</div>
					<div class="h-10 w-72 animate-pulse rounded-xl bg-gray-200"></div>
				</div>
				<div class="p-2">
					<div class="space-y-2">
						{#each Array(4) as _}
							<div class="flex h-16 items-center gap-4 px-4">
								<div class="h-10 w-1/4 animate-pulse rounded bg-gray-100"></div>
								<div class="h-10 w-1/6 animate-pulse rounded bg-gray-100"></div>
								<div class="h-10 w-1/6 animate-pulse rounded bg-gray-100"></div>
								<div class="h-10 w-1/6 animate-pulse rounded bg-gray-100"></div>
								<div class="h-10 w-1/6 animate-pulse rounded bg-gray-100"></div>
							</div>
						{/each}
					</div>
				</div>
			</section>
		</div>

		<!-- Right Column -->
		<div class="space-y-6">
			<section class="overflow-hidden rounded-2xl border border-light-four bg-light-one shadow-sm">
				<div class="h-14 border-b border-light-four bg-light-one_d"></div>
				<div class="space-y-6 p-6">
					<div class="h-24 w-full animate-pulse rounded-2xl bg-red-50"></div>
					<div class="space-y-3 pt-2">
						<div class="flex justify-between">
							<div class="h-4 w-24 animate-pulse rounded bg-gray-100"></div>
							<div class="h-4 w-8 animate-pulse rounded bg-gray-100"></div>
						</div>
						<div class="flex justify-between">
							<div class="h-4 w-28 animate-pulse rounded bg-gray-100"></div>
							<div class="h-4 w-10 animate-pulse rounded bg-gray-100"></div>
						</div>
						<div class="my-2 h-px bg-light-four"></div>
						<div class="flex justify-between">
							<div class="h-4 w-20 animate-pulse rounded bg-gray-100"></div>
							<div class="h-4 w-16 animate-pulse rounded bg-gray-100"></div>
						</div>
					</div>
				</div>
			</section>

			<div class="grid grid-cols-1 gap-4">
				<div class="h-20 w-full animate-pulse rounded-2xl bg-red-600/20"></div>
				<div class="h-14 w-full animate-pulse rounded-2xl bg-gray-200"></div>
			</div>
		</div>
	</div>
</div>
