<script lang="ts">
	import type { VentaListItem } from '$lib/interfaces/venta.interface';
	import { EyeIcon, PrinterIcon, DotsVerticalIcon, XMarkIcon } from '$lib/icons/outline';
	import { Button, DropdownMenu } from '$lib/components/ui';
	import type { DropdownOption } from '$lib/interfaces';

	interface Props {
		venta: VentaListItem;
		onView?: (id: string) => void;
		onPrint?: (id: string) => void;
		onAnular?: (id: string) => void;
		isLoadingDetalles?: boolean;
		isLoadingPrint?: boolean;
		isAnulando?: boolean;
	}

	let {
		venta,
		onView,
		onPrint,
		onAnular,
		isLoadingDetalles = false,
		isLoadingPrint = false,
		isAnulando = false
	}: Props = $props();

	let isDropdownOpen = $state(false);
	let triggerElement = $state<HTMLElement>();

	const dropdownOptions: DropdownOption[] = [
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
			id: 'anular',
			label: 'Anular Venta',
			icon: XMarkIcon,
			action: () => onAnular?.(venta.id)
			//variant: 'danger'
		}
	];

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
	class="transition-colors hover:bg-red-100/50 {!venta.esta_activo
		? 'bg-gray-100 opacity-60'
		: 'bg-[#D19999]/10'}"
>
	<td class="border-r border-gray-200/50 px-6 py-4">
		<div class="flex items-center gap-2">
			<p class="font-bold text-gray-700">{venta.numero_comprobante}</p>
			{#if !venta.esta_activo}
				<span
					class="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700"
					>Anulada</span
				>
			{/if}
		</div>
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
		{formatDate(venta.createdAt)}
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4">
		{#if venta.cliente && venta.cliente.ci !== '000000'}
			<p class="font-bold text-gray-700">
				{venta.cliente.nombre}
				{venta.cliente.apellido_paterno}
			</p>
			<p class="mt-0.5 text-xs text-gray-600">CI/NIT: {venta.cliente.ci}</p>
		{:else}
			<span class="text-xs font-bold text-gray-600 italic">Público General</span>
		{/if}
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4">
		{#if venta.cajero}
			<p class="font-medium text-gray-600">
				{venta.cajero.nombre}
				{venta.cajero.apellido_paterno}
			</p>
		{:else}
			<span class="text-xs text-gray-600 italic">Desconocido</span>
		{/if}
	</td>
	<td class="border-r border-gray-200/50 px-6 py-4 text-center">
		<div class="flex flex-col items-center gap-1">
			{#if venta.pagos && venta.pagos.length > 0}
				{#each venta.pagos as pago}
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
			class="text-base font-extrabold {venta.esta_activo
				? 'text-light-success'
				: 'text-light-error line-through'}"
		>
			{formatCurrency(venta.total)}
		</p>
		{#if parseFloat(venta.monto_descuento_global) > 0}
			<p class="mt-0.5 text-[10px] font-bold text-gray-600">
				- {formatCurrency(venta.monto_descuento_global)} Desc.
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
				options={dropdownOptions.filter((opt) => {
					if (opt.id === 'anular' && !venta.esta_activo) return false;
					return true;
				})}
				width={180}
			/>
		</div>
	</td>
</tr>
