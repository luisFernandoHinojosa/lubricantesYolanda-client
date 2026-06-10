<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLTextareaAttributes, 'children'> {
		label?: string;
		error?: string;
		class?: string;
		value?: string | number | null | undefined;
	}

	let { class: className, label, error, value = $bindable(), ...restProps }: Props = $props();
</script>

<div class={className}>
	<label
		for={restProps.id}
		class="mb-1 grid grid-cols-[auto,_1fr] items-center gap-0.5 text-lg leading-6 font-medium text-light-black"
	>
		<span class="truncate"
			>{label} <span class="text-red-500">{restProps.required && '*'} </span></span
		>
	</label>
	<div class="relative">
		<textarea
			{...restProps}
			bind:value
			class="block w-full rounded-xl border border-light-four bg-light-one py-2 text-sm text-light-black ring-light-two transition-all placeholder:text-xs placeholder:text-light-five hover:ring-1 hover:ring-light-two_d focus:ring-2 focus:ring-light-three sm:text-base sm:leading-6 placeholder:sm:text-sm"
		></textarea>

		{#if error}
			<p transition:slide={{ duration: 300, easing: cubicOut }} class="mt-1 text-sm text-red-500">
				{error}
			</p>
		{/if}
	</div>
</div>
