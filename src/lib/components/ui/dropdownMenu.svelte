<script lang="ts">
	import type { DropdownOption } from '$lib/interfaces';
	import { clickOutside, portal } from '$lib/utils';
	import { tick } from 'svelte';
	import { scale } from 'svelte/transition';

	interface Props {
		options: DropdownOption[];
		width: number;
		class?: string;
		isOpen: boolean;
		triggerElement?: HTMLElement;
	}

	let {
		options,
		width,
		class: className = '',
		isOpen = $bindable(),
		triggerElement
	}: Props = $props();

	let dropdownElement = $state<HTMLElement>();

	function handleSelect(option: DropdownOption) {
		if (option.disabled) return;
		option.action?.();
		close();
	}

	function close(returnFocus = false): void {
		isOpen = false;
		if (returnFocus) triggerElement?.focus();
	}

	function items(): HTMLButtonElement[] {
		return Array.from(
			dropdownElement?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ??
				[]
		);
	}

	function onKeydown(e: KeyboardEvent) {
		const list = items();
		const i = list.indexOf(document.activeElement as HTMLButtonElement);
		if (e.key === 'Escape') {
			e.preventDefault();
			close(true);
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			list[(i + 1) % list.length]?.focus();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			list[(i - 1 + list.length) % list.length]?.focus();
		} else if (e.key === 'Tab') {
			close();
		}
	}

	$effect(() => {
		if (isOpen && triggerElement && dropdownElement) {
			const rect = triggerElement.getBoundingClientRect();
			dropdownElement.style.position = 'fixed';
			dropdownElement.style.top = `${rect.bottom + 6}px`;
			dropdownElement.style.right = `${Math.max(8, window.innerWidth - rect.right)}px`;
			dropdownElement.style.zIndex = '9999';
			tick().then(() => items()[0]?.focus());
		}
	});
</script>

{#if isOpen}
	<div
		use:portal
		use:clickOutside={{ callback: () => close(), exclude: triggerElement }}
		bind:this={dropdownElement}
		class="rounded-lg border border-acero-200 bg-white p-1 shadow-[0_12px_32px_-12px_rgb(23_26_31/0.35)] {className}"
		style="width: {width}px;"
		role="menu"
		aria-orientation="vertical"
		tabindex="-1"
		onkeydown={onKeydown}
		transition:scale={{ duration: 120, start: 0.96, opacity: 0 }}
	>
		{#each options as option, i (option.id || i)}
			{#if option.divider && i > 0}
				<div class="my-1 border-t border-acero-100" role="separator"></div>
			{/if}
			<button
				type="button"
				class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium outline-none focus-visible:bg-acero-100 {option.disabled
					? 'cursor-not-allowed text-acero-300'
					: option.id === 'logout' || option.id === 'delete'
						? 'text-marca hover:bg-marca-tinte focus-visible:bg-marca-tinte'
						: 'text-acero-800 hover:bg-acero-100'}"
				role="menuitem"
				tabindex="-1"
				onclick={() => handleSelect(option)}
				disabled={option.disabled}
			>
				{#if option.icon}
					<option.icon class="size-[18px] shrink-0 opacity-80" />
				{/if}
				{option.label}
			</button>
		{/each}
	</div>
{/if}
