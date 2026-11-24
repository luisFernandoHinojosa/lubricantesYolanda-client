<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		children: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<tr
	class={cn(
		'border-b border-acero-100 transition-colors hover:bg-acero-50 data-[state=selected]:bg-acero-100',
		className
	)}
	{...restProps}
>
	{@render children()}
</tr>

<!-- <script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface $$Props extends HTMLAttributes<HTMLTableRowElement> {
		class?: string;
	}

	let className = '';
	export { className as class };
</script>

<tr
	class="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors {className}"
	{...$$restProps}
>
	<slot />
</tr> -->
