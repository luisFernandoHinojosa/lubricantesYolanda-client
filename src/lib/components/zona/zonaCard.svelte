<script lang="ts">
	import { DotsVerticalIcon, PencilIcon, TrashIcon } from '$lib/icons/outline';
	import type { Zona, DropdownOption } from '$lib/interfaces';
	import { DropdownMenu } from '../ui';
	interface Props {
		zona: Zona;
		onEdit: (zona: Zona) => void;
		onDelete: (id: string) => void;
	}

	let { zona, onEdit, onDelete }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(44);

	const options: DropdownOption[] = [
		{
			id: 'edit',
			label: 'Edit',
			icon: PencilIcon,
			action: () => onEdit(zona),

			disabled: false
		},
		{
			id: 'delete',
			label: 'Delete',
			icon: TrashIcon,
			action: () => onDelete(zona.id),
			divider: true,
			disabled: false
		}
	];
</script>

<tr class="hover:bg-light-one_d">
	<td class="px-6 py-4 text-sm font-medium whitespace-nowrap text-light-black">
		{zona.id}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{zona.nombre}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{zona.provincia}
	</td>
	<td class="px-6 py-4 text-right text-sm whitespace-nowrap">
		<div class="relative flex items-start justify-end">
			<button onclick={() => (isDropdownOpen = !isDropdownOpen)}>
				<DotsVerticalIcon />
			</button>
			<DropdownMenu {options} {width} isOpen={isDropdownOpen} class="absolute top-full right-0" />
		</div>
	</td>
</tr>
