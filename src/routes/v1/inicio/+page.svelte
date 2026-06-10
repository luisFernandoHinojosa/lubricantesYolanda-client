<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { dashboardService } from '$lib/services/dashboard.service';
	import {
		Chart,
		BarElement,
		BarController,
		LineElement,
		LineController,
		PointElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Legend,
		Filler
	} from 'chart.js';
	import MainLayout from '$lib/components/layout/mainLayout.svelte';
	import { CarIcon } from '$lib/icons/solid';
	import { BoxIcon, FileDescriptionIcon, ShoppingCartIcon, UsersIcon } from '$lib/icons/outline';

	Chart.register(
		BarElement,
		BarController,
		LineElement,
		LineController,
		PointElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Legend,
		Filler
	);

	let resumen: any = null;
	let chartData: any = null;
	let clientesTop: any[] = [];
	let productosStock: any[] = [];
	let ultimosMovimientos: any[] = [];
	let cobranzasPendientes: any[] = [];
	let topProductos: any[] = [];
	let productosVencer: any[] = [];

	let chartInstance: any = null;
	let chartCanvas: HTMLCanvasElement;
	let tipoGrafico: 'bar' | 'line' = 'bar';
	let filtroTiempo: 'semana' | 'mes' | 'año' = 'año';
	let loading = true;

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const [
				resResumen,
				resChart,
				resClientes,
				resStock,
				resMovs,
				resCobranzas,
				resTop,
				resVencer
			] = await Promise.all([
				dashboardService.getResumen(),
				dashboardService.getChartData(filtroTiempo),
				dashboardService.getClientesTop(),
				dashboardService.getProductosStock(),
				dashboardService.getUltimosMovimientos(),
				dashboardService.getCobranzasPendientes(),
				dashboardService.getProductosMasVendidos(),
				dashboardService.getProductosPorVencer()
			]);

			resumen = resResumen;
			chartData = resChart;
			clientesTop = resClientes;
			productosStock = resStock;
			ultimosMovimientos = resMovs;
			cobranzasPendientes = resCobranzas;
			topProductos = resTop;
			productosVencer = resVencer;

			await tick(); // wait for Svelte to update DOM (canvas must exist)
			updateChart();
		} catch (error) {
			console.error('Error loading dashboard data', error);
		} finally {
			loading = false;
		}
	}

	function updateChart() {
		if (!chartCanvas || !chartData) return;
		if (chartInstance) chartInstance.destroy();

		const ctx = chartCanvas.getContext('2d');

		const gradIngreso = ctx!.createLinearGradient(0, 0, 0, 320);
		gradIngreso.addColorStop(0, 'rgba(16, 185, 129, 0.85)');
		gradIngreso.addColorStop(1, 'rgba(16, 185, 129, 0.05)');

		const gradEgreso = ctx!.createLinearGradient(0, 0, 0, 320);
		gradEgreso.addColorStop(0, 'rgba(239, 68, 68, 0.75)');
		gradEgreso.addColorStop(1, 'rgba(239, 68, 68, 0.05)');

		chartInstance = new Chart(chartCanvas, {
			type: tipoGrafico,
			data: {
				labels: chartData.labels,
				datasets: [
					{
						label: 'Ventas',
						data: chartData.datasets.ingresos,
						backgroundColor: tipoGrafico === 'bar' ? gradIngreso : 'rgba(16,185,129,0.08)',
						borderColor: '#10b981',
						borderWidth: tipoGrafico === 'bar' ? 0 : 2.5,
						borderRadius: tipoGrafico === 'bar' ? 8 : 0,
						borderSkipped: false,
						fill: tipoGrafico === 'line',
						pointBackgroundColor: '#10b981',
						pointBorderColor: '#0f172a',
						pointBorderWidth: 2,
						pointRadius: tipoGrafico === 'line' ? 5 : 0,
						pointHoverRadius: 7,
						tension: 0.45
					},
					{
						label: 'Costos',
						data: chartData.datasets.egresos,
						backgroundColor: tipoGrafico === 'bar' ? gradEgreso : 'rgba(239,68,68,0.08)',
						borderColor: '#ef4444',
						borderWidth: tipoGrafico === 'bar' ? 0 : 2.5,
						borderRadius: tipoGrafico === 'bar' ? 8 : 0,
						borderSkipped: false,
						fill: tipoGrafico === 'line',
						pointBackgroundColor: '#ef4444',
						pointBorderColor: '#0f172a',
						pointBorderWidth: 2,
						pointRadius: tipoGrafico === 'line' ? 5 : 0,
						pointHoverRadius: 7,
						tension: 0.45
					},
					{
						label: 'Utilidad neta',
						data: chartData.datasets.saldo_acumulado,
						backgroundColor: 'rgba(251, 191, 36, 0.05)',
						borderColor: '#fbbf24',
						borderWidth: 2.5,
						type: 'line',
						fill: false,
						pointBackgroundColor: '#fbbf24',
						pointBorderColor: '#0f172a',
						pointBorderWidth: 2,
						pointRadius: 5,
						pointHoverRadius: 7,
						tension: 0.45,
						borderDash: tipoGrafico === 'bar' ? [6, 3] : []
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { mode: 'index', intersect: false },
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: '#0f172a',
						titleColor: '#f8fafc',
						bodyColor: '#94a3b8',
						borderColor: '#1e293b',
						borderWidth: 1,
						padding: 14,
						boxPadding: 6,
						usePointStyle: true,
						titleFont: { size: 13, weight: 'bold', family: "'DM Sans', sans-serif" },
						bodyFont: { size: 12, family: "'DM Sans', sans-serif" },
						cornerRadius: 10,
						callbacks: {
							label: (ctx) => {
								const label = ctx.dataset.label || '';
								const val = ctx.parsed.y;
								if (val == null) return label;
								return `  ${label}: Bs. ${val.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
							}
						}
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							color: '#64748b',
							font: { size: 11, family: "'DM Sans', sans-serif" },
							callback: (v: any) => 'Bs ' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)
						},
						border: { display: false },
						grid: { color: 'rgba(100,116,139,0.12)', drawTicks: false }
					},
					x: {
						ticks: {
							color: '#64748b',
							font: { size: 11, family: "'DM Sans', sans-serif" }
						},
						border: { display: false },
						grid: { display: false }
					}
				}
			}
		});
	}

	async function handleFiltroChange(event: Event) {
		filtroTiempo = (event.target as HTMLSelectElement).value as any;
		await loadData();
	}

	function handleGraphTypeChange(type: 'bar' | 'line') {
		tipoGrafico = type;
		updateChart();
	}

	function fmt(n: number) {
		return n?.toLocaleString('en-US', { minimumFractionDigits: 0 }) ?? '0';
	}

	function fmtBs(n: number) {
		return `Bs. ${fmt(n)}`;
	}

	$: saldoPositivo = chartData?.totales?.saldo_acumulado >= 0;

	// Re-render chart reactively whenever chartData or tipoGrafico changes
	$: if (chartCanvas && chartData) {
		updateChart();
	}
</script>

<MainLayout
	title="Inicio"
	description="Reportes generales de la empresa."
	class="container mx-auto flex flex-col gap-5"
>
	{#if resumen}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
			<div
				class="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-light-four bg-transparent p-5"
			>
				<div
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-light-one text-2xl text-light-three"
				>
					<ShoppingCartIcon class="size-6" />
				</div>
				<div class="flex flex-col gap-2">
					<span class=" font-medium tracking-wider text-light-black uppercase">Ventas del Día</span>
					<span class="text-2xl font-bold text-light-black">{fmtBs(resumen.ventasDelDia)}</span>
					<span
						class="mt-1 w-fit rounded-full bg-green-100 px-2 py-1.5 text-[0.68rem] font-semibold text-light-success"
						>↑ activo hoy</span
					>
				</div>
			</div>
			<div
				class="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-light-four bg-transparent p-5"
			>
				<div
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-light-one text-2xl text-light-three"
				>
					<BoxIcon class="size-6" />
				</div>
				<div class="flex flex-col gap-2">
					<span class=" font-medium tracking-wider text-light-black uppercase"
						>Inventario Valorizado</span
					>
					<span class="text-2xl font-bold text-light-black"
						>{fmtBs(resumen.inventarioValorizado)}</span
					>
					<span
						class="mt-1 w-fit rounded-full bg-light-one px-2 py-1.5 text-xs font-semibold text-light-warning"
						>en stock</span
					>
				</div>
			</div>
			<div
				class="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-light-four bg-transparent p-5"
			>
				<div
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-light-one text-2xl text-light-three"
				>
					<FileDescriptionIcon class="size-6" />
				</div>
				<div class="flex flex-col gap-2">
					<span class=" font-medium tracking-wider text-light-black uppercase"
						>Pedidos Pendientes</span
					>
					<span class="text-2xl font-bold text-light-black">{resumen.pedidosPendientes}</span>
					<span
						class="mt-1 w-fit rounded-full bg-amber-100 px-2 py-1.5 text-xs font-semibold text-light-warning"
						>proveedores</span
					>
				</div>
			</div>
			<div
				class="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-light-four bg-transparent p-5"
			>
				<div
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-light-one text-2xl text-light-three"
				>
					<UsersIcon class="size-6" />
				</div>
				<div class="flex flex-col gap-2">
					<span class=" font-medium tracking-wider text-light-black uppercase"
						>Clientes Registrados</span
					>
					<span class="text-2xl font-bold text-light-black"
						>{resumen.resumenUsuarios?.clientes ?? 0}</span
					>
					<span
						class="mt-1 w-fit rounded-full bg-green-100 px-2 py-1.5 text-xs font-semibold text-light-success"
						>base activa</span
					>
				</div>
			</div>
		</div>
	{/if}

	<!-- ── MAIN ROW ── -->
	<div class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
		<!-- Chart Panel -->
		<div class="flex flex-col gap-4 rounded-2xl border border-light-four bg-transparent p-6">
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div class="flex flex-col">
					<span class="text-xs font-semibold tracking-wide text-light-black uppercase"
						>Rendimiento de ventas</span
					>
					<h2 class="mt-1 mb-2 text-2xl leading-none font-extrabold text-light-black">
						Análisis Financiero
					</h2>
					{#if chartData}
						<div class="flex flex-wrap items-center gap-2">
							<span class="text-sm text-light-black">Utilidad acumulada</span>
							<span class=" text-2xl font-extrabold text-light-black"
								>{fmtBs(chartData.totales.saldo_acumulado)}</span
							>
							<span
								class="rounded-full px-3 py-1.5 text-sm font-bold {saldoPositivo
									? 'bg-green-100 text-light-success'
									: 'bg-red-100 text-light-error'}"
							>
								{saldoPositivo ? '▲' : '▼'}
								{saldoPositivo ? 'positivo' : 'negativo'}
							</span>
						</div>
					{/if}
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<select
						class="cursor-pointer rounded-xl border border-light-one_d bg-light-one_d px-1.5 py-1.5 text-sm text-light-black outline-none focus:border-blue-500"
						on:change={handleFiltroChange}
					>
						<option value="semana">Esta semana</option>
						<option value="mes">Este mes</option>
						<option value="año" selected>Año completo</option>
					</select>
					<div class="flex overflow-hidden rounded-xl border border-light-one_d bg-light-one_d">
						<button
							class="flex cursor-pointer items-center gap-2 border-none px-1.5 py-1.5 text-xs font-medium text-light-black transition-all duration-150 {tipoGrafico ===
							'bar'
								? 'bg-light-black text-light-one'
								: ''}"
							on:click={() => handleGraphTypeChange('bar')}
						>
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
								<rect x="1" y="5" width="3" height="8" rx="1" fill="currentColor" />
								<rect x="5.5" y="2" width="3" height="11" rx="1" fill="currentColor" />
								<rect x="10" y="7" width="3" height="6" rx="1" fill="currentColor" />
							</svg>
							Barras
						</button>
						<button
							class="flex cursor-pointer items-center gap-2 border-none px-1.5 py-1.5 text-xs font-medium text-light-black transition-all duration-150 {tipoGrafico ===
							'line'
								? 'bg-light-black text-light-one'
								: 'hover:text-light-black'}"
							on:click={() => handleGraphTypeChange('line')}
						>
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
								<path
									d="M1 10 L4 6 L7 8 L10 3 L13 5"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									fill="none"
								/>
							</svg>
							Líneas
						</button>
					</div>
				</div>
			</div>

			<div class="relative h-72">
				<canvas bind:this={chartCanvas}></canvas>
			</div>

			{#if chartData}
				<div class="flex flex-wrap gap-6 border-t border-light-one_d pt-2">
					<div class="flex items-center gap-2">
						<span class="h-3 w-3 shrink-0 rounded-full bg-light-success"></span>
						<span class="text-base text-light-black">Ventas</span>
						<span class="text-base font-bold text-light-black"
							>{fmtBs(chartData.totales.ingresos)}</span
						>
					</div>
					<div class="flex items-center gap-2">
						<span class="h-3 w-3 shrink-0 rounded-full bg-light-error"></span>
						<span class="text-base text-light-black">Costos</span>
						<span class="text-base font-bold text-light-black"
							>{fmtBs(chartData.totales.egresos)}</span
						>
					</div>
					<div class="flex items-center gap-2">
						<span class="h-[10px] w-[10px] shrink-0 rounded-full bg-light-warning"></span>
						<span class="text-[0.78rem] text-light-black">Utilidad neta</span>
						<span
							class="text-[0.82rem] font-bold {saldoPositivo
								? 'text-light-success'
								: 'text-light-error'}">{fmtBs(chartData.totales.saldo_acumulado)}</span
						>
					</div>
				</div>
			{/if}
		</div>

		<!-- Clientes Top -->
		<div class="flex flex-col overflow-hidden rounded-2xl border border-light-four bg-transparent">
			<div class="flex items-end justify-between border-b border-light-one_d px-5 pt-5 pb-3">
				<div>
					<p class="m-0 mb-1 text-sm font-semibold tracking-wide text-light-black uppercase">
						Ranking
					</p>
					<h3 class="m-0 text-base font-extrabold text-light-black">Mejores Clientes</h3>
				</div>
				<button
					class="cursor-pointer border-none bg-none p-0 text-xs font-semibold text-blue-500 hover:underline"
					>Ver todo →</button
				>
			</div>
			<div class="flex-1 overflow-y-auto p-2">
				{#each clientesTop as cliente, i (i)}
					<div
						class="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-100 hover:bg-light-one_d"
					>
						<div
							class="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[0.72rem] font-extrabold {i +
								1 ===
							1
								? 'bg-[#fef3c7] text-[#d97706]'
								: i + 1 === 2
									? 'bg-[#f1f5f9] text-[#64748b]'
									: i + 1 === 3
										? 'bg-[#fce7f3] text-[#db2777]'
										: 'bg-light-one_d text-gray-400'}"
						>
							{i + 1}
						</div>
						<div class="flex flex-1 flex-col">
							<span class="text-[0.82rem] font-semibold text-light-black"
								>{cliente.nombre} {cliente.apellido_paterno}</span
							>
							<span class="text-[0.72rem] text-gray-400">CI. {cliente.ci}</span>
						</div>
						<div class="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-light-success">
							{cliente.puntos}<span class="text-xs font-medium">pts</span>
						</div>
					</div>
				{/each}
				{#if clientesTop.length === 0}
					<p class="m-0 py-6 text-center text-[0.82rem] text-gray-400">Sin clientes registrados</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- ── BOTTOM GRID ── -->
	<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-[1fr_1fr_360px]">
		<!-- Últimos movimientos -->
		<div class="flex flex-col overflow-hidden rounded-2xl border border-light-four bg-transparent">
			<div class="flex items-end justify-between border-b border-light-one_d px-5 pt-5 pb-3">
				<div>
					<p class="m-0 mb-1 text-sm font-semibold tracking-wide text-light-black uppercase">
						Kardex
					</p>
					<h3 class="m-0 text-base font-extrabold text-light-black">Últimos Movimientos</h3>
				</div>
				<button
					class="cursor-pointer border-none bg-none p-0 text-xs font-semibold text-blue-500 hover:underline"
					>Ver todo →</button
				>
			</div>
			<div class="p-2">
				{#each ultimosMovimientos as mv, index (index)}
					<div
						class="flex items-center gap-3 rounded-xl px-3 py-1 transition-colors duration-100 hover:bg-light-one_d"
					>
						<div class="w-11 shrink-0 text-sm text-light-black">
							{mv.numero}
						</div>
						<div class="flex flex-1 flex-col">
							<span class="max-w-[160px] truncate text-base font-semibold text-light-black"
								>{mv.cliente_proveedor}</span
							>
							<span class="text-sm text-light-black">Venta / despacho</span>
						</div>
						<div class="flex flex-col items-end gap-2">
							<span class="text-base font-bold text-light-black">{fmtBs(mv.monto)}</span>
							<span
								class="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-light-success"
							>
								{mv.estado}
							</span>
						</div>
					</div>
				{/each}
				{#if ultimosMovimientos.length === 0}
					<p class="m-0 py-6 text-center text-[0.82rem] text-gray-400">Sin movimientos recientes</p>
				{/if}
			</div>
		</div>

		<!-- Stock de Productos -->
		<div class="flex flex-col overflow-hidden rounded-2xl border border-light-four bg-transparent">
			<div class="flex items-end justify-between border-b border-light-one_d px-5 pt-5 pb-3">
				<div>
					<p class="m-0 mb-1 text-sm font-semibold tracking-wide text-light-black uppercase">
						Almacén
					</p>
					<h3 class="m-0 text-base font-extrabold text-light-black">Stock de Productos</h3>
				</div>
				<button
					class="cursor-pointer border-none bg-none p-0 text-xs font-semibold text-blue-500 hover:underline"
					>Ver todo →</button
				>
			</div>
			<div class="p-2">
				{#each productosStock as pr, index (index)}
					<div
						class="flex items-center gap-3 rounded-xl px-3 py-1 transition-colors duration-100 hover:bg-light-one_d"
					>
						<div class="shrink-0 text-lg text-light-black">📦</div>
						<div class="flex flex-1 flex-col gap-2">
							<span class="max-w-[140px] truncate text-sm font-semibold text-light-black"
								>{pr.nombre}</span
							>
							<div class="h-1 overflow-hidden rounded-full bg-light-one_d">
								<div
									class="h-full rounded-full transition-all duration-400 ease-out"
									style="width: {Math.min(
										100,
										(pr.cantidad_actual / Math.max(pr.stock_minimo * 2, 1)) * 100
									)}%; background: {pr.estado === 'Crítico' ? '#ef4444' : '#10b981'}"
								></div>
							</div>
						</div>
						<div class="flex flex-col items-end gap-2">
							<span class="text-base font-bold text-light-black">{pr.cantidad_actual}</span>
							<span
								class="rounded-full px-2 py-1 text-xs font-bold {pr.estado === 'Crítico'
									? 'bg-red-100 text-light-error'
									: 'bg-blue-100 text-blue-600'}">{pr.estado}</span
							>
						</div>
					</div>
				{/each}
				{#if productosStock.length === 0}
					<p class="m-0 py-6 text-center text-[0.82rem] text-gray-400">Sin datos de stock</p>
				{/if}
			</div>
		</div>

		<!-- Top Vendidos + Por Vencer -->
		<div class="flex flex-col gap-5">
			<div
				class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-light-four bg-transparent"
			>
				<div class="flex items-end justify-between border-b border-light-one_d px-5 pt-5 pb-3">
					<div>
						<p class="m-0 mb-1 text-sm font-semibold tracking-wide text-light-black uppercase">
							Análisis
						</p>
						<h3 class="m-0 text-base font-extrabold text-light-black">Mas Vendidos</h3>
					</div>
				</div>
				<div class="p-2">
					{#each topProductos as prod, index (index)}
						<div
							class="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-100 hover:bg-light-one_d"
						>
							<span class="w-5 shrink-0 text-center text-base font-bold text-light-black"
								>{index + 1}</span
							>
							<span class="flex-1 text-base font-medium text-light-black">{prod.nombre}</span>
							<span class="text-base font-bold text-light-success"
								>{prod.cantidad}
								<small class="text-[0.68rem] font-normal text-gray-400">uds</small></span
							>
						</div>
					{/each}
				</div>
			</div>
			<div
				class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-light-four bg-transparent"
			>
				<div class="flex items-end justify-between border-b border-light-one_d px-5 pt-5 pb-3">
					<div>
						<p class="m-0 mb-1 text-sm font-semibold tracking-wide text-light-black uppercase">
							Alertas
						</p>
						<h3 class="m-0 text-base font-extrabold text-light-black">Por Vencer</h3>
					</div>
				</div>
				<div class="p-2">
					{#each productosVencer as prod, index (index)}
						<div
							class="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-100 hover:bg-light-one_d"
						>
							<span class="shrink-0 text-base">⚠️</span>
							<span class="flex-1 text-base font-medium text-light-black">{prod.nombre}</span>
							<span class="text-base font-bold text-light-error"
								>{new Date(prod.fecha).toLocaleDateString('es-ES')}</span
							>
						</div>
					{/each}
					{#if productosVencer.length === 0}
						<p class="m-0 py-6 text-center text-base text-light-black">Sin productos por vencer</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</MainLayout>
