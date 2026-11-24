<script lang="ts">
	import type { MenuItem } from '$lib/interfaces';
	import { ChevronDownIcon } from '$lib/icons/outline';
	import { clickOutside, portal } from '$lib/utils';
	import { untrack } from 'svelte';
	import { slide } from 'svelte/transition';

	interface Props {
		item: MenuItem;
		isCollapsed: boolean;
		onItemClick: () => void;
		isActive?: boolean;
		hasActiveChild?: boolean;
		isPathActive: (href?: string) => boolean;
	}

	let {
		item,
		isCollapsed,
		onItemClick,
		isActive = false,
		hasActiveChild = false,
		isPathActive
	}: Props = $props();

	let isExpanded = $state(untrack(() => hasActiveChild));
	let flyoutOpen = $state(false);
	let trigger = $state<HTMLButtonElement>();
	let flyoutPos = $state({ top: 0, left: 0 });

	// Al navegar a una pantalla de este grupo, abrir el grupo
	$effect(() => {
		if (hasActiveChild) isExpanded = true;
	});

	const MenuIcon = $derived(item.icon);
	const highlighted = $derived(isActive || hasActiveChild);
	const submenuId = $derived(`submenu-${item.id}`);

	const handleGroupClick = () => {
		if (isCollapsed && window.innerWidth >= 768) {
			if (trigger) {
				const r = trigger.getBoundingClientRect();
				flyoutPos = { top: r.top, left: r.right + 8 };
			}
			flyoutOpen = !flyoutOpen;
			return;
		}
		isExpanded = !isExpanded;
	};

	const rowBase =
		'group relative flex h-10 w-full items-center gap-3 rounded-md px-3 text-[0.9375rem] font-medium transition-colors';
	const rowState = (on: boolean) =>
		on ? 'bg-acero-800 text-white' : 'text-acero-200 hover:bg-acero-800/60 hover:text-white';
</script>

{#snippet activeBar(on: boolean)}
	{#if on}
		<span class="absolute top-2 bottom-2 left-0 w-[3px] rounded-r bg-marca" aria-hidden="true"
		></span>
	{/if}
{/snippet}

{#if item.href && !item.hasSubmenu}
	<a
		href={item.href}
		class="{rowBase} {rowState(highlighted)} {isCollapsed ? 'md:justify-center md:px-0' : ''}"
		title={isCollapsed ? item.label : undefined}
		aria-current={isActive ? 'page' : undefined}
		onclick={onItemClick}
	>
		{@render activeBar(highlighted)}
		<MenuIcon
			class="size-5 shrink-0 {highlighted
				? 'text-white'
				: 'text-acero-400 group-hover:text-acero-200'}"
		/>
		<span class="truncate {isCollapsed ? 'md:sr-only' : ''}">{item.label}</span>
	</a>
{:else}
	<button
		bind:this={trigger}
		type="button"
		class="{rowBase} {rowState(hasActiveChild && (isCollapsed || !isExpanded))} {isCollapsed
			? 'md:justify-center md:px-0'
			: ''}"
		onclick={handleGroupClick}
		title={isCollapsed ? item.label : undefined}
		aria-expanded={isCollapsed ? flyoutOpen : isExpanded}
		aria-controls={submenuId}
	>
		{@render activeBar(hasActiveChild && (isCollapsed || !isExpanded))}
		<MenuIcon
			class="size-5 shrink-0 {hasActiveChild
				? 'text-white'
				: 'text-acero-400 group-hover:text-acero-200'}"
		/>
		<span class="flex-1 truncate text-left {isCollapsed ? 'md:sr-only' : ''}">{item.label}</span>
		<ChevronDownIcon
			class="size-4 shrink-0 text-acero-400 transition-transform duration-200 {isExpanded
				? 'rotate-180'
				: ''} {isCollapsed ? 'md:hidden' : ''}"
		/>
	</button>

	{#if isExpanded && item.submenu && !isCollapsed}
		<ul
			id={submenuId}
			class="relative mt-0.5 mb-1 ml-[1.375rem] space-y-0.5 border-l border-acero-700 pl-3"
			transition:slide={{ duration: 160 }}
		>
			{#each item.submenu as sub (sub.id)}
				{@const on = isPathActive(sub.href)}
				<li>
					<a
						href={sub.href}
						class="relative flex h-9 items-center rounded-md px-3 text-sm transition-colors {on
							? 'bg-acero-800 font-medium text-white'
							: 'text-acero-300 hover:bg-acero-800/60 hover:text-white'}"
						aria-current={on ? 'page' : undefined}
						onclick={onItemClick}
					>
						{#if on}
							<span
								class="absolute top-1/2 -left-[13px] h-4 w-[3px] -translate-y-1/2 rounded-r bg-marca"
								aria-hidden="true"
							></span>
						{/if}
						{sub.label}
					</a>
				</li>
			{/each}
		</ul>
	{/if}

	{#if flyoutOpen && isCollapsed && item.submenu}
		<div
			use:portal
			use:clickOutside={{ callback: () => (flyoutOpen = false), exclude: trigger }}
			class="fixed z-[60] w-60 rounded-lg border border-acero-700 bg-acero-900 p-1.5 shadow-2xl"
			style="top: {flyoutPos.top}px; left: {flyoutPos.left}px"
			role="menu"
			tabindex="-1"
			onkeydown={(e) => e.key === 'Escape' && (flyoutOpen = false)}
		>
			<p class="px-3 pt-1.5 pb-1 text-xs font-medium text-acero-400">{item.label}</p>
			{#each item.submenu as sub (sub.id)}
				{@const on = isPathActive(sub.href)}
				<a
					href={sub.href}
					role="menuitem"
					class="flex h-9 items-center rounded-md px-3 text-sm {on
						? 'bg-acero-800 font-medium text-white'
						: 'text-acero-200 hover:bg-acero-800 hover:text-white'}"
					onclick={() => {
						flyoutOpen = false;
						onItemClick();
					}}
				>
					{sub.label}
				</a>
			{/each}
		</div>
	{/if}
{/if}
