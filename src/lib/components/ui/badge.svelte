<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils'; // La misma utilidad de clases que usamos para la tabla
	import type { Snippet } from 'svelte';

	// 1. Definimos las variantes de estilo que aceptará el badge
	type BadgeVariant =
		| 'default'
		| 'secondary'
		| 'destructive'
		| 'outline'
		| 'success'
		| 'warning'
		| 'info'
		| 'error';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		variant?: BadgeVariant;
	}

	let { variant = 'default', class: className, children, ...restProps }: Props = $props();

	// 2. Mapeamos cada variante a sus clases de Tailwind CSS
	const variants = {
		default: 'border-transparent bg-primary text-primary-foreground',
		secondary: 'border-transparent bg-secondary text-secondary-foreground',
		destructive: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
		outline: 'text-foreground',
		success:
			'border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
		warning:
			'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
		info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
		error: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
	};

	// 3. Clases base que todos los badges compartirán
	const baseClasses =
		'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
</script>

<div class={cn(baseClasses, variants[variant], className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>
