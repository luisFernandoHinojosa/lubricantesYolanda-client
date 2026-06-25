<script lang="ts">
	import { Modal, Button } from '$lib/components/ui';
	import { CheckIcon, XMarkIcon } from '$lib/icons/outline';

	interface Props {
		isOpen: boolean;
		stockDistribucionId: string | null;
		tipoAjuste: 'sumar' | 'restar';
		loading?: boolean;
		onClose: () => void;
		onSave: (data: { id_stock_distribucion: string; cantidad: number; observacion: string }) => Promise<void>;
	}

	let { isOpen, stockDistribucionId, tipoAjuste, loading = false, onClose, onSave }: Props = $props();

	let cantidad = $state(1);
	let observacion = $state('');

	$effect(() => {
		if (isOpen) {
			if (tipoAjuste === 'sumar') {
				observacion = `Se encontraron ${cantidad} unidades extra en el conteo manual`;
			} else {
				observacion = `Se dan de baja ${cantidad} unidades por daño físico`;
			}
		}
	});

	function resetForm() {
		cantidad = 1;
	}

	function handleSubmit() {
		if (!stockDistribucionId) return;
		const finalCantidad = tipoAjuste === 'restar' ? -Math.abs(cantidad) : Math.abs(cantidad);
		onSave({
			id_stock_distribucion: stockDistribucionId,
			cantidad: finalCantidad,
			observacion
		}).then(() => {
			resetForm();
		}).catch(() => {});
	}
</script>

<Modal {isOpen} {onClose} title={tipoAjuste === 'sumar' ? 'Aumentar Stock' : 'Restar Stock'} maxWidth="sm:max-w-md">
	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
		class="flex flex-col gap-4"
	>
		<div class="flex flex-col gap-2">
			<label class="text-[0.65rem] font-black tracking-widest text-[#9a8060] uppercase" for="cantidad">
				Cantidad a {tipoAjuste === 'sumar' ? 'aumentar' : 'restar'} *
			</label>
			<input
				id="cantidad"
				type="number"
				min="1"
				step="1"
				bind:value={cantidad}
				required
				class="w-full rounded-xl border-[1.5px] border-[#e8e0d8] bg-[#fdfcfb] px-4 py-2.5 text-sm font-bold text-[#1a1a2e] outline-none focus:border-[#b09475] focus:ring-4 focus:ring-[#b09475]/10"
			/>
		</div>

		<div class="flex flex-col gap-2">
			<label class="text-[0.65rem] font-black tracking-widest text-[#9a8060] uppercase" for="observacion">
				Observación *
			</label>
			<textarea
				id="observacion"
				bind:value={observacion}
				required
				rows="3"
				class="w-full rounded-xl border-[1.5px] border-[#e8e0d8] bg-[#fdfcfb] px-4 py-2.5 text-sm font-bold text-[#1a1a2e] outline-none focus:border-[#b09475] focus:ring-4 focus:ring-[#b09475]/10"
			></textarea>
		</div>

		<div class="mt-4 flex items-center justify-end gap-3 border-t border-[#e8e0d8] pt-4">
			<Button variant="ghost" onclick={() => { resetForm(); onClose(); }} disabled={loading}>
				{#snippet leftIcon()}
					<XMarkIcon class="size-4" />
				{/snippet}
				Cancelar
			</Button>
			<Button type="submit" variant="primary" {loading}>
				{#snippet leftIcon()}
					<CheckIcon class="size-4" />
				{/snippet}
				Confirmar
			</Button>
		</div>
	</form>
</Modal>
