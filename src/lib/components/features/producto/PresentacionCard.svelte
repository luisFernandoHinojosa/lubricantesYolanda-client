<script lang="ts">
	import type { Presentacion } from '$lib/interfaces';
	import { Text } from '$lib/components/ui';
	import { TagIcon, PencilIcon, TrashIcon } from '$lib/icons/outline';

	interface Props {
		pres: Presentacion;
		onEdit?: (pres: Presentacion) => void;
		onDelete?: (id: string) => void;
	}

	let { pres, onEdit, onDelete }: Props = $props();
</script>

<div
	class="group relative flex flex-col gap-4 rounded-xl border border-acero-200 bg-white p-5 transition-all hover:border-acero-400 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
>
	<!-- Botones de Acción -->
	<div
		class="absolute -top-2 -right-2 z-10 flex items-center gap-[2px] opacity-0 transition-opacity group-hover:opacity-100"
	>
		{#if onEdit}
			<button
				class="flex items-center justify-center rounded-full border border-acero-200 bg-white p-1.5 text-acero-700 shadow-sm transition-all hover:border-acero-700 hover:bg-acero-700 hover:text-white"
				onclick={() => onEdit(pres)}
				title="Editar presentación"
			>
				<PencilIcon class="h-3.5 w-3.5" />
			</button>
		{/if}
		{#if onDelete}
			<button
				class="flex items-center justify-center rounded-full border border-acero-200 bg-white p-1.5 text-red-500 shadow-sm transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
				onclick={() => onDelete(pres.id)}
				title="Eliminar presentación"
			>
				<TrashIcon class="h-3.5 w-3.5" />
			</button>
		{/if}
	</div>

	<!-- Header: Nombre -->
	<div class="mb-1 flex items-center justify-between border-b border-acero-200 pb-2">
		<Text variant="body-sm" color="primary" weight="bold" class="tracking-tight">
			{pres.nombre}
		</Text>
		<span
			class="rounded-full px-2 py-0.5 text-xs font-semibold {pres.esta_activo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}"
		>
			{pres.esta_activo ? 'Activo' : 'Inactivo'}
		</span>
	</div>

	<!-- Identificadores -->
	<div class="flex flex-wrap gap-x-4 gap-y-2">
		<div class="flex items-center gap-1.5">
			<TagIcon class="size-3.5 text-acero-500" />
			<span class="text-xs font-semibold text-acero-500">SKU:</span>
			<span class="text-[0.7rem] font-bold text-acero-950">{pres.sku || '—'}</span>
		</div>
		<div class="flex items-center gap-1.5">
			<TagIcon class="size-3.5 text-acero-500" />
			<span class="text-xs font-semibold text-acero-500">Código:</span>
			<span class="tabular-nums text-[0.7rem] font-bold text-acero-950"
				>{pres.codigo_barras || '—'}</span
			>
		</div>
	</div>

	<!-- Grilla de Datos -->
	<div class="mt-2 grid grid-cols-2 gap-3.5">
		<div class="flex flex-col gap-1.5">
			<span class="text-[0.55rem] font-semibold text-acero-500"
				>Unidad de Medida</span
			>
			<div
				class="rounded-lg border border-acero-200 bg-acero-50 px-2.5 py-1.5 text-[0.75rem] font-bold text-acero-950"
			>
				{pres.unidad_medida?.nombre || '—'}
			</div>
		</div>
		<div class="flex flex-col gap-1.5">
			<span class="text-[0.55rem] font-semibold text-acero-500"
				>Contenido</span
			>
			<div
				class="rounded-lg border border-acero-200 bg-acero-50 px-2.5 py-1.5 text-[0.75rem] font-bold text-acero-950"
			>
				{pres.factor_conversion} uds.
			</div>
		</div>
		<div class="flex flex-col gap-1.5">
			<span class="text-[0.55rem] font-semibold text-acero-500"
				>Precio</span
			>
			<div
				class="rounded-lg border border-acero-200 bg-acero-50 px-2.5 py-1.5 text-[0.8rem] font-semibold text-acero-950"
			>
				Bs. {pres.precio_especial}
			</div>
		</div>
	</div>
</div>
