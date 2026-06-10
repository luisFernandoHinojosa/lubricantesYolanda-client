<script lang="ts">
	import { DotsVerticalIcon, EyeIcon, PencilIcon, TrashIcon } from '$lib/icons/outline';
	import type { Cliente, DropdownOption } from '$lib/interfaces';
	import { formatDate } from '$lib/utils';
	import { DropdownMenu } from '$lib/components/ui';
	interface Props {
		cliente: Cliente;
		onEdit: (cliente: Cliente) => void;
		onDelete: (id: string) => void;
		onView: (cliente: Cliente) => void;
	}

	let { cliente, onEdit, onDelete, onView }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(150);
	let trigger = $state<HTMLElement>();

	function getNombreCompleto(): string {
		return `${cliente.nombre} ${cliente.apellido_paterno} ${cliente.apellido_materno}`.trim();
	}

	const options: DropdownOption[] = [
		{
			id: 'view',
			label: 'Ver',
			icon: EyeIcon,
			action: () => onView(cliente),
			disabled: false
		},
		{
			id: 'edit',
			label: 'Edit',
			icon: PencilIcon,
			action: () => onEdit(cliente),

			disabled: false
		},
		{
			id: 'delete',
			label: 'Delete',
			icon: TrashIcon,
			action: () => onDelete(cliente.id),
			divider: true,
			disabled: false
		}
	];
</script>

<tr class="hover:bg-light-one_d">
	<td class="px-6 py-4 text-sm font-medium whitespace-nowrap text-light-black">
		{cliente.ci}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{getNombreCompleto()}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{cliente.correo_electronico}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{cliente.telefono}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{formatDate(cliente.fecha_nacimiento)}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{cliente.puntos}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		<span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold">
			{cliente.tipo_cliente}
		</span>
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		<span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold">
			{cliente.direccion}
		</span>
	</td>
	<td class="px-6 py-4 text-right text-sm whitespace-nowrap">
		<div class="relative flex items-start justify-end">
			<button bind:this={trigger} onclick={() => (isDropdownOpen = !isDropdownOpen)}>
				<DotsVerticalIcon />
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
