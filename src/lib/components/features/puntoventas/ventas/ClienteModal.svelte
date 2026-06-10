<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { UserIcon, SearchIcon, CheckCircleIcon, XIcon } from '$lib/icons/outline';
	import { Button, Input } from '$lib/components/ui';
	import type { ClientePOS } from '$lib/interfaces/venta.interface';

	interface Props {
		clienteSeleccionado: ClientePOS | null;
		busquedaCliente: string;
		buscandoCliente: boolean;
		resultadosCliente: ClientePOS[];
		onCerrar: () => void;
		onSeleccionarCliente: (c: ClientePOS | null) => void;
		onBusquedaCliente: (e: Event) => void;
	}

	let {
		clienteSeleccionado,
		busquedaCliente = $bindable(),
		buscandoCliente,
		resultadosCliente,
		onCerrar,
		onSeleccionarCliente,
		onBusquedaCliente
	}: Props = $props();
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
	transition:fade
>
	<div
		class="w-full max-w-md overflow-hidden rounded-3xl border border-light-four bg-light-one shadow-2xl"
		transition:scale={{ duration: 200 }}
	>
		<div class="flex items-center justify-between border-b border-light-four p-5">
			<h3 class="font-bold text-light-black">Seleccionar Cliente</h3>
			<Button onclick={onCerrar} variant="ghost"><XIcon class="h-5 w-5" /></Button>
		</div>

		<div class="p-5">
			<button
				onclick={() => onSeleccionarCliente(null)}
				class="mb-4 flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition {!clienteSeleccionado
					? 'border-light-accent bg-light-accent/10'
					: 'border-light-one_d bg-light-one hover:border-light-accent'}"
			>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-light-one_d text-light-five"
				>
					<UserIcon class="h-5 w-5" />
				</div>
				<div>
					<p class="font-bold text-light-black">Público General</p>
					<p class="text-xs text-light-five">Sin NIT / consumidor final</p>
				</div>
				{#if !clienteSeleccionado}<CheckCircleIcon class="ml-auto h-5 w-5 text-light-accent" />{/if}
			</button>

			<div class="relative mb-3">
				<Input
					autofocus
					placeholder="Buscar por nombre o CI..."
					value={busquedaCliente}
					oninput={onBusquedaCliente}
					icon={SearchIcon}
				/>
			</div>

			<div class="max-h-64 space-y-2 overflow-y-auto">
				{#if buscandoCliente}
					<p class="py-4 text-center text-sm text-light-five">Buscando...</p>
				{:else if resultadosCliente.length === 0 && busquedaCliente}
					<p class="py-4 text-center text-sm text-light-five">Sin resultados</p>
				{:else}
					{#each resultadosCliente as c (c.id)}
						<button
							onclick={() => onSeleccionarCliente(c)}
							class="flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition {clienteSeleccionado?.id ===
							c.id
								? 'border-light-accent bg-light-accent/10'
								: 'border-light-one_d bg-light-one hover:border-light-accent'}"
						>
							<div>
								<p class="text-sm font-bold text-light-black">{c.nombre} {c.apellido_paterno}</p>
								<p class="font-mono text-xs text-light-five">
									CI: {c.ci}<span class="ml-2 font-bold text-light-success"
										>{c.puntos || 0} pts</span
									>
								</p>
							</div>
							{#if clienteSeleccionado?.id === c.id}<CheckCircleIcon
									class="h-5 w-5 text-light-accent"
								/>{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
