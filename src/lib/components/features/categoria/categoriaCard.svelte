<script lang="ts">
	import { DotsVerticalIcon, PencilIcon, TrashIcon } from '$lib/icons/outline';
	import type { Categoria, DropdownOption } from '$lib/interfaces';
	import { DropdownMenu } from '$lib/components/ui';
	interface Props {
		categoria: Categoria;
		onEdit: (categoria: Categoria) => void;
		onDelete: (id: string) => void;
	}

	let { categoria, onEdit, onDelete }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(150);
	let trigger = $state<HTMLElement>();

	const options: DropdownOption[] = [
		{
			id: 'edit',
			label: 'Edit',
			icon: PencilIcon,
			action: () => onEdit(categoria),

			disabled: false
		},
		{
			id: 'delete',
			label: 'Delete',
			icon: TrashIcon,
			action: () => onDelete(categoria.id),
			divider: true,
			disabled: false
		}
	];
</script>

<tr class="text-light-black hover:bg-light-one_d">
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{categoria.nombre}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap">
		{categoria.descripcion}
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
