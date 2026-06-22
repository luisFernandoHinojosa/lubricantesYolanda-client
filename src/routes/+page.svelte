<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { redirect } from '$lib/utils';
	import { onMount } from 'svelte';

	let visible: boolean = $state(false);
	let featuresVisible: boolean = $state(false);
	let contactVisible: boolean = $state(false);

	onMount(() => {
		visible = true;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						if (entry.target.id === 'features') featuresVisible = true;
						if (entry.target.id === 'contact') contactVisible = true;
					}
				});
			},
			{ threshold: 0.1 }
		);

		const featuresEl = document.getElementById('features');
		const contactEl = document.getElementById('contact');
		if (featuresEl) observer.observe(featuresEl);
		if (contactEl) observer.observe(contactEl);

		return () => observer.disconnect();
	});

	const features = [
		{
			icon: '🔩',
			title: 'Inventario Inteligente',
			desc: 'Control total de stock de pernos, herramientas, pinturas y miles de SKUs con alertas automáticas de reorden.'
		},
		{
			icon: '🧾',
			title: 'Punto de Venta Rápido',
			desc: 'Cobros ágiles con lector de códigos de barra, múltiples métodos de pago y emisión de facturas al instante.'
		},
		{
			icon: '📊',
			title: 'Reportes en Tiempo Real',
			desc: 'Dashboards de ventas diarias, semanales y mensuales. Conoce tus productos más rentables.'
		},
		{
			icon: '👥',
			title: 'Gestión de Clientes',
			desc: 'Historial de compras, crédito a clientes frecuentes y seguimiento de cuentas por cobrar.'
		},
		{
			icon: '🏷️',
			title: 'Control de Precios',
			desc: 'Actualización masiva de precios, descuentos por categoría y listas de precios por cliente.'
		},
		{
			icon: '🔐',
			title: 'Acceso Controlado',
			desc: 'Los usuarios son creados y administrados por el administrador del sistema. Seguridad total sobre quién accede.'
		}
	];
</script>

<div class="min-h-dvh overflow-x-hidden bg-light-one font-sans text-zinc-100">
	<nav
		class="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-light-four bg-light-one_d px-8 py-4 backdrop-blur-md"
	>
		<div class="flex items-center">
			<img src="/images/logo2.webp" alt="" class="h-16 w-52" />
		</div>
		<div class="hidden items-center gap-8 text-sm text-light-black md:flex">
			<a href="#features" class="transition-colors hover:text-light-black/30">Características</a>
			<a href="#how" class="transition-colors hover:text-light-black/30">¿Cómo funciona?</a>
			<a href="#contact" class="transition-colors hover:text-light-black/30">Contacto</a>
		</div>
		<Button onclick={() => redirect('/auth/sign-in')} variant="primary">Iniciar sesion</Button>
	</nav>

	<section class="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
		<div
			class="absolute inset-0 opacity-5"
			style="background-image: radial-gradient(circle, #d97706 1px, transparent 1px); background-size: 32px 32px;"
		></div>
		<div
			class="pointer-events-none absolute top-1/3 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl"
		></div>

		<div
			class="relative z-10 mx-auto max-w-5xl px-6 text-center transition-all duration-1000 {visible
				? 'translate-y-0 opacity-100'
				: 'translate-y-10 opacity-0'}"
		>
			<h1
				class="my-6 text-6xl leading-none tracking-tight text-light-two md:text-8xl lg:text-9xl"
				style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em;"
			>
				VENDE MÁS.<br />
				<span class="text-light-accent">CONTROLA</span><br />
				TODO.
			</h1>

			<p class="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-light-black md:text-xl">
				El sistema POS diseñado específicamente para ferreterías. Inventario, ventas, clientes y
				reportes en una sola plataforma. Acceso gestionado por tu administrador.
			</p>

			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<Button href="#" variant="secondary">Solicitar una Demo</Button>
				<Button href="#features" variant="outline">Ver características</Button>
			</div>
		</div>
	</section>

	<section id="features" class="relative px-6 py-28">
		<div
			class="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"
		></div>

		<div class="mx-auto max-w-6xl">
			<div
				class="mb-16 text-center transition-all duration-700 {featuresVisible
					? 'translate-y-0 opacity-100'
					: 'translate-y-8 opacity-0'}"
			>
				<p class="mb-3 text-sm font-semibold tracking-widest text-light-two uppercase">
					Funcionalidades
				</p>
				<h2
					class="text-4xl font-bold text-light-three md:text-5xl"
					style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.03em;"
				>
					TODO LO QUE TU FERRETERÍA NECESITA
				</h2>
			</div>

			<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
				{#each features as feature, i (i)}
					<div
						class="group rounded-xl p-6 transition-all duration-300 hover:-translate-y-1
            {featuresVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}"
						style="transition-delay: {i *
							80}ms; transition-property: opacity, transform, border-color, background-color;"
					>
						<div
							class="mb-4 inline-block rounded bg-light-three p-1 text-3xl transition-transform group-hover:scale-110"
						>
							{feature.icon}
						</div>
						<h3 class="mb-2 text-lg font-semibold text-light-black">{feature.title}</h3>
						<p class="text-sm leading-relaxed text-light-black/80">{feature.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section id="how" class="relative px-6 py-28">
		<div
			class="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-zinc-700 to-transparent"
		></div>
		<div
			class="absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-zinc-700 to-transparent"
		></div>

		<div class="mx-auto max-w-4xl">
			<div class="mb-16 text-center">
				<p class="mb-3 text-sm font-semibold tracking-widest text-light-three uppercase">Proceso</p>
				<h2
					class="text-4xl font-bold text-light-two md:text-5xl"
					style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.03em;"
				>
					¿CÓMO EMPEZAR?
				</h2>
				<p class="mx-auto mt-4 max-w-xl text-black">
					El acceso al sistema es gestionado por el administrador. No existe el autoregistro — así
					garantizamos la seguridad de tu negocio.
				</p>
			</div>

			<div class="relative">
				<div
					class="absolute top-10 right-[calc(16.67%+1.5rem)] left-[calc(16.67%+1.5rem)] hidden h-px bg-linear-to-r from-light-three/50 via-light-three/30 to-light-three/50 md:block"
				></div>

				<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
					{#each [{ num: '01', title: 'Contáctanos', desc: 'Llena el formulario de contacto o escríbenos. Evaluamos tu negocio y preparamos tu instancia.' }, { num: '02', title: 'Configuración', desc: 'Configuramos el sistema con tus categorías, productos y precios iniciales. Listo para usar.' }, { num: '03', title: 'Tú creas usuarios', desc: 'El administrador crea y gestiona las cuentas de sus cajeros y empleados. Control total.' }] as step, index (index)}
						<div class="flex flex-col items-center text-center">
							<div
								class="relative z-10 mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-light-four bg-light-three"
							>
								<span
									class="text-2xl font-black text-light-one"
									style="font-family: 'Bebas Neue', sans-serif;">{step.num}</span
								>
							</div>
							<h3 class="mb-2 text-lg font-semibold text-black">{step.title}</h3>
							<p class="text-sm leading-relaxed text-black/60">{step.desc}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<footer class="border-t border-light-three px-6 py-8">
		<div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
			<div class="flex items-center">
				<img src="/images/logo1.webp" alt="" class="h-10 w-52" />
			</div>

			<p class="text-xs text-light-two">© {new Date().getFullYear()} Lubricantes Yolanda</p>
		</div>
	</footer>
</div>
