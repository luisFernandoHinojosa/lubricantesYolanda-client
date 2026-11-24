<script lang="ts">
	import { XIcon } from '$lib/icons/outline';
	import BlurOverlay from './blurOverlay.svelte';
	import type { Snippet } from 'svelte';
	import { tick } from 'svelte';

	interface Props {
		isOpen: boolean;
		title: string;
		description?: string;
		onClose: () => void;
		children: Snippet;
		footer?: Snippet;
		maxWidth?: string;
	}

	let {
		isOpen,
		title,
		description,
		onClose,
		children,
		footer,
		maxWidth = 'sm:max-w-2xl'
	}: Props = $props();

	const uid = $props.id();
	let panel = $state<HTMLElement>();

	// Escape cierra, el fondo no se desplaza y el foco entra al diálogo
	$effect(() => {
		if (!isOpen) return;
		const previous = document.activeElement as HTMLElement | null;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				onClose();
			}
		};
		window.addEventListener('keydown', onKey);

		tick().then(() => {
			const first = panel?.querySelector<HTMLElement>(
				'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
			);
			(first ?? panel)?.focus();
		});

		return () => {
			window.removeEventListener('keydown', onKey);
			document.body.style.overflow = prevOverflow;
			previous?.focus?.();
		};
	});
</script>

{#if isOpen}
	<div class="relative z-50">
		<BlurOverlay>
			<div
				bind:this={panel}
				role="dialog"
				aria-modal="true"
				aria-labelledby="{uid}-title"
				aria-describedby={description ? `${uid}-desc` : undefined}
				tabindex="-1"
				class="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white text-left shadow-[0_24px_60px_-20px_rgb(23_26_31/0.5)] outline-none sm:my-8 sm:rounded-xl {maxWidth} sm:w-screen"
			>
				<div
					class="flex items-start justify-between gap-4 border-b border-acero-100 px-5 py-4 sm:px-6"
				>
					<div class="min-w-0">
						<h2 id="{uid}-title" class="font-display text-xl font-semibold text-acero-950">
							{title}
						</h2>
						{#if description}
							<p id="{uid}-desc" class="mt-0.5 text-sm text-acero-500">{description}</p>
						{/if}
					</div>
					<button
						type="button"
						onclick={onClose}
						class="-mr-2 shrink-0 rounded-md p-2 text-acero-500 transition-colors hover:bg-acero-100 hover:text-acero-950"
						aria-label="Cerrar"
					>
						<XIcon class="size-5" />
					</button>
				</div>

				<div class="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
					{@render children()}
				</div>

				{#if footer}
					<div class="border-t border-acero-100 bg-acero-50 px-5 py-3.5 sm:px-6">
						{@render footer()}
					</div>
				{/if}
			</div>
		</BlurOverlay>
	</div>
{/if}
