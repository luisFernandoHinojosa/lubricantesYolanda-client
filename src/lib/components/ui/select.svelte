<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { errorText, fieldBase, fieldError, fieldOk, labelBase } from './fieldStyles';

	interface Props extends Omit<HTMLSelectAttributes, 'children'> {
		children: Snippet;
		icon?: Snippet;
		label?: string;
		error?: string;
		class?: string;
		value?: string | number | null | undefined;
	}

	let {
		class: className,
		children,
		icon,
		label,
		error,
		value = $bindable(),
		...restProps
	}: Props = $props();

	const uid = $props.id();
	const selectId = $derived(restProps.id ?? `sel-${uid}`);
</script>

<div class={className}>
	{#if label}
		<label class={labelBase} for={selectId}>
			{label}{#if restProps.required}<span class="ml-0.5 text-marca" aria-hidden="true">*</span
				>{/if}
		</label>
	{/if}
	<div class="relative">
		<select
			{...restProps}
			id={selectId}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${selectId}-error` : undefined}
			class="{fieldBase} {error ? fieldError : fieldOk} h-[42px] py-0 pr-9 text-[0.9375rem] {icon
				? 'pl-10'
				: 'pl-3'}"
		>
			{@render children()}
		</select>
		{#if icon}
			<span
				class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-acero-400 [&_svg]:size-5"
				aria-hidden="true"
			>
				{@render icon()}
			</span>
		{/if}
	</div>
	{#if error}
		<p
			id="{selectId}-error"
			transition:slide={{ duration: 200, easing: cubicOut }}
			class={errorText}
		>
			{error}
		</p>
	{/if}
</div>
