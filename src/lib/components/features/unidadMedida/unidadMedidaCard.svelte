<script lang="ts">
	import { DotsVerticalIcon, EyeIcon, PencilIcon, TrashIcon } from '$lib/icons/outline';
	import type { UnidadMedida, DropdownOption } from '$lib/interfaces';
	import { DropdownMenu } from '$lib/components/ui';
	interface Props {
		unidadMedida: UnidadMedida;
		onEdit: (unidadMedida: UnidadMedida) => void;
		onDelete: (id: string) => void;
		onView: (unidadMedida: UnidadMedida) => void;
	}

	let { unidadMedida, onEdit, onDelete, onView }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(150);
	let trigger = $state<HTMLElement>();

	const options: DropdownOption[] = [
		{
			id: 'view',
			label: 'Ver',
			icon: EyeIcon,
			action: () => onView(unidadMedida),
			disabled: false
		},
		{
			id: 'edit',
			label: 'Editar',
			icon: PencilIcon,
			action: () => onEdit(unidadMedida),

			disabled: false
		},
		{
			id: 'delete',
			label: 'Eliminar',
			icon: TrashIcon,
			action: () => onDelete(unidadMedida.id),
			divider: true,
			disabled: false
		}
	];
</script>

<tr class="text-light-black hover:bg-light-one_d">
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{unidadMedida.nombre}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{unidadMedida.abreviatura}
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
