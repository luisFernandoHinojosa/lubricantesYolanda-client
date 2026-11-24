<script lang="ts">
	import { currentUserStore } from '$lib/stores';
	import { getDefaultRedirect } from '$lib/utils/rbac.utils';

	const TELEFONO = '72123855';
	const WHATSAPP = `https://wa.me/591${TELEFONO}?text=${encodeURIComponent('Hola, quisiera consultar por un producto.')}`;

	// Grados de viscosidad: la "etiqueta" que todo cliente reconoce en un bidón de aceite
	const GRADOS = ['0W-20', '5W-30', '10W-40', '15W-40', '20W-50', '25W-60', 'SAE 90', 'ATF'];

	const CATEGORIAS = [
		{
			nombre: 'Aceites de motor',
			detalle: 'Sintéticos, semisintéticos y minerales para gasolina y diésel.'
		},
		{ nombre: 'Filtros', detalle: 'De aceite, aire y combustible para autos, camionetas y motos.' },
		{
			nombre: 'Refrigerantes',
			detalle: 'Listos para usar o concentrados, para cada tipo de radiador.'
		},
		{ nombre: 'Grasas', detalle: 'Multiuso y de alta temperatura para rodamientos y chasis.' },
		{
			nombre: 'Transmisión y frenos',
			detalle: 'Aceites de caja, diferencial, ATF y líquido de frenos.'
		},
		{
			nombre: 'Aditivos y limpieza',
			detalle: 'Limpiadores de inyectores, tratamientos y desengrasantes.'
		}
	];

	const HORARIO = [
		{ dias: 'Lunes a viernes', horas: '7:30 – 19:30' },
		{ dias: 'Sábado', horas: '7:30 – 17:00' },
		{ dias: 'Domingo', horas: 'Cerrado' }
	];

	// Si ya hay sesión, el botón lleva directo a su pantalla de trabajo
	const destinoSistema = $derived(
		$currentUserStore ? getDefaultRedirect($currentUserStore.Role?.code_rol) : '/auth/sign-in'
	);
</script>

<svelte:head>
	<title>Lubricantes Yolanda · Aceites, filtros y lubricantes</title>
	<meta
		name="description"
		content="Lubricantes Yolanda: aceites de motor, filtros, refrigerantes y grasas. Consulte por WhatsApp al 72123855."
	/>
</svelte:head>

