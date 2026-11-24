<script lang="ts">
	import { LoaderIcon } from '$lib/icons/outline';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	type ButtonVariant =
		| 'primary'
		| 'secondary'
		| 'outline'
		| 'ghost'
		| 'destructive'
		| 'link'
		| 'danger';
	type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

	interface Props {
		children?: Snippet;
		variant?: ButtonVariant;
		size?: ButtonSize;
		disabled?: boolean;
		loading?: boolean;
		fullWidth?: boolean;
		leftIcon?: Snippet;
		rightIcon?: Snippet;
		class?: string;
		href?: string;
		target?: HTMLAnchorAttributes['target'];
		rel?: HTMLAnchorAttributes['rel'];
		type?: HTMLButtonAttributes['type'];
		onclick?: (event: MouseEvent) => void;
		[key: string]: any;
	}

	let {
		children,
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		fullWidth = false,
		leftIcon,
		rightIcon,
		class: className = '',
		href,
		target,
		rel,
		type = 'button',
		onclick,
		...restProps
	}: Props = $props();

	const styles = {
		base: [
			'relative',
			'inline-flex items-center justify-center whitespace-nowrap',
			'font-semibold select-none',
			'transition-[background-color,border-color,color,box-shadow] duration-150 ease-out',
			'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca',
			'disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed',
			'active:translate-y-px',
			'touch-manipulation'
		].join(' '),

		variants: {
			primary:
				'bg-marca text-white hover:bg-marca-oscuro active:bg-marca-oscuro shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] disabled:bg-acero-200 disabled:text-acero-500 disabled:shadow-none disabled:opacity-100',
			secondary:
				'bg-white border border-acero-200 text-acero-900 hover:bg-acero-50 hover:border-acero-300 active:bg-acero-100',
			outline:
				'bg-transparent border border-acero-300 text-acero-800 hover:bg-white hover:border-acero-400 active:bg-acero-100',
			ghost:
				'bg-transparent text-acero-700 hover:bg-acero-100 hover:text-acero-950 active:bg-acero-200',
			destructive:
				'bg-white border border-marca/40 text-marca hover:bg-marca-tinte hover:border-marca active:bg-marca-tinte',
			danger:
				'bg-marca text-white hover:bg-marca-oscuro active:bg-marca-oscuro shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)]',
			link: 'bg-transparent text-marca p-0 min-h-0 hover:text-marca-oscuro hover:underline underline-offset-4'
		},

		sizes: {
			xs: 'px-2 py-1 text-xs min-h-[30px] gap-1.5 rounded-md',
			sm: 'px-3 py-1.5 text-sm min-h-[36px] gap-2 rounded-md',
			md: 'px-4 py-2 text-[0.9375rem] min-h-[42px] gap-2 rounded-lg',
			lg: 'px-5 py-2.5 text-base min-h-[48px] gap-2.5 rounded-lg',
			xl: 'px-7 py-3.5 text-lg min-h-[56px] gap-3 rounded-xl'
		},

		iconSizes: {
			xs: 'p-1.5 text-xs min-h-[30px] min-w-[30px] rounded-md',
			sm: 'p-2 text-sm min-h-[36px] min-w-[36px] rounded-md',
			md: 'p-2.5 text-base min-h-[42px] min-w-[42px] rounded-lg',
			lg: 'p-3 text-lg min-h-[48px] min-w-[48px] rounded-lg',
			xl: 'p-4 text-xl min-h-[56px] min-w-[56px] rounded-xl'
		}
	} as const;

	const isLink = $derived(!!href);
	const isDisabled = $derived(disabled || loading);
	const isIconOnly = $derived(!children && (!!leftIcon || !!rightIcon));

	$effect(() => {
		if (isIconOnly && !restProps['aria-label']) {
			console.warn(
				`Accesibility Warning: An icon-only button should have an 'aria-label' prop to be accessible to screen readers.`
			);
		}
	});

	const buttonClasses = $derived(
		[
			styles.base,
			styles.variants[variant],
			isIconOnly ? styles.iconSizes[size] : styles.sizes[size],
			fullWidth && 'w-full',
			className
		]
			.filter(Boolean)
			.join(' ')
	);

	function handleClick(event: MouseEvent) {
		if (isDisabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		onclick?.(event);
	}

	const commonProps = $derived({
		class: buttonClasses,
		'aria-disabled': isDisabled,
		'aria-busy': loading,
		tabindex: isDisabled ? -1 : undefined
	});
</script>

{#if isLink}
	<a
		{...commonProps}
		href={isDisabled ? undefined : href}
		{target}
		{rel}
		onclick={handleClick}
		{...restProps}
	>
		{@render buttonContent()}
	</a>
{:else}
	<button {...commonProps} {type} disabled={isDisabled} onclick={handleClick} {...restProps}>
		{@render buttonContent()}
	</button>
{/if}

{#snippet buttonContent()}
	{#if loading}
		<span
			class="absolute inset-0 flex items-center justify-center"
			role="status"
			aria-label="Cargando"
		>
			<LoaderIcon class="h-5 w-5 animate-spin" />
		</span>
	{/if}

	{#if leftIcon}
		<span aria-hidden="true" class="inline-flex shrink-0" class:invisible={loading}>
			{@render leftIcon()}
		</span>
	{/if}

	{#if children}
		<span class:invisible={loading}>
			{@render children()}
		</span>
	{/if}

	{#if rightIcon}
		<span aria-hidden="true" class="inline-flex shrink-0" class:invisible={loading}>
			{@render rightIcon()}
		</span>
	{/if}
{/snippet}
