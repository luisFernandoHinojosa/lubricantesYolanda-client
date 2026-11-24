<script lang="ts">
	//modalConfirm.svelte
	import { AlertTriangleIcon } from '$lib/icons/outline';
	import BlurOverlay from './blurOverlay.svelte';
	import Button from './button.svelte';
	import { tick } from 'svelte';

	interface Props {
		isOpen: boolean;
		message: string;
		title?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		onConfirm: () => void;
		onCancel: () => void;
		loading?: boolean;
	}

	let {
		isOpen,
		message,
		title = '¿Confirmar esta acción?',
		confirmLabel = 'Confirmar',
		cancelLabel = 'Cancelar',
		onConfirm,
		onCancel,
		loading = false
	}: Props = $props();

	const uid = $props.id();
	let cancelBtn = $state<HTMLElement>();

	$effect(() => {
		if (!isOpen) return;
		const previous = document.activeElement as HTMLElement | null;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !loading && onCancel();
		window.addEventListener('keydown', onKey);
		// El foco va a "Cancelar": evita confirmar algo irreversible con un Enter accidental
		tick().then(() => cancelBtn?.querySelector('button')?.focus());
		return () => {
			window.removeEventListener('keydown', onKey);
			previous?.focus?.();
		};
	});
</script>

{#if isOpen}
	<div class="relative z-50" role="presentation">
		<BlurOverlay>
			<div
				role="alertdialog"
				aria-modal="true"
				aria-labelledby="{uid}-title"
				aria-describedby="{uid}-desc"
				class="relative w-full rounded-t-2xl bg-white p-5 text-left shadow-[0_24px_60px_-20px_rgb(23_26_31/0.5)] sm:w-[28rem] sm:rounded-xl sm:p-6"
			>
				<div class="flex items-start gap-4">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-full bg-aceite-tinte text-aceite-oscuro"
						aria-hidden="true"
					>
						<AlertTriangleIcon class="size-5" />
					</div>
					<div class="min-w-0 pt-1">
						<h2 id="{uid}-title" class="font-display text-xl font-semibold text-acero-950">
							{title}
						</h2>
						<p id="{uid}-desc" class="mt-1.5 text-[0.9375rem] leading-relaxed text-acero-600">
							{message}
						</p>
					</div>
				</div>
				<div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<span bind:this={cancelBtn} class="contents">
						<Button type="button" onclick={() => onCancel()} variant="secondary" disabled={loading}
							>{cancelLabel}</Button
						>
					</span>
					<Button type="button" onclick={() => onConfirm()} {loading} variant="primary"
						>{confirmLabel}</Button
					>
				</div>
			</div>
		</BlurOverlay>
	</div>
{/if}
