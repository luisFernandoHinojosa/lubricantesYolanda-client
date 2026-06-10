<script lang="ts">
	import type { HTMLThAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLThAttributes {
		children: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<th
	class={cn('text-muted-foreground h-12 px-4 text-left align-middle font-medium', className)}
	{...restProps}
>
	{@render children()}
</th>

<!-- <script lang="ts">
	import type { HTMLThAttributes } from 'svelte/elements';

	interface $$Props extends HTMLThAttributes {
		class?: string;
	}

	let className = '';
	export { className as class };
</script>

<th
	class="bg-background text-muted-foreground relative h-10 border-b px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 {className}"
	{...$$restProps}
>
	<slot />
</th> -->
