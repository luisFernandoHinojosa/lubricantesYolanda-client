<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Component } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { errorText, fieldBase, fieldError, fieldOk, labelBase } from './fieldStyles';

	type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		icon?: Component;
		label?: string;
		error?: string;
		hint?: string;
		size?: InputSize;
		value?: string | number | null | undefined;
	}

	let {
		class: className,
		icon,
		label,
		error,
		hint,
		size = 'md',
		value = $bindable(),
		...restProps
	}: Props = $props();

	const sizeStyles: Record<InputSize, string> = {
		xs: 'h-8 px-2.5 text-xs',
		sm: 'h-9 px-3 text-sm',
		md: 'h-[42px] px-3 text-[0.9375rem]',
		lg: 'h-12 px-4 text-base',
		xl: 'h-14 px-5 text-lg'
	};

	const uid = $props.id();
	const inputId = $derived(restProps.id ?? `in-${uid}`);
	const describedBy = $derived(error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined);
	const Icon = $derived(icon);
</script>

<div class={className}>
	{#if label}
		<label for={inputId} class={labelBase}>
			{label}{#if restProps.required}<span class="ml-0.5 text-marca" aria-hidden="true">*</span
				>{/if}
		</label>
	{/if}
	<div class="relative">
		<input
			{...restProps}
			id={inputId}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			class={[fieldBase, error ? fieldError : fieldOk, sizeStyles[size], Icon && 'pl-10']
				.filter(Boolean)
				.join(' ')}
		/>
		{#if Icon}
			<span
				class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-acero-400 [&_svg]:size-5"
				aria-hidden="true"
			>
				<Icon />
			</span>
		{/if}
	</div>
	{#if error}
		<p
			id="{inputId}-error"
			transition:slide={{ duration: 200, easing: cubicOut }}
			class={errorText}
		>
			{error}
		</p>
	{:else if hint}
		<p id="{inputId}-hint" class="mt-1.5 text-sm text-acero-500">{hint}</p>
	{/if}
</div>
