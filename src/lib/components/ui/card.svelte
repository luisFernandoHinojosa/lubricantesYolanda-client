<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface CardProps extends HTMLAttributes<HTMLDivElement> {
		variant?: 'default' | 'bordered' | 'elevated' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		interactive?: boolean;
		disabled?: boolean;
		padding?: 'none' | 'sm' | 'md' | 'lg';
		header?: Snippet;
		footer?: Snippet;
		children: Snippet;
		class?: string;
	}

	let {
		variant = 'default',
		size = 'md',
		interactive = false,
		disabled = false,
		padding = 'md',
		header,
		footer,
		children,
		class: additionalClass = '',
		onclick,
		...restProps
	}: CardProps = $props();

	// Clases base estáticas
	const baseClasses = 'rounded-xl transition-colors duration-150';

	// Diccionarios de estilos (estos pueden ser const porque no cambian)
	const variantStyles = {
		default: 'bg-white border border-acero-200',
		bordered: 'bg-white border border-acero-300',
		elevated: 'bg-white border border-acero-200 shadow-[0_8px_24px_-16px_rgb(23_26_31/0.35)]',
		ghost: 'bg-transparent border-0 shadow-none'
	};

	const sizeStyles = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg xl:max-w-xl'
	};

	const paddingStyles = {
		none: '',
		sm: 'p-3',
		md: 'p-4 sm:p-6',
		lg: 'p-6 sm:p-8'
	};

	// --- CÁLCULOS REACTIVOS CON $derived ---

	const interactiveClasses = $derived(
		interactive && !disabled ? 'hover:border-acero-300 cursor-pointer' : ''
	);

	const disabledClasses = $derived(
		disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
	);

	// Combinamos todas las clases reactivamente
	const cardClasses = $derived(
		[
			baseClasses,
			variantStyles[variant],
			sizeStyles[size],
			paddingStyles[padding],
			interactiveClasses,
			disabledClasses,
			additionalClass
		]
			.filter(Boolean)
			.join(' ')
	);

	// Handler para clicks
	const handleClick = (event: MouseEvent | KeyboardEvent) => {
		if (disabled) return;
		onclick?.(event as any);
	};
</script>

<div
	class={cardClasses}
	role={interactive ? 'button' : undefined}
	tabindex={interactive && !disabled ? 0 : undefined}
	onclick={handleClick}
	onkeydown={(e) => {
		if (interactive && !disabled && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			handleClick(e);
		}
	}}
	{...restProps}
>
	{#if header}
		<div class="card-header mb-4 border-b border-acero-100 pb-4">
			{@render header()}
		</div>
	{/if}

	<div class="card-content">
		{@render children()}
	</div>

	{#if footer}
		<div class="card-footer mt-4 border-t border-acero-100 pt-4">
			{@render footer()}
		</div>
	{/if}
</div>
