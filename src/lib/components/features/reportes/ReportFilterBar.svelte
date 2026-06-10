<script lang="ts">
	import { onMount } from 'svelte';
	import { Input, Select, Button } from '$lib/components/ui';
	import {
		sucursalService,
		proveedoresService,
		categoriaService,
		empleadosService
	} from '$lib/services';
	import type { Sucursal, Proveedor, Categoria, EmpleadoData } from '$lib/interfaces';
	import { FiltersIcon, RefreshIcon, PrinterIcon } from '$lib/icons/outline';
	import { fade } from 'svelte/transition';

	interface Props {
		desde?: string;
		hasta?: string;
		id_sucursal?: string;
		id_proveedor?: string;
		id_categoria?: string;
		id_empleado?: string;
		tipo_cliente?: string;
		metodo_pago?: string;
		estado_pago?: string;
		agrupar_por?: string;
		onFilter: () => void;
		onDownloadPdf?: () => void | Promise<void>;
		loading?: boolean;
		downloadingPdf?: boolean;
		showPaymentMethod?: boolean;
		showGrouping?: boolean;
		showProvider?: boolean;
		showPaymentStatus?: boolean;
		showCategory?: boolean;
		showEmployee?: boolean;
		showClientType?: boolean;
		showDateRange?: boolean;
	}

	let {
		desde = $bindable(),
		hasta = $bindable(),
		id_sucursal = $bindable(),
		id_proveedor = $bindable(),
		id_categoria = $bindable(),
		id_empleado = $bindable(),
		tipo_cliente = $bindable(),
		metodo_pago = $bindable(),
		estado_pago = $bindable(),
		agrupar_por = $bindable(),
		onFilter,
		onDownloadPdf,
		loading = false,
		downloadingPdf = false,
		showPaymentMethod = false,
		showGrouping = false,
		showProvider = false,
		showPaymentStatus = false,
		showCategory = false,
		showEmployee = false,
		showClientType = false,
		showDateRange = true
	}: Props = $props();

	let sucursales = $state<Sucursal[]>([]);
	let proveedores = $state<Proveedor[]>([]);
	let categorias = $state<Categoria[]>([]);
	let empleados = $state<EmpleadoData[]>([]);

	onMount(async () => {
		try {
			const [sucResponse, provResponse, catResponse, empResponse] = await Promise.all([
				sucursalService.getSucursalesActivas(),
				proveedoresService.getProveedoresNormal(),
				categoriaService.getCategorias({ perPage: 100 }),
				empleadosService.getEmpleados({ perPage: 100 })
			]);
			sucursales = sucResponse.sucursales;
			proveedores = provResponse;
			categorias = catResponse.categorias;
			empleados = empResponse.empleados;
		} catch (error) {
			console.error('Error loading filter data:', error);
		}
	});

	function handleApply() {
		onFilter();
	}
</script>

<div class="flex flex-col gap-4 p-6" in:fade>
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="rounded-lg bg-red-100 p-2 text-red-600">
				<FiltersIcon class="size-5" />
			</div>
			<h3 class="text-sm font-black tracking-tight text-light-black uppercase">
				Filtros de Análisis
			</h3>
		</div>

		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onclick={handleApply}
				disabled={loading}
				class="rounded-xl"
			>
				{#snippet leftIcon()}<RefreshIcon
						class="size-4 {loading ? 'animate-spin' : ''}"
					/>{/snippet}
				Actualizar
			</Button>
			<Button
				variant="primary"
				size="sm"
				class="rounded-xl"
				onclick={onDownloadPdf}
				disabled={!onDownloadPdf || downloadingPdf || loading}
			>
				{#snippet leftIcon()}
					<PrinterIcon class="size-4 {downloadingPdf ? 'animate-pulse' : ''}" />
				{/snippet}
				{downloadingPdf ? 'Generando...' : 'PDF'}
			</Button>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
		{#if showDateRange}
			<Input type="date" label="FECHA DESDE" bind:value={desde} />
			<Input type="date" label="FECHA HASTA" bind:value={hasta} min={desde} />
		{/if}

		<Select label="SUCURSAL" bind:value={id_sucursal}>
			<option value="">-- TODAS LAS SUCURSALES --</option>
			{#each sucursales as s (s.id)}
				<option value={s.id}>{s.nombre}</option>
			{/each}
		</Select>

		{#if showCategory}
			<Select label="CATEGORÍA" bind:value={id_categoria}>
				<option value="">-- TODAS LAS CATEGORÍAS --</option>
				{#each categorias as c (c.id)}
					<option value={c.id}>{c.nombre}</option>
				{/each}
			</Select>
		{/if}

		{#if showEmployee}
			<Select label="CAJERO / EMPLEADO" bind:value={id_empleado}>
				<option value="">-- TODOS LOS EMPLEADOS --</option>
				{#each empleados as e (e.id)}
					<option value={e.id}>{e.nombre} {e.apellido_paterno}</option>
				{/each}
			</Select>
		{/if}

		{#if showClientType}
			<Select label="TIPO DE CLIENTE" bind:value={tipo_cliente}>
				<option value="">-- TODOS --</option>
				<option value="MAY">MAYORISTAS</option>
				<option value="MIN">MINORISTAS</option>
			</Select>
		{/if}

		{#if showPaymentMethod}
			<Select label="MÉTODO DE PAGO" bind:value={metodo_pago}>
				<option value="">-- TODOS --</option>
				<option value="EFECTIVO">Efectivo</option>
				<option value="TARJETA">Tarjeta</option>
				<option value="TRANSFERENCIA">Transferencia</option>
				<option value="QR">QR / Pago Electrónico</option>
				<option value="CHEQUE">Cheque</option>
				<option value="OTRO">Otro</option>
			</Select>
		{/if}

		{#if showGrouping}
			<Select label="AGRUPAR POR" bind:value={agrupar_por}>
				<option value="dia">Día</option>
				<option value="semana">Semana</option>
				<option value="mes">Mes</option>
			</Select>
		{/if}

		{#if showProvider}
			<Select label="PROVEEDOR" bind:value={id_proveedor}>
				<option value="">-- TODOS --</option>
				{#each proveedores as p (p.id)}
					<option value={p.id}>{p.empresa || p.nombre}</option>
				{/each}
			</Select>
		{/if}

		{#if showPaymentStatus}
			<Select label="ESTADO DE PAGO" bind:value={estado_pago}>
				<option value="">-- TODOS --</option>
				<option value="PENDIENTE">Pendiente</option>
				<option value="PAGADO_PARCIAL">Pagado Parcial</option>
				<option value="PAGADO">Pagado</option>
			</Select>
		{/if}
	</div>
</div>
