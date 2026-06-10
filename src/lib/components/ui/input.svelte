<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Component } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	interface Props extends HTMLInputAttributes {
		icon?: Component;
		label?: string;
		error?: string;
		size?: InputSize;
		value?: string | number | null | undefined;
	}

	let {
		class: className,
		icon,
		label,
		error,
		size = 'md',
		value = $bindable(),
		...restProps
	}: Props = $props();

	const sizeStyles: Record<InputSize, string> = {
		xs: 'h-8 px-2.5 text-xs',
		sm: 'h-10 px-3 text-sm',
		md: 'h-11 px-4 text-sm sm:text-base',
		lg: 'h-13 px-4 text-base sm:text-lg',
		xl: 'h-15 px-5 text-lg sm:text-xl'
	};
</script>

<div class={className}>
	<label
		for={restProps.id}
		class="grid grid-cols-[auto,_1fr] items-center gap-0.5 text-sm leading-6 font-medium text-light-black sm:text-base"
	>
		<span class="truncate"
			>{label} <span class="text-red-500">{restProps.required && '*'} </span></span
		>
	</label>
	<div class="relative {label && 'mt-1'}  {icon && 'grid grid-cols-1'}">
		<input
			{...restProps}
			bind:value
			class={[
				'block w-full rounded-xl border border-light-four bg-light-one text-black ring-light-three transition-all outline-none placeholder:text-light-five hover:ring-1 hover:ring-light-two_d focus:ring-2 focus:ring-light-three',
				sizeStyles[size],
				icon && 'pl-10',
				'placeholder:text-xs placeholder:sm:text-sm'
			]
				.filter(Boolean)
				.join(' ')}
		/>
		{#if icon}
			<p
				class="pointer-events-none absolute col-start-1 row-start-1 ml-3 self-center text-light-two_d"
			>
				{#await Promise.resolve(icon) then Icon}
					<Icon />
				{/await}
			</p>
		{/if}
		{#if error}
			<p transition:slide={{ duration: 300, easing: cubicOut }} class="mt-1 text-sm text-red-500">
				{error}
			</p>
		{/if}
	</div>
</div>
