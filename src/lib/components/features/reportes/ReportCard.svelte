<script lang="ts">
	import { ChevronRightIcon } from '$lib/icons/outline';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		title: string;
		description: string;
		icon: Snippet;
		onclick: () => void;
	}

	let { title, description, icon, onclick }: Props = $props();
</script>

<button
	class="group relative flex flex-col items-center gap-4 rounded-3xl border border-light-four bg-light-one p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-red-200 hover:shadow-2xl hover:shadow-red-600/10 active:scale-95"
	{onclick}
	in:fade={{ duration: 300 }}
>
	<div
		class="absolute inset-0 -z-10 rounded-3xl bg-linear-to-br from-white to-light-one opacity-0 transition-opacity group-hover:opacity-100"
	></div>

	<div
		class="flex h-16 w-16 items-center justify-center rounded-2xl bg-light-four text-light-one transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
	>
		{@render icon()}
	</div>

	<div class="flex flex-col gap-2">
		<h3 class="text-md leading-tight font-black tracking-tight text-light-black uppercase">
			{title}
		</h3>
		<p class="line-clamp-2 text-xs leading-relaxed font-medium text-light-black/50">
			{description}
		</p>
	</div>

	<div
		class="mt-2 flex h-8 w-8 translate-y-2 items-center justify-center rounded-full bg-light-four_d opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
	>
		<ChevronRightIcon class="size-5 text-light-one" />
	</div>
</button>
