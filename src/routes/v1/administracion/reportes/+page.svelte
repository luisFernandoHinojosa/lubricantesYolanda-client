<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import ReportCard from '$lib/components/features/reportes/ReportCard.svelte';
	import {
		ShoppingCartIcon,
		PackageIcon,
		BoxIcon,
		KeyIcon,
		UsersIcon,
		UserIcon,
		ArrowLeftIcon,
		TredingUpIcon
	} from '$lib/icons/outline';
	import { Heading, Button } from '$lib/components/ui';
	import VentasReport from '$lib/components/features/reportes/ventas/VentasReport.svelte';
	import ComprasReport from '$lib/components/features/reportes/compras/ComprasReport.svelte';
	import InventarioReport from '$lib/components/features/reportes/inventario/InventarioReport.svelte';
	import FinancieroReport from '$lib/components/features/reportes/financiero/FinancieroReport.svelte';
	import SesionesCajaReport from '$lib/components/features/reportes/sesiones/SesionesCajaReport.svelte';
	import ProductosReport from '$lib/components/features/reportes/productos/ProductosReport.svelte';
	import ClientesReport from '$lib/components/features/reportes/clientes/ClientesReport.svelte';
	import EmpleadosReport from '$lib/components/features/reportes/empleados/EmpleadosReport.svelte';
	import { CoinIcon, ReportAnalyticsIcon } from '$lib/icons/solid';
	import { MainLayout } from '$lib/components/layout';

	let activeReport = $state<string | null>(null);

	const categories = [
		{
			name: 'Finanzas',
			description: 'Análisis de ingresos, egresos y rentabilidad',
			reports: [
				{
					id: 'ventas',
					title: 'Ventas',
					description: 'Resumen de ingresos y transacciones detalladas',
					icon: CoinIcon
				},
				{
					id: 'compras',
					title: 'Compras',
					description: 'Seguimiento de adquisiciones e inversiones',
					icon: ShoppingCartIcon
				},
				{
					id: 'financiero',
					title: 'Flujo de Caja',
					description: 'Balance general de movimientos monetarios',
					icon: TredingUpIcon
				}
			]
		},
		{
			name: 'Inventario',
			description: 'Gestión de existencias y movimiento de productos',
			reports: [
				{
					id: 'inventario',
					title: 'Stock Actual',
					description: 'Valoración y cantidad física en almacenes',
					icon: PackageIcon
				},
				{
					id: 'productos',
					title: 'Rotación',
					description: 'Análisis de productos',
					icon: BoxIcon
				}
			]
		},
		{
			name: 'Operaciones',
			description: 'Control administrativo y desempeño del personal',
			reports: [
				{
					id: 'sesiones',
					title: 'Sesiones Caja',
					description: 'Control de aperturas, cierres y arqueos',
					icon: KeyIcon,
					color: 'bg-red-50 text-red-600'
				},
				{
					id: 'empleados',
					title: 'Desempeño',
					description: 'Productividad y ventas por personal',
					icon: UserIcon,
					color: 'bg-purple-50 text-purple-600'
				}
			]
		},
		{
			name: 'Clientes',
			description: 'Relación y comportamiento de compra',
			reports: [
				{
					id: 'clientes',
					title: 'Fidelidad',
					description: 'Ranking de clientes y deudas pendientes',
					icon: UsersIcon,
					color: 'bg-emerald-50 text-emerald-600'
				}
			]
		}
	];

	function selectReport(id: string) {
		activeReport = id;
	}

	function goBack() {
		activeReport = null;
	}
</script>

<MainLayout
	title="Reportes generales"
	description="Selecciona un reporte para generar el informe correspondiente."
	class="container mx-auto space-y-6"
>
	{#if !activeReport}
		<div in:fade={{ duration: 400 }}>
			<div class="mb-4 flex items-center gap-4">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-600/20"
				>
					<ReportAnalyticsIcon class="size-6 text-white" />
				</div>
				<Heading level="h4">Centro de Reportes</Heading>
			</div>
		</div>

		<div class="space-y-12">
			{#each categories as category (category.name)}
				<section class="space-y-6" in:slide={{ duration: 500 }}>
					<div class="flex flex-col gap-1">
						<h2 class="text-md font-black tracking-tight text-light-black uppercase">
							{category.name}
						</h2>
						<p class="text-xs font-bold tracking-widest text-light-black/40 uppercase">
							{category.description}
						</p>
					</div>

					<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{#each category.reports as report (report.id)}
							<ReportCard
								title={report.title}
								description={report.description}
								onclick={() => selectReport(report.id)}
							>
								{#snippet icon()}
									<report.icon class="size-8" />
								{/snippet}
							</ReportCard>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col gap-6" in:fade={{ duration: 300 }}>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<Button variant="outline" size="sm" onclick={goBack} class="h-10 w-10 rounded-xl p-0">
						{#snippet leftIcon()}<ArrowLeftIcon class="size-5" />{/snippet}
					</Button>
					<div>
						<h1 class="text-md font-black tracking-tight text-light-black uppercase">
							Reporte de {activeReport}
						</h1>
						<p class="mt-1 text-xs font-normal tracking-widest text-light-two uppercase">
							Administración / Reportes / {activeReport}
						</p>
					</div>
				</div>
			</div>

			<div>
				{#if activeReport === 'ventas'}
					<VentasReport />
				{:else if activeReport === 'compras'}
					<ComprasReport />
				{:else if activeReport === 'inventario'}
					<InventarioReport />
				{:else if activeReport === 'financiero'}
					<FinancieroReport />
				{:else if activeReport === 'sesiones'}
					<SesionesCajaReport />
				{:else if activeReport === 'productos'}
					<ProductosReport />
				{:else if activeReport === 'clientes'}
					<ClientesReport />
				{:else if activeReport === 'empleados'}
					<EmpleadosReport />
				{:else}
					<div
						class="flex h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-light-four bg-light-one text-center"
					>
						<BoxIcon class="mb-4 size-16 text-light-black/20" />
						<h3 class="text-xl font-bold text-light-black/40 uppercase">En Desarrollo</h3>
						<p class="mt-1 text-xs tracking-widest text-light-black/30 uppercase">
							Este reporte estará disponible próximamente
						</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</MainLayout>
