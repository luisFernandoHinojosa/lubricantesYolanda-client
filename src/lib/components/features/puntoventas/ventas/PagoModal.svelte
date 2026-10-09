<script lang="ts">
	import { fade, scale, fly, slide } from 'svelte/transition';
	import {
		CreditCardIcon,
		XIcon,
		PlusIcon,
		TrashIcon,
		FileDescriptionIcon,
		UserIcon,
		CheckCircleIcon,
		AlertTriangleIcon
	} from '$lib/icons/outline';
	import { CoinIcon } from '$lib/icons/solid';
	import { Button, Input } from '$lib/components/ui';
	import type { ClientePOS, DatosFacturacionDto } from '$lib/interfaces/venta.interface';

	type MetodoPago = 'EFECTIVO' | 'QR' | 'TARJETA' | 'TRANSFERENCIA' | 'CHEQUE' | 'OTRO';

	interface Pago {
		metodo_pago: MetodoPago;
		monto: number;
		referencia?: string;
	}

	interface Props {
		totalFinal: number;
		pagos: Pago[];
		notasVenta: string;
		procesandoVenta: boolean;
		pagoSuficiente: boolean;
		cambio: number;
		facturar?: boolean;
		datosFacturacion?: DatosFacturacionDto;
		clienteActivo?: boolean;
		clienteForm?: { ci: string; nombre: string; apellido_paterno?: string };
		clienteSeleccionado?: ClientePOS | null;
		onAbrirClienteModal?: () => void;
		onCerrar: () => void;
		onFinalizarVenta: () => void;
		fmt: (n: number) => string;
	}

	let {
		totalFinal,
		pagos = $bindable(),
		notasVenta = $bindable(),
		procesandoVenta,
		pagoSuficiente,
		cambio,
		facturar = $bindable(false),
		datosFacturacion = $bindable({ razonSocial: '', tipoDocumento: 1, numeroDocumento: '' }),
		clienteActivo = false,
		clienteForm,
		clienteSeleccionado,
		onAbrirClienteModal,
		onCerrar,
		onFinalizarVenta,
		fmt
	}: Props = $props();

	function agregarPago() {
		pagos = [...pagos, { metodo_pago: 'EFECTIVO', monto: 0 }];
	}

	function removerPago(index: number) {
		pagos = pagos.filter((_, i) => i !== index);
	}

	let totalPagado = $derived(pagos.reduce((acc, p) => acc + (Number(p.monto) || 0), 0));

	let datosFacturaValidos = $derived(
		!facturar || (datosFacturacion.numeroDocumento.trim().length > 0 && datosFacturacion.razonSocial.trim().length > 0)
	);

	let puedeFinalizar = $derived(pagoSuficiente && datosFacturaValidos && !procesandoVenta);

	let nombreCliente = $derived(
		clienteActivo && clienteForm && clienteForm.nombre
			? `${clienteForm.nombre} ${clienteForm.apellido_paterno || ''}`.trim()
			: clienteSeleccionado
				? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido_paterno || ''}`.trim()
				: 'Público General'
	);
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-md"
	transition:fade={{ duration: 150 }}
>
	<div
		class="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-light-four bg-light-one shadow-2xl"
		transition:scale={{ duration: 200 }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-light-four px-6 py-4 sticky top-0 bg-light-one z-10">
			<div class="flex items-center gap-2.5">
				<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-light-two text-light-one">
					<CreditCardIcon class="h-5 w-5" />
				</div>
				<div>
					<h3 class="text-base font-bold text-light-black">Cobrar Venta</h3>
					<p class="text-xs text-light-five">Registre los pagos y confirme la emisión de comprobante</p>
				</div>
			</div>
			<Button variant="ghost" onclick={onCerrar} size="xs">
				<XIcon class="h-5 w-5" />
			</Button>
		</div>

		<div class="space-y-5 p-6">
			<!-- Total a Cobrar -->
			<div class="bg-light-light-one_d rounded-2xl border border-light-four py-5 text-center">
				<span class="mb-1 block text-xs font-bold tracking-widest text-light-success uppercase">
					Total a cobrar
				</span>
				<span class="font-mono text-5xl font-bold text-light-two drop-shadow-sm">
					{fmt(totalFinal)}
				</span>
			</div>

			<!-- Control Rápido de Facturación SIAT -->
			<div
				class="rounded-2xl border transition-all p-4 {facturar
					? 'border-emerald-300 bg-emerald-50/70'
					: 'border-light-four bg-light-one_d/30'}"
			>
				<div class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-2.5">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-lg {facturar
								? 'bg-emerald-600 text-white'
								: 'bg-light-four text-light-five'}"
						>
							<FileDescriptionIcon class="h-4 w-4" />
						</div>
						<div>
							<span class="text-xs font-bold text-light-black">¿Emitir Factura Electrónica?</span>
							<p class="text-[11px] text-light-five">
								{facturar ? 'Factura SIAT con valor fiscal' : 'Recibo simple de venta'}
							</p>
						</div>
					</div>

					<div class="flex items-center gap-2">
						{#if onAbrirClienteModal}
							<button
								type="button"
								onclick={onAbrirClienteModal}
								class="text-xs font-semibold text-light-two hover:underline flex items-center gap-1"
							>
								<UserIcon class="h-3 w-3" />
								{nombreCliente}
							</button>
						{/if}

						<label class="relative inline-flex cursor-pointer items-center">
							<input
								type="checkbox"
								checked={facturar}
								onchange={(e) => {
									facturar = (e.currentTarget as HTMLInputElement).checked;
									if (facturar) {
										if (!datosFacturacion.numeroDocumento && clienteForm?.ci) {
											datosFacturacion.numeroDocumento = clienteForm.ci;
										}
										if (!datosFacturacion.razonSocial && clienteForm?.nombre) {
											datosFacturacion.razonSocial = `${clienteForm.nombre} ${clienteForm.apellido_paterno || ''}`.trim();
										}
									}
								}}
								class="peer sr-only"
							/>
							<div
								class="peer h-6 w-11 rounded-full bg-light-four transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-5"
							></div>
						</label>
					</div>
				</div>

				<!-- Datos de Facturación en línea si facturar está activo -->
				{#if facturar}
					<div class="mt-3 pt-3 border-t border-emerald-200/60 space-y-3" transition:slide={{ duration: 150 }}>
						<div class="flex items-center gap-2 mb-1">
							<span class="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
								Tipo de Documento:
							</span>
							<div class="flex gap-1.5">
								<button
									type="button"
									onclick={() => (datosFacturacion.tipoDocumento = 1)}
									class="px-2 py-0.5 text-xs font-bold rounded border transition {datosFacturacion.tipoDocumento === 1
										? 'border-emerald-600 bg-emerald-600 text-white'
										: 'border-emerald-200 bg-white text-emerald-800'}"
								>
									CI
								</button>
								<button
									type="button"
									onclick={() => (datosFacturacion.tipoDocumento = 5)}
									class="px-2 py-0.5 text-xs font-bold rounded border transition {datosFacturacion.tipoDocumento === 5
										? 'border-emerald-600 bg-emerald-600 text-white'
										: 'border-emerald-200 bg-white text-emerald-800'}"
								>
									NIT
								</button>
								<button
									type="button"
									onclick={() => (datosFacturacion.tipoDocumento = 2)}
									class="px-2 py-0.5 text-xs font-bold rounded border transition {datosFacturacion.tipoDocumento === 2
										? 'border-emerald-600 bg-emerald-600 text-white'
										: 'border-emerald-200 bg-white text-emerald-800'}"
								>
									CEX
								</button>
							</div>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<Input
								label="NIT / CI *"
								bind:value={datosFacturacion.numeroDocumento}
								placeholder="Ej: 1020304050"
								size="sm"
								required
							/>
							<Input
								label="Razón Social *"
								bind:value={datosFacturacion.razonSocial}
								placeholder="Ej: Industrias XYZ"
								size="sm"
								required
							/>
						</div>

						{#if !datosFacturaValidos}
							<p class="text-xs text-amber-700 flex items-center gap-1 font-medium">
								<AlertTriangleIcon class="h-3.5 w-3.5 shrink-0" />
								Complete NIT/CI y Razón Social para emitir la factura.
							</p>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Lista de Pagos -->
			<div>
				<div class="flex items-center justify-between mb-2.5">
					<label class="block text-xs font-bold text-light-black uppercase tracking-wider">
						Métodos de pago
					</label>
					<Button variant="ghost" size="xs" onclick={agregarPago} class="text-light-two hover:text-light-three">
						{#snippet leftIcon()}
							<PlusIcon class="h-4 w-4" />
						{/snippet}
						Agregar método
					</Button>
				</div>
				
				<div class="space-y-3">
					{#each pagos as pago, i (i)}
						<div class="relative rounded-2xl border border-light-four bg-white p-4 shadow-sm" transition:fly={{ y: -10, duration: 150 }}>
							{#if pagos.length > 1}
								<button 
									type="button"
									onclick={() => removerPago(i)}
									class="absolute right-2 top-2 text-light-error hover:bg-red-50 p-1.5 rounded-full transition-colors"
									title="Eliminar método de pago"
								>
									<TrashIcon class="h-4 w-4" />
								</button>
							{/if}
							
							<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
								{#each ['EFECTIVO', 'QR', 'TARJETA', 'TRANSFERENCIA'] as metodo}
									<button
										type="button"
										onclick={() => (pago.metodo_pago = metodo as MetodoPago)}
										class="rounded-xl border py-2 text-xs font-bold transition {pago.metodo_pago === metodo
											? 'border-light-two bg-light-two text-light-one shadow-sm'
											: 'border-light-four bg-light-one text-light-five hover:border-light-two_d hover:text-light-two'}"
									>
										{metodo}
									</button>
								{/each}
							</div>

							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Input
									type="number"
									label="Monto"
									autofocus={i === pagos.length - 1}
									bind:value={pago.monto}
									placeholder="0.00"
									icon={CoinIcon}
									size="sm"
								/>
								{#if pago.metodo_pago !== 'EFECTIVO'}
									<Input
										type="text"
										label="Referencia (Opcional)"
										bind:value={pago.referencia}
										placeholder="Ej: Bisa-12345"
										size="sm"
									/>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Cambio / Faltante -->
			{#if totalPagado > 0}
				<div
					class="rounded-2xl border {totalPagado >= totalFinal
						? 'bg-light-light-one_d border-light-four'
						: 'bg-red-50 border-red-100'} p-4 text-center"
					transition:fly={{ y: 4, duration: 150 }}
				>
					{#if totalPagado >= totalFinal}
						<span class="text-xs font-bold tracking-widest text-light-black uppercase">Cambio a entregar</span>
						<p class="font-mono text-3xl font-bold text-light-success">
							{fmt(cambio)}
						</p>
					{:else}
						<span class="text-xs font-bold tracking-widest text-light-error uppercase">Faltante</span>
						<p class="font-mono text-3xl font-bold text-light-error">
							{fmt(totalFinal - totalPagado)}
						</p>
					{/if}
				</div>
			{/if}

			<!-- Notas -->
			<Input
				bind:value={notasVenta}
				label="Notas de la Venta (Opcional)"
				placeholder="Ej: Entregar en puerta lateral..."
				size="sm"
			/>

			<!-- Botón Finalizar -->
			<div class="sticky bottom-0 bg-light-one pt-2 pb-2">
				<Button
					onclick={onFinalizarVenta}
					disabled={!puedeFinalizar}
					variant="primary"
					size="lg"
					fullWidth
					loading={procesandoVenta}
				>
					{facturar ? 'Confirmar y Facturar Venta' : 'Confirmar Venta'}
				</Button>
			</div>
		</div>
	</div>
</div>
