<script lang="ts">
	import { DotsVerticalIcon, EyeIcon, PencilIcon, TrashIcon } from '$lib/icons/outline';
	import type { Proveedor, DropdownOption } from '$lib/interfaces';
	import { DropdownMenu } from '$lib/components/ui';
	interface Props {
		proveedor: Proveedor;
		onEdit: (proveedor: Proveedor) => void;
		onDelete: (id: string) => void;
		onView: (proveedor: Proveedor) => void;
	}

	let { proveedor, onEdit, onDelete, onView }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(150);
	let trigger = $state<HTMLElement>();

	function getNombreCompleto(): string {
		return `${proveedor.nombre} ${proveedor.apellido_paterno} ${proveedor.apellido_materno}`.trim();
	}

	const options: DropdownOption[] = [
		{
			id: 'view',
			label: 'Ver',
			icon: EyeIcon,
			action: () => onView(proveedor),
			disabled: false
		},
		{
			id: 'edit',
			label: 'Edit',
			icon: PencilIcon,
			action: () => onEdit(proveedor),

			disabled: false
		},
		{
			id: 'delete',
			label: 'Delete',
			icon: TrashIcon,
			action: () => onDelete(proveedor.id),
			divider: true,
			disabled: false
		}
	];
</script>

<tr class="text-light-black hover:bg-light-one_d">
	<!-- <td class="px-6 py-4 text-sm font-medium whitespace-nowrap text-light-two_d">
		{cliente.ci}
	</td> -->
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{getNombreCompleto()}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{proveedor.empresa}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{proveedor.telefono}
	</td>
	<!-- <td class="px-6 py-4 text-sm whitespace-nowrap text-light-two">
		{formatDate(cliente.fecha_nacimiento)}
	</td> -->
	<!-- <td class="px-6 py-4 text-sm whitespace-nowrap text-light-two">
		{proveedor.direccion}
	</td> -->
	<!-- <td class="px-6 py-4 text-sm whitespace-nowrap">
		<span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold">
			{proveedor.Zona.nombre}
		</span>
	</td> -->
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		<span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold">
			{proveedor.direccion}
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
