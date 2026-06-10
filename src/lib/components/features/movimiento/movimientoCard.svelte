<script lang="ts">
	import { DotsVerticalIcon, EyeIcon, PencilIcon, TrashIcon } from '$lib/icons/outline';
	import type { Movimiento, DropdownOption } from '$lib/interfaces';
	import { DropdownMenu } from '$lib/components/ui';
	import { formatDate } from '$lib/utils';

	interface Props {
		movimiento: Movimiento;
		onEdit: (movimiento: Movimiento) => void;
		onDelete: (id: string) => void;
		onView: (movimiento: Movimiento) => void;
	}

	let { movimiento, onEdit, onDelete, onView }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(150);
	let trigger = $state<HTMLElement>();

	const options: DropdownOption[] = [
		{
			id: 'view',
			label: 'Ver',
			icon: EyeIcon,
			action: () => onView(movimiento),
			disabled: false
		},
		{
			id: 'edit',
			label: 'Editar',
			icon: PencilIcon,
			action: () => onEdit(movimiento),
			disabled: false
		},
		{
			id: 'delete',
			label: 'Eliminar',
			icon: TrashIcon,
			action: () => onDelete(movimiento.id),
			divider: true,
			disabled: false
		}
	];
</script>

<tr class="border-b border-light-four text-light-black hover:bg-light-one_d">
	<td class="px-6 py-4 text-sm font-medium">
		<div class="line-clamp-2">{movimiento.nombre}</div>
	</td>
	<td class="px-6 py-4 text-sm font-medium">
		<div class="line-clamp-2">{movimiento.descripcion}</div>
	</td>
	<td class="px-6 py-4 text-sm font-bold whitespace-nowrap">
		<span class={movimiento.tipo === 'INGRESO' ? 'text-light-success' : 'text-light-error'}>
			<span class="text-xs font-semibold text-light-five">{movimiento.divisa}</span>
			{movimiento.monto}
		</span>
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{formatDate(movimiento.fecha)}
	</td>
	<td class="px-6 py-4 text-sm">
		<div class="line-clamp-2">{movimiento.categoria_movimiento?.nombre || '--'}</div>
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{movimiento.tipoPago}
	</td>
	<td class="px-6 py-4 text-sm">
		<div class="flex flex-col">
			<span class="text-xs font-semibold text-light-two uppercase">Sucursal</span>
			<span>{movimiento.sucursal?.nombre || '-'}</span>
		</div>
	</td>
	<td class="px-6 py-4 text-sm">
		<div class="flex flex-col">
			<span class="text-xs font-semibold text-light-two uppercase">Empleado</span>
			<span>{movimiento.empleado?.nombre} {movimiento.empleado?.apellido_paterno || ''}</span>
		</div>
	</td>
	<td class="px-6 py-4 text-right text-sm whitespace-nowrap">
		<div class="relative flex items-start justify-end">
			<button
				bind:this={trigger}
				onclick={() => (isDropdownOpen = !isDropdownOpen)}
				class="hover:text-primary text-light-two transition-colors"
			>
				<DotsVerticalIcon class="size-5" />
			</button>
			<DropdownMenu
				{options}
				{width}
				bind:isOpen={isDropdownOpen}
				triggerElement={trigger}
				class="absolute top-full right-0"
			/>
		</div>
	</td>
</tr>
