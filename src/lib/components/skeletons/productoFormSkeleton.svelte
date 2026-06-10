<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div class="flex min-h-screen flex-col gap-6 bg-gray-50/50 font-sans" in:fade>
	<!-- Header -->
	<div class="mb-2 flex items-center justify-between">
		<div class="h-10 w-80 animate-pulse rounded-lg bg-gray-200"></div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Left Column -->
		<div class="flex flex-col gap-6 lg:col-span-2">
			<!-- Section: Identificación -->
			<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-4">
					<div class="h-10 w-10 animate-pulse rounded-lg bg-gray-200"></div>
					<div class="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
				</div>
				<div class="p-6">
					<div class="grid grid-cols-1 gap-6 md:grid-cols-4">
						<div class="md:col-span-1">
							<div class="aspect-square w-full animate-pulse rounded-xl bg-gray-100"></div>
						</div>
						<div class="space-y-4 md:col-span-3">
							<div class="space-y-2">
								<div class="h-3 w-40 animate-pulse rounded bg-gray-50"></div>
								<div class="h-10 w-full animate-pulse rounded-lg bg-gray-100"></div>
							</div>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div class="space-y-2">
									<div class="h-3 w-32 animate-pulse rounded bg-gray-50"></div>
									<div class="h-10 w-full animate-pulse rounded-lg bg-gray-100"></div>
								</div>
								<div class="space-y-2">
									<div class="h-3 w-24 animate-pulse rounded bg-gray-50"></div>
									<div class="h-10 w-full animate-pulse rounded-lg bg-gray-100"></div>
								</div>
								<div class="space-y-2">
									<div class="h-3 w-28 animate-pulse rounded bg-gray-50"></div>
									<div class="h-10 w-full animate-pulse rounded-lg bg-gray-100"></div>
								</div>
							</div>
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="h-10 w-full animate-pulse rounded-lg bg-gray-100"></div>
								<div class="h-10 w-full animate-pulse rounded-lg bg-gray-100"></div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
					<div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-4">
						<div class="h-10 w-10 animate-pulse rounded-lg bg-gray-200"></div>
						<div class="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
					</div>
					<div class="space-y-4 p-6">
						<div class="h-10 w-full animate-pulse rounded-lg bg-gray-100"></div>
						<div class="grid grid-cols-2 gap-4">
							<div class="h-10 w-full animate-pulse rounded-lg bg-gray-100"></div>
							<div class="h-10 w-full animate-pulse rounded-lg bg-gray-100"></div>
						</div>
					</div>
				</section>
				<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
					<div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-4">
						<div class="h-10 w-10 animate-pulse rounded-lg bg-gray-200"></div>
						<div class="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
					</div>
					<div class="p-6">
						<div class="h-20 w-full animate-pulse rounded-xl bg-indigo-50"></div>
					</div>
				</section>
			</div>

			<section class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<div class="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-4">
					<div class="h-10 w-10 animate-pulse rounded-lg bg-gray-200"></div>
					<div class="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
				</div>
				<div class="p-6">
					<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
						<div class="h-16 w-full animate-pulse rounded-lg bg-gray-100"></div>
						<div class="h-16 w-full animate-pulse rounded-lg bg-gray-100"></div>
						<div class="h-20 w-full animate-pulse rounded-xl bg-green-50"></div>
					</div>
				</div>
			</section>
		</div>

		<!-- Right Column -->
		<div class="flex flex-col gap-6 lg:col-span-1">
			<section class="flex-1 overflow-hidden rounded-xl border border-green-100 bg-green-50 shadow-sm">
				<div class="flex items-center gap-3 border-b border-green-100 p-4">
					<div class="h-10 w-10 animate-pulse rounded-lg bg-white shadow-sm"></div>
					<div class="space-y-2">
						<div class="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
						<div class="h-3 w-48 animate-pulse rounded bg-gray-100"></div>
					</div>
				</div>
				<div class="space-y-6 p-6">
					<div class="h-40 w-full animate-pulse rounded-xl bg-white shadow-sm"></div>
					<div class="h-1 w-full animate-pulse rounded bg-green-200"></div>
					<div class="space-y-4 pt-4 text-center">
						<div class="h-16 animate-pulse rounded bg-gray-200"></div>
					</div>
				</div>
			</section>

			<div class="grid grid-cols-1 gap-4">
				<div class="h-24 w-full animate-pulse rounded-2xl bg-blue-100"></div>
				<div class="h-24 w-full animate-pulse rounded-2xl bg-gray-200"></div>
			</div>
		</div>
	</div>
</div>
