<script lang="ts">
	import {
		DotsVerticalIcon,
		EyeIcon,
		PencilIcon,
		RefreshIcon,
		SparklesIcon,
		TrashIcon
	} from '$lib/icons/outline';
	import type { Cliente, DropdownOption } from '$lib/interfaces';
	import { formatDate } from '$lib/utils';
	import { Badge, DropdownMenu, TableCell, TableRow } from '$lib/components/ui';
	import { TIPO_DOCUMENTO_IDENTIDAD_FACTURA } from '$lib/constants/dataFacturacion';

	interface Props {
		cliente: Cliente;
		onEdit: (cliente: Cliente) => void;
		/** Desactiva al cliente (soft delete) */
		onDelete: (id: string) => void;
		onView: (cliente: Cliente) => void;
		onAjustarPuntos: (cliente: Cliente) => void;
		onReactivar: (cliente: Cliente) => void;
	}

	let { cliente, onEdit, onDelete, onView, onAjustarPuntos, onReactivar }: Props = $props();

	let isDropdownOpen = $state(false);
	let width: number = $state(180);
	let trigger = $state<HTMLElement>();

	// El backend guarda los apellidos completos en apellido_paterno (apellido_materno está deprecado)
	const nombreCompleto = $derived(
		[cliente.nombre, cliente.apellido_paterno].filter(Boolean).join(' ')
	);

	const tipoDocumento = $derived(
		TIPO_DOCUMENTO_IDENTIDAD_FACTURA.find((t) => t.codigoClasificador === cliente.tipo_documento)
			?.descripcion.split(/\s+[-–]+\s*/)[0] ?? 'CI'
	);

	const documento = $derived(
		cliente.complemento ? `${cliente.ci}-${cliente.complemento}` : cliente.ci
	);

	const options = $derived<DropdownOption[]>([
		{ id: 'view', label: 'Ver', icon: EyeIcon, action: () => onView(cliente) },
		{ id: 'edit', label: 'Editar', icon: PencilIcon, action: () => onEdit(cliente) },
		{
			id: 'puntos',
			label: 'Ajustar puntos',
			icon: SparklesIcon,
			action: () => onAjustarPuntos(cliente),
			disabled: !cliente.esta_activo
		},
		cliente.esta_activo
			? {
					id: 'delete',
					label: 'Desactivar',
					icon: TrashIcon,
					action: () => onDelete(cliente.id),
					divider: true
				}
			: {
					id: 'reactivar',
					label: 'Reactivar',
					icon: RefreshIcon,
					action: () => onReactivar(cliente),
					divider: true
				}
	]);
</script>

<TableRow class="border-light-four hover:bg-light-one_d {cliente.esta_activo ? '' : 'opacity-60'}">
	<TableCell class="px-6 py-4 text-sm font-medium whitespace-nowrap text-light-black">
		<span class="mr-1 text-xs text-light-two">{tipoDocumento}</span>{documento}
	</TableCell>
	<TableCell class="px-6 py-4 text-sm whitespace-nowrap">{nombreCompleto}</TableCell>
	<TableCell class="px-6 py-4 text-sm whitespace-nowrap">{cliente.correo_electronico}</TableCell>
	<TableCell class="px-6 py-4 text-sm whitespace-nowrap">{cliente.telefono}</TableCell>
	<TableCell class="px-6 py-4 text-sm whitespace-nowrap">
		{formatDate(cliente.fecha_nacimiento ?? undefined)}
	</TableCell>
	<TableCell class="px-6 py-4 text-sm whitespace-nowrap">{cliente.puntos}</TableCell>
	<TableCell class="px-6 py-4 text-sm whitespace-nowrap">
		<Badge variant={cliente.tipo_cliente === 'MAY' ? 'info' : 'secondary'}>
			{cliente.tipo_cliente === 'MAY' ? 'Mayorista' : 'Minorista'}
		</Badge>
	</TableCell>
	<TableCell class="px-6 py-4 text-sm whitespace-nowrap">
		<Badge variant={cliente.esta_activo ? 'success' : 'destructive'}>
			{cliente.esta_activo ? 'Activo' : 'Inactivo'}
		</Badge>
	</TableCell>
	<TableCell class="max-w-[16rem] truncate px-6 py-4 text-sm" title={cliente.direccion ?? ''}>
		{cliente.direccion ?? '—'}
	</TableCell>
	<TableCell class="px-6 py-4 text-right text-sm whitespace-nowrap">
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
	</TableCell>
</TableRow>
