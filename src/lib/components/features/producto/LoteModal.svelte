<script lang="ts">
	import { Modal } from '$lib/components/ui';
	import type { Lote, CreateLoteDto, UpdateLoteDto } from '$lib/interfaces';
	import LoteForm from './LoteForm.svelte';

	interface Props {
		isOpen: boolean;
		lote?: Lote | null;
		id_producto: string;
		loading?: boolean;
		onClose: () => void;
		onSave: (data: CreateLoteDto | UpdateLoteDto) => Promise<void>;
	}

	let { isOpen, lote, id_producto, loading = false, onClose, onSave }: Props = $props();

	let isEdit = $derived(!!lote);
	let title = $derived(isEdit ? 'Editar Lote' : 'Registrar Nuevo Lote');
</script>

<Modal {isOpen} {onClose} {title} maxWidth="sm:max-w-xl">
	<LoteForm
		{lote}
		{id_producto}
		{isEdit}
		{loading}
		{onSave}
		onCancel={onClose}
	/>
</Modal>
