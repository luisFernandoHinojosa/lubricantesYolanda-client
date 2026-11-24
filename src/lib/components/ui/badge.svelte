<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type BadgeVariant =
		| 'default'
		| 'secondary'
		| 'destructive'
		| 'outline'
		| 'success'
		| 'warning'
		| 'info'
		| 'error';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children?: Snippet;
		variant?: BadgeVariant;
	}

	let { variant = 'default', class: className, children, ...restProps }: Props = $props();

	const variants: Record<BadgeVariant, string> = {
		default: 'bg-acero-900 text-white',
		secondary: 'bg-acero-100 text-acero-700',
		outline: 'border border-acero-300 text-acero-700',
		success: 'bg-ok-tinte text-ok',
		warning: 'bg-aceite-tinte text-aceite-oscuro',
		info: 'bg-acero-100 text-acero-800',
		destructive: 'bg-marca-tinte text-marca-oscuro',
		error: 'bg-marca-tinte text-marca-oscuro'
	};

	const baseClasses =
		'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap';
</script>

<span class={cn(baseClasses, variants[variant], className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</span>
