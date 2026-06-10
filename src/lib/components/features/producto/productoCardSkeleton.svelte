<script lang="ts">
	import { PhotoIcon, TagIcon, HomeDotIcon, ScaleIcon } from '$lib/icons/outline';
</script>

<div
	class="relative animate-pulse overflow-hidden rounded-xl border border-light-four bg-light-one transition-all"
>
	<div class="relative aspect-video w-full overflow-hidden bg-gray-200 flex items-center justify-center">
		<PhotoIcon class="h-12 w-12 text-gray-300" />
	</div>

	<!-- Card Content -->
	<div class="p-4">
		<div class="mb-2">
			<div class="h-5 w-3/4 rounded bg-gray-200 mb-2"></div>
			<div class="h-4 w-1/2 rounded bg-gray-200 font-mono"></div>
		</div>

		<div class="space-y-4">
			<div class="flex items-center gap-2">
				<TagIcon class="h-4 w-4 shrink-0 text-gray-200" />
				<div class="h-4 w-2/3 rounded bg-gray-200"></div>
			</div>

			<div class="flex items-center gap-2">
				<HomeDotIcon class="h-4 w-4 shrink-0 text-gray-200" />
				<div class="h-4 w-1/2 rounded bg-gray-200"></div>
			</div>

			<div class="flex items-center justify-between border-t border-light-four pt-2">
				<div class="flex items-center gap-1.5">
					<div class="rounded p-1 bg-gray-100">
						<ScaleIcon class="h-4 w-4 text-gray-200" />
					</div>
					<div class="h-4 w-12 rounded bg-gray-200"></div>
				</div>
				<div class="text-right">
					<div class="h-2 w-16 rounded bg-gray-100 mb-1 ml-auto"></div>
					<div class="h-4 w-24 rounded bg-gray-200"></div>
				</div>
			</div>
		</div>
	</div>
</div>
