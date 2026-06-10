<script lang="ts">
	import { DotsVerticalIcon, EyeIcon, PencilIcon, TrashIcon } from '$lib/icons/outline';
	import type { Marca, DropdownOption } from '$lib/interfaces';
	import { DropdownMenu } from '$lib/components/ui';
	interface Props {
		marca: Marca;
		onEdit: (marca: Marca) => void;
		onDelete: (id: string) => void;
		onView: (marca: Marca) => void;
	}

	let { marca, onEdit, onDelete, onView }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(150);
	let trigger = $state<HTMLElement>();

	const options: DropdownOption[] = [
		{
			id: 'view',
			label: 'Ver',
			icon: EyeIcon,
			action: () => onView(marca),
			disabled: false
		},
		{
			id: 'edit',
			label: 'Edit',
			icon: PencilIcon,
			action: () => onEdit(marca),

			disabled: false
		},
		{
			id: 'delete',
			label: 'Delete',
			icon: TrashIcon,
			action: () => onDelete(marca.id),
			divider: true,
			disabled: false
		}
	];
</script>

<tr class="text-light-black hover:bg-light-one_d">
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{marca.nombre}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{marca.descripcion}
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
