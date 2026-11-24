<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	type HeadingWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
	type HeadingColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'white' | 'error';

	interface Props {
		children?: Snippet;
		level: HeadingLevel;
		weight?: HeadingWeight;
		color?: HeadingColor;
		truncate?: boolean; // Prop de utilidad para truncar texto
		noWrap?: boolean; // Prop de utilidad para evitar el salto de línea
		class?: string;
	}

	let {
		children,
		level,
		weight,
		color = 'primary',
		truncate = false,
		noWrap = false,
		class: className = ''
	}: Props = $props();

	// Estilos base para cada nivel con jerarquía visual correcta
	const levelStyles: Record<HeadingLevel, string> = {
		h1: 'font-display text-3xl/tight sm:text-4xl/tight text-acero-950',
		h2: 'font-display text-2xl/tight sm:text-[1.75rem]/tight text-acero-950',
		h3: 'font-display text-xl/tight sm:text-2xl/tight text-acero-950',
		h4: 'text-lg/snug text-acero-950',
		h5: 'text-base/snug text-acero-950',
		h6: 'text-sm/snug text-acero-950'
	};

	// Pesos de fuente por defecto para cada nivel
	const defaultWeights: Record<HeadingLevel, HeadingWeight> = {
		h1: 'semibold',
		h2: 'semibold',
		h3: 'semibold',
		h4: 'semibold',
		h5: 'medium',
		h6: 'medium'
	};

	// Estilos de peso
	const weightStyles: Record<HeadingWeight, string> = {
		light: 'font-light',
		normal: 'font-normal',
		medium: 'font-medium',
		semibold: 'font-semibold',
		bold: 'font-bold',
		extrabold: 'font-extrabold'
	};

	// Colores
	// const colorStyles: Record<HeadingColor, string> = {
	// 	primary: 'text-light-two',
	// 	secondary: 'text-light-two_d',
	// 	muted: 'text-light-four',
	// 	accent: 'text-light-three',
	// 	white: 'text-light-one',
	// 	error: 'text-red-500'
	// };

	// Construir clases finales
	const finalWeight = $derived(weight || defaultWeights[level]);
	const computedClasses = $derived(
		cn(
			levelStyles[level],
			weightStyles[finalWeight],
			truncate && 'truncate',
			noWrap && 'whitespace-nowrap',
			className
		)
	);
</script>

<svelte:element this={level} class={computedClasses}>
	{#if children}
		{@render children()}
	{/if}
</svelte:element>
<!-- <script lang="ts">
	import type { Snippet } from 'svelte';

	type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	type HeadingWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
	type HeadingColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'white' | 'error';

	interface Props {
		children: Snippet;
		level: HeadingLevel;
		weight?: HeadingWeight;
		color?: HeadingColor;
		class?: string;
	}

	let { children, level, weight, color = 'primary', class: className = '' }: Props = $props();

	// Estilos base para cada nivel con jerarquía visual correcta
	const levelStyles: Record<HeadingLevel, string> = {
		h1: 'font-display text-3xl/tight sm:text-4xl/tight text-acero-950',
		h2: 'font-display text-2xl/tight sm:text-[1.75rem]/tight text-acero-950',
		h3: 'font-display text-xl/tight sm:text-2xl/tight text-acero-950',
		h4: 'text-lg/snug text-acero-950',
		h5: 'text-base/snug text-acero-950',
		h6: 'text-sm/snug text-acero-950'
	};

	// Pesos de fuente por defecto para cada nivel
	const defaultWeights: Record<HeadingLevel, HeadingWeight> = {
		h1: 'semibold',
		h2: 'semibold',
		h3: 'semibold',
		h4: 'semibold',
		h5: 'medium',
		h6: 'medium'
	};

	// Estilos de peso
	const weightStyles: Record<HeadingWeight, string> = {
		light: 'font-light',
		normal: 'font-normal',
		medium: 'font-medium',
		semibold: 'font-semibold',
		bold: 'font-bold',
		extrabold: 'font-extrabold'
	};

	// Colores (adaptados a tu sistema de colores)
	const colorStyles: Record<HeadingColor, string> = {
		primary: 'text-light-two',
		secondary: 'text-light-two_d',
		muted: 'text-light-four',
		accent: 'text-light-three',
		white: 'text-light-one',
		error: 'text-red-500'
	};

	// Construir clases finales
	const finalWeight = $derived(weight || defaultWeights[level]);
	const computedClasses = $derived(
		[levelStyles[level], weightStyles[finalWeight], colorStyles[color], className]
			.filter(Boolean)
			.join(' ')
	);
</script>

<svelte:element this={level} class={computedClasses}>
	{@render children()}
</svelte:element> -->
