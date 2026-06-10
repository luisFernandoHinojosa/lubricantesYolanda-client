import type { Component } from 'svelte';

export interface SubMenuItem {
	id: string;
	label: string;
	href: string;
}

export interface MenuItem {
	id: string;
	label: string;
	icon: Component;
	href?: string;
	active?: boolean;
	hasSubmenu?: boolean;
	submenu?: SubMenuItem[];
}
