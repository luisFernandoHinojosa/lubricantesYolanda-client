<script lang="ts">
	import Icon from '$lib/components/ui/icon.svelte';
	import type { MenuItem } from '$lib/interfaces';
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { untrack } from 'svelte';

	let { item, isCollapsed, onItemClick, isActive = false, hasActiveChild = false } = $props();

	let isExpanded = $state(untrack(() => hasActiveChild));

	const toggleSubmenu = () => {
		if (item.hasSubmenu) {
			isExpanded = !isExpanded;
		}
	};

	const handleClick = () => {
		if (item.hasSubmenu) {
			toggleSubmenu();
		} else {
			onItemClick();
		}
	};

	const isSubItemActive = (href: string) => {
		return $page.url.pathname === href;
	};

	const MenuIcon = $derived(item.icon);
</script>

<div class="mb-1 overflow-hidden rounded-lg">
	{#if item.href && !item.hasSubmenu}
		<a
			href={item.href}
			class="flex w-full items-center justify-between px-2 py-3 text-left transition-colors
           {isActive || hasActiveChild ? 'bg-light-accent text-white' : 'hover:bg-light-accent'}
           {isCollapsed ? 'justify-center px-2' : ''}"
			title={isCollapsed ? item.label : ''}
			onclick={onItemClick}
		>
			<div class="flex items-center gap-3 {isCollapsed ? 'justify-center' : ''}">
				<MenuIcon class="h-5 w-5" />
				{#if !isCollapsed}
					<span class="text-sm font-medium">{item.label}</span>
				{/if}
			</div>
		</a>
	{:else}
		<button
			class="flex w-full items-center justify-between px-2 py-3 text-left transition-colors
           {isActive ? 'bg-light-accent text-light-one' : 'hover:bg-light-accent'}
           {isCollapsed ? 'justify-center' : ''}"
			onclick={handleClick}
			title={isCollapsed ? item.label : ''}
		>
			<div class="flex items-center gap-3 {isCollapsed ? 'justify-center' : ''}">
				<MenuIcon class="h-5 w-5" />
				{#if !isCollapsed}
					<span class="text-sm font-medium">{item.label}</span>
				{/if}
			</div>

			{#if item.hasSubmenu && !isCollapsed}
				<svg
					class="h-4 w-4 transition-transform duration-200 {isExpanded ? 'rotate-90' : ''}"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			{/if}
		</button>
	{/if}

	{#if item.hasSubmenu && isExpanded && item.submenu && !isCollapsed}
		<div class="bg-light-three" transition:slide={{ duration: 200 }}>
			{#each item.submenu as subItem}
				<a
					href={subItem.href}
					class="block px-4 py-2 text-sm transition-colors
                       {isSubItemActive(subItem.href)
						? 'bg-light-accent font-medium text-light-one'
						: 'text-light-one hover:bg-light-accent'}"
					onclick={onItemClick}
				>
					{subItem.label}
				</a>
			{/each}
		</div>
	{/if}
</div>
<!-- <script lang="ts">
	import { page } from '$app/stores';
	import Icon from '$lib/components/ui/icon.svelte';
	import type { MenuItem } from '$lib/interfaces';
	import { slide } from 'svelte/transition';

	let { item, isCollapsed, onItemClick, isActive, hasActiveChild } = $props();

	let isExpanded: boolean = $state(hasActiveChild);

	const toggleSubmenu = () => {
		if (item.hasSubmenu) {
			isExpanded = !isExpanded;
		}
	};

	const handleClick = () => {
		if (item.hasSubmenu) {
			toggleSubmenu();
		} else {
			onItemClick();
		}
	};
	const isSubItemActive = (href: string) => {
		return $page.url.pathname === href;
	};
</script>

<div class="mb-1 rounded-lg">
	<button
		class="flex w-full items-center justify-between py-3 text-left transition-colors hover:bg-light-accent
           {isActive || hasActiveChild ? ' bg-light-accent' : ''}
           {isCollapsed ? 'justify-center px-2' : ''}"
		onclick={handleClick}
		title={isCollapsed ? item.label : ''}
	>
		<div class="flex items-center gap-3 {isCollapsed ? 'justify-center' : ''}">
			<svelte:component this={item.icon} class="h-5 w-5" />
			{#if !isCollapsed}
				<span class="text-sm font-medium">{item.label}</span>
			{/if}
		</div>

		{#if item.hasSubmenu && !isCollapsed}
			<svg
				class="h-4 w-4 transition-transform duration-200 {isExpanded ? 'rotate-90' : ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		{/if}
	</button>

	{#if item.hasSubmenu && isExpanded && item.submenu && !isCollapsed}
		<div class="bg-light-three" transition:slide={{ duration: 200 }}>
			{#each item.submenu as subItem}
				<a
					href={subItem.href}
					class="block px-4 py-2 pl-12 text-sm transition-colors
                       {isSubItemActive(subItem.href)
						? 'bg-light-accent font-medium text-white'
						: 'text-light-one hover:bg-light-accent'}"
					onclick={onItemClick}
				>
					{subItem.label}
				</a>
			{/each}
		</div>
	{/if}
</div> -->
