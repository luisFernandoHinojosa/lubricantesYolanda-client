<script lang="ts">
	import { DotsVerticalIcon, EyeIcon, PencilIcon, TrashIcon } from '$lib/icons/outline';
	import type { DropdownOption, EmpleadoData as Empleado } from '$lib/interfaces';
	import { DropdownMenu } from '$lib/components/ui';
	import { formatDate } from '$lib/utils';
	interface Props {
		empleado: Empleado;
		onEdit: (empleado: Empleado) => void;
		onDelete: (id: string) => void;
		onView: (empleado: Empleado) => void;
	}

	let { empleado, onEdit, onDelete, onView }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(150);
	let trigger = $state<HTMLElement>();

	function getNombreCompleto(): string {
		return `${empleado.nombre} ${empleado.apellido_paterno} ${empleado.apellido_materno}`.trim();
	}

	const options: DropdownOption[] = [
		{
			id: 'view',
			label: 'Ver',
			icon: EyeIcon,
			action: () => onView(empleado),
			disabled: false
		},
		{
			id: 'edit',
			label: 'Edit',
			icon: PencilIcon,
			action: () => onEdit(empleado)
		},
		{
			id: 'delete',
			label: 'Delete',
			icon: TrashIcon,
			action: () => onDelete(empleado.id),
			divider: true,
			disabled: false
		}
	];
</script>

<tr class="hover:bg-light-one_d">
	<td class="px-6 py-4 text-sm font-medium whitespace-nowrap text-light-black">
		{empleado.ci}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{getNombreCompleto()}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{empleado.cargo || '-'}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{#if empleado.Usuario}
			<div class="flex flex-col">
				<span class="font-medium text-light-black">{empleado.Usuario.name_user}</span>
				<span class="text-xs text-light-two">{empleado.Usuario.email}</span>
			</div>
		{:else}
			<span class="text-light-two italic">Sin usuario</span>
		{/if}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{empleado.Usuario?.Role?.nombre_rol || '-'}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{formatDate(empleado.fecha_nacimiento)}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{formatDate(empleado.fecha_contratacion)}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{empleado.fecha_despido ? formatDate(empleado.fecha_despido) : '-'}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{empleado.salario_base ? `Bs. ${empleado.salario_base}` : '-'}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{empleado.telefono || '-'}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{empleado.direccion || '-'}
	</td>
	<td class="px-6 py-4 text-center text-sm whitespace-nowrap">
		<span
			class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 {empleado.esta_activo
				? 'bg-green-100 text-green-800'
				: 'bg-red-100 text-red-800'}"
		>
			{empleado.esta_activo ? 'Activo' : 'Inactivo'}
		</span>
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		<div class="flex flex-col text-xs text-light-two">
			<span>C: {formatDate(empleado.createdAt)}</span>
			<span>A: {formatDate(empleado.updatedAt)}</span>
		</div>
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
				class="absolute top-full right-0 z-10"
			/>
		</div>
	</td>
</tr>
