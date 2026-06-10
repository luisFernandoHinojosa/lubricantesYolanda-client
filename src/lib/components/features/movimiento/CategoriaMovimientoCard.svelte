<script lang="ts">
	import { DotsVerticalIcon, PencilIcon, TrashIcon } from '$lib/icons/outline';
	import type { CategoriaMovimiento, DropdownOption } from '$lib/interfaces';
	import { DropdownMenu } from '$lib/components/ui';

	interface Props {
		categoria: CategoriaMovimiento;
		onEdit: (categoria: CategoriaMovimiento) => void;
		onDelete: (id: string) => void;
	}

	let { categoria, onEdit, onDelete }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(150);
	let trigger = $state<HTMLElement>();

	const options: DropdownOption[] = [
		{
			id: 'edit',
			label: 'Editar',
			icon: PencilIcon,
			action: () => onEdit(categoria),
			disabled: false
		},
		{
			id: 'delete',
			label: 'Eliminar',
			icon: TrashIcon,
			action: () => onDelete(categoria.id),
			divider: true,
			disabled: false
		}
	];
</script>

<tr class="border-b border-light-four text-light-black hover:bg-light-one_d">
	<td class="px-6 py-4 text-sm font-medium">
		{categoria.nombre}
	</td>
	<td class="px-6 py-4 text-sm">
		<span
			class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold {categoria.tipo ===
			'INGRESO'
				? 'bg-green-100 text-green-700'
				: 'bg-red-100 text-red-700'}"
		>
			{categoria.tipo}
		</span>
	</td>
	<td class="px-6 py-4 text-sm">
		{categoria.descripcion}
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
