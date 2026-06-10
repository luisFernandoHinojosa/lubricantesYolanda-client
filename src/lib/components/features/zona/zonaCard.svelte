<script lang="ts">
	import { DotsVerticalIcon, EyeIcon, PencilIcon, TrashIcon } from '$lib/icons/outline';
	import type { Zona, DropdownOption } from '$lib/interfaces';
	import { DropdownMenu } from '$lib/components/ui';
	interface Props {
		zona: Zona;
		onEdit: (zona: Zona) => void;
		onDelete: (id: string) => void;
		onView: (zona: Zona) => void;
	}

	let { zona, onEdit, onDelete, onView }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(150);
	let trigger = $state<HTMLElement>();

	const options: DropdownOption[] = [
		{
			id: 'view',
			label: 'Ver',
			icon: EyeIcon,
			action: () => onView(zona),
			disabled: false
		},
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
	<td class="px-6 py-4 text-sm font-medium whitespace-nowrap text-light-two_d">
		{zona.id}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap text-light-two_d">
		{zona.nombre}
	</td>
	<td class="px-6 py-4 text-sm whitespace-nowrap text-light-two">
		{zona.provincia}
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
