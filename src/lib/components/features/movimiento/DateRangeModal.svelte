<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { Button, Heading, Input } from '$lib/components/ui';
	import { XIcon, ZoomIcon } from '$lib/icons/outline';
	import { clickOutside } from '$lib/utils';
	import { CalendarIcon } from '$lib/icons/solid';

	interface Props {
		isOpen: boolean;
		startDate: string;
		endDate: string;
		onApply: (start: string, end: string) => void;
		onCancel: () => void;
	}

	let { isOpen = $bindable(), startDate, endDate, onApply, onCancel }: Props = $props();

	let internalDates = $state({
		start: startDate,
		end: endDate
	});

	let error = $derived(
		new Date(internalDates.end) < new Date(internalDates.start)
			? 'La fecha final no puede ser menor a la fecha inicial'
			: ''
	);

	function handleApply() {
		if (error) return;
		onApply(internalDates.start, internalDates.end);
		isOpen = false;
	}

	function handleClose() {
		isOpen = false;
		onCancel();
	}

	$effect(() => {
		if (isOpen) {
			internalDates.start = startDate;
			internalDates.end = endDate;
		}
	});
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]"
		transition:fade={{ duration: 200 }}
	>
		<div
			use:clickOutside={handleClose}
			class="w-full max-w-md overflow-hidden rounded-3xl bg-light-one shadow-2xl ring-1 ring-light-four"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Header -->
			<div class="relative border-b border-light-four bg-light-one_d px-8 py-6">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div
							class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl shadow-sm"
						>
							<CalendarIcon class="size-6" />
						</div>
						<Heading level="h4" class="font-bold tracking-tight text-light-black"
							>Rango Personalizado</Heading
						>
					</div>
					<button
						onclick={handleClose}
						class="rounded-full p-2 text-light-two transition-colors hover:bg-light-four"
					>
						<XIcon class="size-5" />
					</button>
				</div>
			</div>

			<!-- Body -->
			<div class="space-y-6 p-8">
				<div class="grid grid-cols-1 gap-6">
					<Input
						id="modal-start-date"
						type="date"
						label="Fecha de Inicio"
						bind:value={internalDates.start}
						placeholder="Selecciona fecha de inicio"
					/>

					<div class="relative">
						<Input
							id="modal-end-date"
							type="date"
							label="Fecha de Fin"
							bind:value={internalDates.end}
							placeholder="Selecciona fecha de fin"
							{error}
						/>
					</div>
				</div>

				{#if error}
					<div
						class="animate-fade-in flex items-start gap-2 rounded-xl bg-red-50 p-4 text-xs font-medium text-red-600"
					>
						<div class="mt-0.5">
							<svg
								class="size-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2.5"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
								/></svg
							>
						</div>
						<p>{error}</p>
					</div>
				{/if}

				<div class="mt-8 flex gap-3">
					<Button
						variant="outline"
						onclick={handleClose}
						class="flex-1 rounded-2xl border-light-four bg-white py-3 hover:bg-light-one_d"
					>
						Cancelar
					</Button>
					<Button
						variant="primary"
						onclick={handleApply}
						disabled={!!error}
						class="flex-1 rounded-2xl py-3 shadow-lg {error ? '' : 'shadow-primary/20'}"
					>
						{#snippet leftIcon()}<ZoomIcon class="size-5" />{/snippet}
						Aplicar
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
