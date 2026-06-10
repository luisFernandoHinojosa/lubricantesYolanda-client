<script lang="ts">
	import { productoService } from '$lib/services';
	import type { UnidadMedida } from '$lib/interfaces/unidadMedida.interface';
	import { Button, Text } from '$lib/components/ui';
	import { SparklesIcon, CopyIcon, LoaderIcon, CheckIcon } from '$lib/icons/outline';
	import type { CreatePresentacionDto, UpdatePresentacionDto } from '$lib/interfaces';

	interface Props {
		id_producto: string;
		unidades: UnidadMedida[];
		initialData?: {
			nombre: string;
			factor_conversion: number;
			precio_especial: number;
			sku: string | null;
			codigo_barras: string | null;
			id_unidad_medida: string | null;
			esta_activo?: boolean;
		};
		onSubmit: (data: CreatePresentacionDto | UpdatePresentacionDto) => Promise<void>;
		onCancel: () => void;
		isSaving?: boolean;
	}

	let {
		id_producto,
		unidades,
		initialData,
		onSubmit,
		onCancel,
		isSaving = false
	}: Props = $props();

	let form = $state({
		nombre: initialData?.nombre ?? '',
		factor_conversion: initialData?.factor_conversion ?? 1,
		precio_especial: initialData?.precio_especial ?? 0,
		sku: initialData?.sku ?? '',
		codigo_barras: initialData?.codigo_barras ?? '',
		id_unidad_medida: initialData?.id_unidad_medida ?? '',
		esta_activo: initialData?.esta_activo ?? true
	});

	let isGenerating = $state(false);
	let copied = $state(false);
	let error = $state('');

	async function generateBarcode() {
		if (isGenerating) return;
		isGenerating = true;
		try {
			const barcode = await productoService.generateBarcode();
			form.codigo_barras = barcode;
		} catch (err) {
			console.error('Error generating barcode:', err);
		} finally {
			isGenerating = false;
		}
	}

	function copyBarcode() {
		if (!form.codigo_barras) return;
		navigator.clipboard.writeText(form.codigo_barras);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	async function handleSubmit(): Promise<void> {
		if (!form.nombre || form.factor_conversion <= 0 || form.precio_especial < 0) {
			error = 'Completa correctamente todos los campos obligatorios.';
			return;
		}
		error = '';
		try {
			const data: CreatePresentacionDto = {
				id_producto,
				nombre: form.nombre,
				factor_conversion: form.factor_conversion,
				precio_especial: form.precio_especial,
				sku: form.sku || null,
				codigo_barras: form.codigo_barras || null,
				id_unidad_medida: form.id_unidad_medida || null
			};
			await onSubmit(data);
		} catch (err) {
			error = err as string;
			console.error(err);
		}
	}
</script>

<div class="flex flex-col gap-4">
	{#if error}
		<div
			class="flex items-center gap-[0.6rem] rounded-[10px] border border-red-500/25 bg-red-500/10 px-4 py-3 text-red-600"
		>
			<Text variant="body-sm" color="error">{error}</Text>
		</div>
	{/if}

	<div class="flex flex-col gap-1.5">
		<label
			class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
			for="pres_nombre">Nombre de Presentación *</label
		>
		<input
			id="pres_nombre"
			type="text"
			class="w-full rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] px-3 py-2 text-[0.85rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
			bind:value={form.nombre}
			placeholder="Ej: Docena, Caja x 12"
		/>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="flex flex-col gap-1.5">
			<label
				class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
				for="pres_sku">SKU (Opcional)</label
			>
			<input
				id="pres_sku"
				type="text"
				class="w-full rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] px-3 py-2 text-[0.85rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
				bind:value={form.sku}
				placeholder="Ej: BOX-001"
			/>
		</div>
		<div class="flex flex-col gap-1.5">
			<label
				class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
				for="pres_barcode">Código de Barras</label
			>
			<div class="flex flex-col gap-2">
				<input
					id="pres_barcode"
					type="text"
					class="w-full rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] px-3 py-2 font-mono text-[0.8rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
					bind:value={form.codigo_barras}
					placeholder="EAN-13, UPC, etc."
				/>
				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={generateBarcode}
						disabled={isGenerating}
						class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-light-four bg-linear-to-r from-light-one to-light-four px-2 py-1.5 text-xs font-bold text-light-three transition-all hover:ring-1 hover:ring-light-three disabled:opacity-50"
						title="Generar código"
					>
						{#if isGenerating}
							<LoaderIcon class="h-4 w-4 animate-spin" />
							GENERANDO...
						{:else}
							<SparklesIcon class="h-4 w-4 font-bold" />
							GENERAR
						{/if}
					</button>
					{#if form.codigo_barras}
						<button
							type="button"
							onclick={copyBarcode}
							class="flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-bold transition-all {copied
								? 'border-green-200 bg-green-50 text-green-600'
								: 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'}"
							title="Copiar código"
						>
							{#if copied}
								<CheckIcon class="h-3 w-3" />
								COPIADO!
							{:else}
								<CopyIcon class="h-3 w-3" />
								COPIAR
							{/if}
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-3.5">
		<div class="flex flex-col gap-1.5">
			<label
				class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
				for="pres_factor">Factor de Conversión *</label
			>
			<input
				id="pres_factor"
				type="number"
				min="1"
				step="1"
				class="w-full rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] px-3 py-2 text-[0.85rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
				bind:value={form.factor_conversion}
			/>
		</div>
		<div class="flex flex-col gap-1.5">
			<label
				class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
				for="pres_precio">Precio Especial *</label
			>
			<input
				id="pres_precio"
				type="number"
				min="0"
				step="0.01"
				class="w-full rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] px-3 py-2 text-[0.85rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
				bind:value={form.precio_especial}
			/>
		</div>
	</div>

	<div class="flex flex-col gap-1.5">
		<label
			class="text-[0.62rem] font-extrabold tracking-[0.08em] text-[#9a8060] uppercase"
			for="pres_unidad">Unidad de Medida</label
		>
		<select
			id="pres_unidad"
			class="w-full cursor-pointer appearance-none rounded-[9px] border-[1.5px] border-[#e0d8cf] bg-[#f8f5f0] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239a8060%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_0.6rem_center] bg-no-repeat px-3 py-2 pr-8 text-[0.85rem] font-medium text-[#1a1a2e] transition-all outline-none focus:border-[#8b7355] focus:ring-[3px] focus:ring-[#8b7355]/10"
			bind:value={form.id_unidad_medida}
		>
			<option value="">Seleccionar...</option>
			{#each unidades as u (u.id)}
				<option value={u.id}>{u.nombre} ({u.abreviatura})</option>
			{/each}
		</select>
	</div>

	<div
		class="flex items-center gap-3 rounded-xl border border-[#e8e0d8] bg-[#f8f5f0] p-4 transition-all hover:border-[#8b7355]/30"
	>
		<input
			id="pres_activo"
			type="checkbox"
			class="h-5 w-5 cursor-pointer rounded border-[#e0d8cf] text-[#8b7355] accent-[#8b7355] focus:ring-[#8b7355]"
			bind:checked={form.esta_activo}
		/>
		<div class="flex flex-col">
			<label
				for="pres_activo"
				class="cursor-pointer text-[0.75rem] font-bold text-[#1a1a2e] uppercase"
				>Presentación Activa</label
			>
			<span class="text-[0.65rem] text-[#9a8060]"
				>Habilita o deshabilita esta presentación para ventas y stock.</span
			>
		</div>
	</div>

	<div class="mt-4 flex w-full items-center justify-end gap-3 border-t pt-4">
		<Button variant="ghost" onclick={onCancel}>Cancelar</Button>
		<Button variant="primary" onclick={handleSubmit} loading={isSaving}>
			{#snippet leftIcon()}
				<CheckIcon class="size-4" />
			{/snippet}
			{initialData ? 'Guardar Cambios' : 'Crear Presentación'}
		</Button>
	</div>
</div>
