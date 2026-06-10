<script lang="ts">
	import { DotsVerticalIcon, EyeIcon, PencilIcon } from '$lib/icons/outline';
	import type { Usuario, DropdownOption } from '$lib/interfaces';
	import { DropdownMenu } from '$lib/components/ui';

	interface Props {
		usuario: Usuario;
		getRolCode: (usuario: Usuario) => string;
		getRolNombre: (usuario: Usuario) => string;
		formatDate: (date: string) => string;
		onToggleEstado: (id: string, currentEstado: boolean) => void;
	}

	let { usuario, getRolCode, getRolNombre, formatDate, onToggleEstado }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(150);
	let trigger = $state<HTMLElement>();

	const options: DropdownOption[] = [
		{
			id: 'view',
			label: 'Ver',
			icon: EyeIcon,
			action: () => {},
			disabled: true
		},
		{
			id: 'edit',
			label: 'Editar',
			icon: PencilIcon,
			action: () => {},
			disabled: true
		}
	];
</script>

<tr class="transition-colors hover:bg-gray-50">
	<td class="px-6 py-4 whitespace-nowrap">
		<div class="flex items-center">
			<div class="h-10 w-10 shrink-0">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-light-four">
					<span class="text-sm font-medium text-light-two">
						{usuario.name_user.substring(0, 2).toUpperCase()}
					</span>
				</div>
			</div>
			<div class="ml-4">
				<div class="text-sm font-medium text-gray-900">{usuario.name_user}</div>
			</div>
		</div>
	</td>
	<td class="px-6 py-4 whitespace-nowrap">
		<div class="text-sm text-gray-900">{usuario.email}</div>
	</td>
	<td class="px-6 py-4 whitespace-nowrap">
		<span
			class="inline-flex rounded-full bg-light-accent px-2 text-xs leading-5 font-semibold text-light-two"
		>
			{getRolCode(usuario)}
		</span>
		<div class="mt-1 text-xs text-gray-500">{getRolNombre(usuario)}</div>
	</td>
	<td class="px-6 py-4 whitespace-nowrap">
		<button
			onclick={() => onToggleEstado(usuario.id, usuario.esta_activo)}
			class="relative inline-flex items-center"
		>
			<span
				class="inline-flex rounded-full px-2 text-xs leading-5 font-semibold {usuario.esta_activo
					? 'bg-green-100 text-green-800'
					: 'bg-red-100 text-red-800'}"
			>
				{usuario.esta_activo ? 'Activo' : 'Inactivo'}
			</span>
		</button>
	</td>
	<td class="px-6 py-4 whitespace-nowrap">
		<div class="text-sm text-gray-500">{formatDate(usuario.createdAt)}</div>
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
