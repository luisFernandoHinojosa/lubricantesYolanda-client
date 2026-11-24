<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		pie?: Snippet;
	}

	let { children, pie }: Props = $props();
</script>

<!-- Marco de las pantallas de acceso: panel de marca (escritorio) + formulario -->
<main class="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
	<section
		class="relative hidden flex-col justify-between overflow-hidden bg-acero-900 p-10 text-white lg:flex"
	>
		<a
			href="/"
			class="block h-16 w-56 overflow-hidden rounded-lg bg-white"
			aria-label="Lubricantes Yolanda, página principal"
		>
			<img src="/images/logo2.webp" alt="" class="h-full w-full scale-[1.04] object-cover" />
		</a>
		<div>
			<p class="font-display text-4xl leading-tight font-semibold tracking-tight">
				Calidad que protege,<br />rendimiento que mueve.
			</p>
			<p class="mt-4 max-w-sm text-acero-300">
				Sistema de ventas e inventario de Lubricantes Yolanda.
			</p>
		</div>
		<p
			class="font-display text-6xl font-semibold text-transparent select-none [-webkit-text-stroke:1px_var(--color-acero-700)]"
			aria-hidden="true"
		>
			15W-40 · 20W-50
		</p>
	</section>

	<section class="flex flex-col px-5 py-8 sm:px-10">
		<a
			href="/"
			class="mb-10 block h-14 w-48 overflow-hidden lg:hidden"
			aria-label="Lubricantes Yolanda, página principal"
		>
			<img src="/images/logo2.webp" alt="" class="h-full w-full scale-[1.04] object-cover" />
		</a>
		<div class="m-auto w-full max-w-sm">
			{@render children()}
		</div>
		{#if pie}
			<div class="mt-10 text-center text-sm text-acero-500">{@render pie()}</div>
		{/if}
	</section>
</main>
