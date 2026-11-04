<script lang="ts">
	import type { AjustePuntosDto, Cliente } from '$lib/interfaces';
	import { validateSchema } from '$lib/utils';
	import { ajustePuntosSchema } from '$lib/zod';
	import { Button, Input, Modal } from '$lib/components/ui';

	interface Props {
		isOpen: boolean;
		cliente: Cliente | null;
		onSubmit: (dto: AjustePuntosDto) => Promise<void>;
		onClose: () => void;
	}

	let { isOpen, cliente, onSubmit, onClose }: Props = $props();

	// Un <input type="number"> enlazado vía spread entrega string en runtime
	let puntos = $state<number | string | null>(null);
	let motivo = $state('');
	let isSubmitting = $state(false);
	let errors: Record<string, string> = $state({});

	$effect(() => {
		if (isOpen) {
			puntos = null;
			motivo = '';
			errors = {};
		}
	});

	// Vista previa: el resultado nunca baja de 0
	const resultado = $derived(
		cliente && Number(puntos) ? Math.max(0, cliente.puntos + Math.trunc(Number(puntos))) : null
	);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		const validation = validateSchema(ajustePuntosSchema, {
			puntos: puntos === null || puntos === '' ? NaN : Number(puntos),
			motivo: motivo.trim() || undefined
		});
		if (!validation.success) {
			errors = validation.errors;
			return;
		}
		errors = {};

		isSubmitting = true;
		try {
			await onSubmit({
				puntos: validation.data.puntos,
				...(validation.data.motivo ? { motivo: validation.data.motivo } : {})
			});
			onClose();
		} catch (error) {
			console.error('Error al ajustar puntos:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Modal {isOpen} {onClose} title="Ajustar puntos" maxWidth="sm:max-w-md">
	{#if cliente}
		<form id="cliente-puntos-form" onsubmit={handleSubmit} class="flex flex-col gap-4">
			<p class="text-sm text-light-two">
				<span class="font-semibold text-light-black">
					{[cliente.nombre, cliente.apellido_paterno].filter(Boolean).join(' ')}
				</span>
				· {cliente.puntos} puntos actuales
			</p>

			<Input
				type="number"
				id="puntos"
				label="Puntos a sumar o restar"
				step="1"
				bind:value={puntos}
				placeholder="Ej: 20 suma, -10 resta"
				error={errors.puntos}
				required
			/>

			{#if resultado !== null}
				<p class="text-sm text-light-two">
					Resultado: <span class="font-semibold text-light-black">{resultado} puntos</span>
				</p>
			{/if}

			<Input
				type="text"
				id="motivo"
				label="Motivo"
				bind:value={motivo}
				placeholder="Ej: Bono de fidelidad"
				error={errors.motivo}
				maxlength={200}
			/>
		</form>
	{/if}

	{#snippet footer()}
		<div class="flex justify-end gap-3">
			<Button type="button" variant="secondary" onclick={onClose} disabled={isSubmitting}>
				Cancelar
			</Button>
			<Button type="submit" form="cliente-puntos-form" variant="primary" loading={isSubmitting}>
				Aplicar
			</Button>
		</div>
	{/snippet}
</Modal>
