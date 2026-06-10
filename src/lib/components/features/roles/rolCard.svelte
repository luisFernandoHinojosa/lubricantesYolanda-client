<script lang="ts">
	import { DotsVerticalIcon, EyeIcon, PencilIcon } from '$lib/icons/outline';
	import type { Rol, DropdownOption } from '$lib/interfaces';
	import { DropdownMenu } from '$lib/components/ui';

	interface Props {
		rol: Rol;
		onEdit: (rol: Rol) => void;
		onView: (rol: Rol) => void;
		formatDate: (date: string) => string;
	}

	let { rol, onEdit, onView, formatDate }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(150);
	let trigger = $state<HTMLElement>();

	const options: DropdownOption[] = [
		{
			id: 'view',
			label: 'Ver',
			icon: EyeIcon,
			action: () => onView(rol),
			disabled: false
		},
		{
			id: 'edit',
			label: 'Editar',
			icon: PencilIcon,
			action: () => onEdit(rol),
			disabled: false
		}
	];
</script>

<tr class="transition-colors hover:bg-gray-50">
	<td class="px-6 py-4 whitespace-nowrap">
		<span
			class="inline-flex rounded-full bg-light-four px-2 text-xs leading-5 font-semibold text-light-two"
		>
			{rol.code_rol}
		</span>
	</td>
	<td class="px-6 py-4 whitespace-nowrap">
		<div class="text-sm font-medium text-gray-900">{rol.nombre_rol}</div>
	</td>
	<td class="px-6 py-4">
		<div class="text-sm text-gray-600">{rol.descripcion}</div>
	</td>
	<td class="px-6 py-4 whitespace-nowrap">
		<div class="text-sm text-gray-500">{formatDate(rol.createdAt)}</div>
	</td>
	<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
		<div class="relative flex items-start justify-end">
			<button
				bind:this={trigger}
				onclick={() => (isDropdownOpen = !isDropdownOpen)}
				class="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
				aria-label="Acciones"
			>
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
