<script lang="ts">
	//blurOverlay.svelte
	import { fade, scale } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
		inDuration?: number;
		outDuration?: number;
	}

	let { children, class: className = '', inDuration = 180, outDuration = 140 }: Props = $props();
</script>

<div
	class="fixed inset-0 z-50 flex items-end justify-center overflow-auto bg-acero-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
	in:fade={{ duration: inDuration }}
	out:fade={{ duration: outDuration }}
>
	<div
		class="flex w-full flex-col items-center sm:my-auto sm:w-auto {className}"
		in:scale={{ duration: inDuration, start: 0.97 }}
		out:scale={{ duration: outDuration, start: 0.97 }}
	>
		{@render children()}
	</div>
</div>
