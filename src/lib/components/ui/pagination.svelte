<script lang="ts">
	import { ChevronLeftIcon } from '$lib/icons/outline';
	import ChevronRightIcon from '$lib/icons/outline/chevronRightIcon.svelte';

	interface Props {
		currentPage: number;
		totalPages: number;
		perPage: number;
		total: number;
		onPageChange: (page: number) => void;
		maxVisiblePages?: number;
	}

	let {
		currentPage,
		totalPages,
		perPage,
		total,
		onPageChange,
		maxVisiblePages = 10
	}: Props = $props();

	function getVisiblePages(): number[] {
		const maxVisible = maxVisiblePages;
		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		let end = Math.min(totalPages, start + maxVisible - 1);

		if (end - start + 1 < maxVisible) {
			start = Math.max(1, end - maxVisible + 1);
		}

		end = Math.min(totalPages, start + maxVisible - 1);

		const pages: number[] = [];
		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		return pages;
	}

	function handlePageClick(page: number) {
		if (page === currentPage || page < 1 || page > totalPages) return;
		onPageChange(page);
	}

	function goToPreviousPage() {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	}

	function goToNextPage() {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	}

	let startItem = $derived(total === 0 ? 0 : (currentPage - 1) * perPage + 1);
	let endItem = $derived(Math.min(currentPage * perPage, total));
	let visiblePages = $derived(getVisiblePages());
</script>

<nav class="flex flex-col gap-3 px-4 py-3 sm:px-5" aria-label="Paginación">
	<div class="hidden w-full items-center justify-between md:flex">
		<p class="text-sm text-acero-500">
			<span class="font-semibold text-acero-900 tabular-nums">{startItem}–{endItem}</span> de
			<span class="font-semibold text-acero-900 tabular-nums">{total}</span>
		</p>

		<div class="flex items-center gap-1">
			<button
				type="button"
				onclick={goToPreviousPage}
				disabled={currentPage === 1}
				class="inline-flex size-9 items-center justify-center rounded-md text-acero-700 transition-colors hover:bg-acero-100 disabled:cursor-not-allowed disabled:opacity-35"
				aria-label="Página anterior"
			>
				<ChevronLeftIcon class="size-5" />
			</button>

			{#each visiblePages as page (page)}
				<button
					type="button"
					onclick={() => handlePageClick(page)}
					aria-current={page === currentPage ? 'page' : undefined}
					aria-label="Página {page}"
					class="inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2.5 text-sm font-semibold tabular-nums transition-colors {page ===
					currentPage
						? 'bg-acero-900 text-white'
						: 'text-acero-700 hover:bg-acero-100'}"
				>
					{page}
				</button>
			{/each}

			<button
				type="button"
				onclick={goToNextPage}
				disabled={currentPage === totalPages || totalPages === 0}
				class="inline-flex size-9 items-center justify-center rounded-md text-acero-700 transition-colors hover:bg-acero-100 disabled:cursor-not-allowed disabled:opacity-35"
				aria-label="Página siguiente"
			>
				<ChevronRightIcon class="size-5" />
			</button>
		</div>
	</div>

	<div class="flex w-full items-center justify-between md:hidden">
		<button
			type="button"
			onclick={goToPreviousPage}
			disabled={currentPage === 1}
			class="inline-flex size-11 items-center justify-center rounded-lg border border-acero-200 bg-white text-acero-700 active:bg-acero-100 disabled:opacity-35"
			aria-label="Página anterior"
		>
			<ChevronLeftIcon class="size-5" />
		</button>
		<p class="text-sm text-acero-600">
			Página <span class="font-semibold text-acero-950 tabular-nums">{currentPage}</span> de
			<span class="font-semibold text-acero-950 tabular-nums">{Math.max(totalPages, 1)}</span>
		</p>
		<button
			type="button"
			onclick={goToNextPage}
			disabled={currentPage === totalPages || totalPages === 0}
			class="inline-flex size-11 items-center justify-center rounded-lg border border-acero-200 bg-white text-acero-700 active:bg-acero-100 disabled:opacity-35"
			aria-label="Página siguiente"
		>
			<ChevronRightIcon class="size-5" />
		</button>
	</div>
</nav>
