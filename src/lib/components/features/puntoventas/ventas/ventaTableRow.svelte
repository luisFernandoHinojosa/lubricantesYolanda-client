<script lang="ts">
	import type { VentaListItem } from '$lib/interfaces/venta.interface';
	import {
		EyeIcon,
		PrinterIcon,
		DotsVerticalIcon,
		XMarkIcon,
		FileDescriptionIcon,
		RefreshIcon,
		XIcon
	} from '$lib/icons/outline';
	import { Button, DropdownMenu } from '$lib/components/ui';
	import type { DropdownOption } from '$lib/interfaces';

	interface Props {
		venta: VentaListItem;
		onView?: (id: string) => void;
		onPrint?: (id: string) => void;
		onAnular?: (id: string) => void;
		// Facturar (sin factura) y volver a emitir (factura con error o anulada) abren el mismo modal
		onFacturar?: (venta: VentaListItem) => void;
		onAnularFactura?: (venta: VentaListItem) => void;
		isLoadingDetalles?: boolean;
		isLoadingPrint?: boolean;
		isAnulando?: boolean;
	}

	let {
		venta,
		onView,
		onPrint,
		onAnular,
		onFacturar,
		onAnularFactura,
		isLoadingDetalles = false,
		isLoadingPrint = false,
		isAnulando = false
	}: Props = $props();

	const CI_CLIENTE_GENERICO = '000000';

	let anulada = $derived(venta.estado === 'ANULADA');
	let estadoFactura = $derived(venta.factura?.estado ?? null);
	// Venta vigente sin factura → facturar; con factura fallida o anulada → volver a emitir
	let facturable = $derived(!anulada && estadoFactura === null);
	let reemitible = $derived(!anulada && (estadoFactura === 'ERROR' || estadoFactura === 'ANULADA'));
	// Una venta con factura emitida no se anula: primero se anula la factura
	let facturada = $derived(estadoFactura === 'FACTURADA');
	// Hubo devoluciones o cambios: el neto difiere de lo cobrado
	let tieneMovimientos = $derived(!anulada && venta.total_neto !== venta.total);

	const FACTURA_BADGE: Record<string, { texto: string; clase: string }> = {
		FACTURADA: { texto: 'Facturada', clase: 'bg-emerald-100 text-emerald-700' },
		ERROR: { texto: 'Factura con error', clase: 'bg-red-100 text-red-700' },
		PENDIENTE: { texto: 'Facturando…', clase: 'bg-amber-100 text-amber-700' },
		ANULADA: { texto: 'Factura anulada', clase: 'bg-gray-200 text-gray-700' }
	};

	let isDropdownOpen = $state(false);
	let triggerElement = $state<HTMLElement>();

	const todasLasOpciones: DropdownOption[] = [
		{
			id: 'view',
			label: 'Ver detalles',
			icon: EyeIcon,
			action: () => onView?.(venta.id)
		},
		{
			id: 'print',
			label: 'Imprimir',
			icon: PrinterIcon,
			action: () => onPrint?.(venta.id)
		},
		{
			id: 'facturar',
			label: 'Facturar',
			icon: FileDescriptionIcon,
			action: () => onFacturar?.(venta)
		},
		{
			id: 'reemitir',
			label: 'Volver a emitir factura',
			icon: RefreshIcon,
			action: () => onFacturar?.(venta)
		},
		{
			id: 'anular-factura',
			label: 'Anular factura',
			icon: XIcon,
			action: () => onAnularFactura?.(venta)
		},
		{
			id: 'anular',
			label: 'Anular Venta',
			icon: XMarkIcon,
			action: () => onAnular?.(venta.id)
			//variant: 'danger'
		}
	];

	let dropdownOptions = $derived(
		todasLasOpciones.filter((opt) => {
			if (opt.id === 'anular') return !anulada && !facturada;
			if (opt.id === 'facturar') return facturable && !!onFacturar;
			if (opt.id === 'reemitir') return reemitible && !!onFacturar;
			if (opt.id === 'anular-factura') return !anulada && facturada && !!onAnularFactura;
			return true;
		})
	);

	function formatCurrency(amount: string | number) {
		return new Intl.NumberFormat('es-BO', {
			style: 'currency',
			currency: 'BOB'
		}).format(Number(amount));
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString('es-BO', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<tr
	class="transition-colors hover:bg-red-100/50 {anulada
		? 'bg-gray-100 opacity-60'
		: 'bg-[#D19999]/10'}"
>
	<td class="border-r border-gray-200/50 px-6 py-4">
		<div class="flex items-center gap-2">
			<p class="font-bold text-gray-700">{venta.numero_comprobante}</p>
			{#if anulada}
				<span
					class="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700"
					>Anulada</span
				>
			{/if}
		</div>
		{#if venta.factura}
			{@const badge = FACTURA_BADGE[venta.factura.estado]}
			<span
				class="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold {badge?.clase ??
					'bg-gray-100 text-gray-700'}"
			>
				{badge?.texto ?? venta.factura.estado}
				{#if venta.factura.estado === 'FACTURADA' || venta.factura.estado === 'ANULADA'}&nbsp;N° {venta.factura.numero_factura}{/if}
			</span>
		{/if}
		{#if venta.sucursal}
			<p class="mt-1 font-mono text-[10px] text-gray-500">
				Sucursal: {venta.sucursal.nombre}
			</p>
		{/if}
		<p class="mt-1 font-mono text-[10px] text-gray-500">
			Caja: {venta.id_sesion_caja?.substring(0, 8)}
		</p>
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4 font-medium text-gray-600">
		{formatDate(venta.fecha)}
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4">
		{#if venta.cliente && venta.cliente.ci !== CI_CLIENTE_GENERICO}
			<p class="font-bold text-gray-700">{venta.cliente.nombre_completo}</p>
			<p class="mt-0.5 text-xs text-gray-600">CI/NIT: {venta.cliente.ci}</p>
		{:else}
			<span class="text-xs font-bold text-gray-600 italic">Público General</span>
		{/if}
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4">
		{#if venta.cajero}
			<p class="font-medium text-gray-600">{venta.cajero.nombre_completo}</p>
		{:else}
			<span class="text-xs text-gray-600 italic">Desconocido</span>
		{/if}
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4 text-center">
		<div class="flex flex-col items-center gap-1">
			{#if venta.pagos && venta.pagos.length > 0}
				{#each venta.pagos as pago, i (i)}
					<span
						class="inline-flex items-center justify-center rounded-full border border-[#B91C1C]/20 px-3 py-1 text-[10px] font-bold uppercase
						{pago.metodo_pago === 'EFECTIVO'
							? 'bg-[#D19999]/20 text-[#8B1515]'
							: 'border-blue-200 bg-blue-100/50 text-blue-700'}"
						title={formatCurrency(pago.monto)}
					>
						{pago.metodo_pago}
					</span>
				{/each}
			{:else}
				<span class="text-[10px] font-bold uppercase text-gray-400">Sin pagos</span>
			{/if}
		</div>
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4 text-right">
		<p
			class="text-base font-extrabold {anulada
				? 'text-light-error line-through'
				: 'text-light-success'}"
		>
			{formatCurrency(venta.total)}
		</p>
		{#if venta.monto_descuento_global > 0}
			<p class="mt-0.5 text-[10px] font-bold text-gray-600">
				- {formatCurrency(venta.monto_descuento_global)} Desc.
			</p>
		{/if}
		{#if venta.monto_recargo_iva > 0}
			<p class="mt-0.5 text-[10px] font-bold text-gray-600">
				+ {formatCurrency(venta.monto_recargo_iva)} Recargo ({venta.porcentaje_recargo_iva}%)
			</p>
		{/if}
		{#if tieneMovimientos}
			<p class="mt-0.5 text-[10px] font-bold text-orange-700">
				Neto: {formatCurrency(venta.total_neto)}
			</p>
		{/if}
	</td>
	<td class="px-6 py-4 text-center">
		<div class="relative flex items-center justify-center">
			<div bind:this={triggerElement} class="inline-block">
				<Button
					variant="ghost"
					class="size-8 p-0! text-light-two hover:bg-light-one_d hover:text-light-black"
					onclick={() => (isDropdownOpen = !isDropdownOpen)}
					loading={isLoadingDetalles || isLoadingPrint || isAnulando}
				>
					{#snippet leftIcon()}
						<DotsVerticalIcon class="size-5" />
					{/snippet}
				</Button>
			</div>

			<DropdownMenu
				bind:isOpen={isDropdownOpen}
				{triggerElement}
				options={dropdownOptions}
				width={180}
			/>
		</div>
	</td>
</tr>
