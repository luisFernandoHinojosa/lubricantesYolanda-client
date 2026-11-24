<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { errorText, fieldBase, fieldError, fieldOk, labelBase } from './fieldStyles';

	interface Props extends Omit<HTMLTextareaAttributes, 'children'> {
		label?: string;
		error?: string;
		class?: string;
		value?: string | number | null | undefined;
	}

	let { class: className, label, error, value = $bindable(), ...restProps }: Props = $props();

	const uid = $props.id();
	const areaId = $derived(restProps.id ?? `ta-${uid}`);
</script>

<div class={className}>
	{#if label}
		<label for={areaId} class={labelBase}>
			{label}{#if restProps.required}<span class="ml-0.5 text-marca" aria-hidden="true">*</span
				>{/if}
		</label>
	{/if}
	<textarea
		{...restProps}
		id={areaId}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${areaId}-error` : undefined}
		class="{fieldBase} {error ? fieldError : fieldOk} px-3 py-2 text-[0.9375rem] leading-6"
	></textarea>
	{#if error}
		<p id="{areaId}-error" transition:slide={{ duration: 200, easing: cubicOut }} class={errorText}>
			{error}
		</p>
	{/if}
</div>