<div class="min-h-dvh bg-white text-acero-950">
	<!-- Barra superior -->
	<header class="sticky top-0 z-40 border-b border-acero-200 bg-white/95 backdrop-blur">
		<div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
			<a
				href="/"
				class="block h-12 w-36 overflow-hidden sm:w-44"
				aria-label="Lubricantes Yolanda, inicio"
			>
				<img src="/images/logo2.webp" alt="" class="h-full w-full scale-[1.04] object-cover" />
			</a>
			<nav
				aria-label="Secciones"
				class="hidden items-center gap-7 text-[0.9375rem] font-medium text-acero-700 md:flex"
			>
				<a href="#productos" class="hover:text-acero-950">Productos</a>
				<a href="#visitanos" class="hover:text-acero-950">Horario y contacto</a>
			</nav>
			<a
				href={destinoSistema}
				class="inline-flex h-10 items-center rounded-lg border border-acero-300 px-3.5 text-sm font-semibold text-acero-800 transition-colors hover:border-acero-400 hover:bg-acero-50"
			>
				{$currentUserStore ? 'Ir al sistema' : 'Acceso del personal'}
			</a>
		</div>
	</header>

	<main>
		<!-- Portada -->
		<section class="relative overflow-hidden bg-acero-900 text-white">
			<div
				class="mx-auto grid max-w-6xl gap-10 px-4 pt-14 pb-10 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:pb-16"
			>
				<div>
					<p class="mb-4 font-display text-lg font-medium text-aceite">
						Calidad que protege, rendimiento que mueve.
					</p>
					<h1 class="font-display text-5xl leading-[1.08] font-semibold tracking-tight sm:text-6xl">
						Aceite, filtros y todo lo que tu motor necesita.
					</h1>
					<p class="mt-5 max-w-xl text-lg leading-relaxed text-acero-300">
						Dinos la marca y el modelo de tu vehículo y te ayudamos a elegir el lubricante y el
						filtro correctos.
					</p>
					<div class="mt-8 flex flex-col gap-3 sm:flex-row">
						<a
							href={WHATSAPP}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-marca px-5 font-semibold text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.2)] transition-colors hover:bg-marca-oscuro"
						>
							<svg viewBox="0 0 24 24" class="size-5" fill="currentColor" aria-hidden="true"
								><path
									d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.1c-.24.68-1.42 1.3-1.95 1.34-.5.05-.97.23-3.27-.68-2.77-1.09-4.53-3.93-4.67-4.11-.13-.18-1.11-1.48-1.11-2.83 0-1.34.7-2 .96-2.28.25-.27.55-.34.73-.34l.53.01c.17.01.4-.06.62.48.24.56.79 1.92.86 2.06.07.14.11.3.02.48-.09.18-.14.3-.27.46l-.41.48c-.14.13-.28.28-.12.55.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.13.43.11.59-.07.16-.18.68-.8.86-1.07.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.14.45.2.52.32.07.11.07.66-.17 1.33Z"
								/></svg
							>
							Consultar por WhatsApp
						</a>
						<a
							href="#visitanos"
							class="inline-flex h-12 items-center justify-center rounded-lg border border-acero-600 px-5 font-semibold text-white transition-colors hover:border-acero-400 hover:bg-acero-800"
						>
							Ver horario de atención
						</a>
					</div>
				</div>

				<div class="hidden justify-end lg:flex">
					<img
						src="/images/logo1.webp"
						alt="Lubricantes Yolanda"
						class="w-full max-w-sm rounded-2xl bg-white p-6"
						width="500"
						height="500"
					/>
				</div>
			</div>

			<!-- Banda de grados de viscosidad -->
			<div class="border-t border-acero-700" aria-label="Grados de viscosidad disponibles">
				<ul class="grados mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-1 px-4 py-5 sm:px-6">
					{#each GRADOS as g, i (g)}
						<li
							class="font-display text-2xl font-semibold tabular-nums sm:text-3xl {g === '20W-50'
								? 'text-aceite'
								: 'text-transparent [-webkit-text-stroke:1px_var(--color-acero-400)]'}"
							style="--i: {i}"
						>
							{g}
						</li>
					{/each}
				</ul>
			</div>
		</section>

		<!-- Productos -->
		<section id="productos" class="scroll-mt-20 border-b border-acero-200">
			<div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
				<div class="max-w-2xl">
					<h2 class="font-display text-4xl font-semibold">Lo que vas a encontrar</h2>
					<p class="mt-3 text-lg text-acero-600">
						Lubricantes y repuestos de mantenimiento para autos, camionetas, motos y maquinaria.
					</p>
				</div>
				<dl class="mt-10 grid border-t border-acero-200 sm:grid-cols-2 lg:grid-cols-3">
					{#each CATEGORIAS as c (c.nombre)}
						<div class="border-b border-acero-200 py-6 sm:pr-8">
							<dt class="flex items-center gap-2.5 text-lg font-semibold">
								<span class="h-5 w-1 rounded-full bg-marca" aria-hidden="true"></span>
								{c.nombre}
							</dt>
							<dd class="mt-1.5 pl-3.5 text-acero-600">{c.detalle}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</section>

		<!-- Horario y contacto -->
		<section id="visitanos" class="scroll-mt-20 bg-acero-50">
			<div class="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-20">
				<div>
					<h2 class="font-display text-4xl font-semibold">Horario de atención</h2>
					<table class="mt-6 w-full max-w-md text-lg">
						<caption class="sr-only">Horario de atención</caption>
						<tbody>
							{#each HORARIO as h (h.dias)}
								<tr class="border-b border-acero-200">
									<th scope="row" class="py-3 text-left font-medium text-acero-700">{h.dias}</th>
									<td
										class="py-3 text-right font-display text-xl font-semibold tabular-nums {h.horas ===
										'Cerrado'
											? 'text-acero-400'
											: 'text-acero-950'}">{h.horas}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div>
					<h2 class="font-display text-4xl font-semibold">Contacto</h2>
					<p class="mt-3 text-lg text-acero-600">
						Escríbenos para consultar precios, disponibilidad o el producto que necesita tu
						vehículo.
					</p>
					<dl class="mt-6 space-y-4 text-lg">
						<div>
							<dt class="text-sm text-acero-500">Teléfono y WhatsApp</dt>
							<dd>
								<a
									href="tel:+591{TELEFONO}"
									class="font-display text-3xl font-semibold tabular-nums hover:text-marca"
									>{TELEFONO.slice(0, 4)} {TELEFONO.slice(4)}</a
								>
							</dd>
						</div>
					</dl>
					<a
						href={WHATSAPP}
						target="_blank"
						rel="noopener noreferrer"
						class="mt-6 inline-flex h-12 items-center rounded-lg bg-acero-900 px-5 font-semibold text-white transition-colors hover:bg-acero-800"
					>
						Escribir por WhatsApp
					</a>
				</div>
			</div>
		</section>
	</main>

	<footer class="border-t border-acero-200">
		<div
			class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-acero-500 sm:flex-row sm:px-6"
		>
			<p>© {new Date().getFullYear()} Lubricantes Yolanda</p>
			<a
				href={destinoSistema}
				class="font-medium text-acero-700 hover:text-acero-950 hover:underline"
			>
				Acceso del personal
			</a>
		</div>
	</footer>
</div>

<style>
	/* Un único momento de movimiento: los grados entran en secuencia al cargar */
	.grados li {
		animation: entrar 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both;
		animation-delay: calc(var(--i) * 60ms + 150ms);
	}
	@keyframes entrar {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
