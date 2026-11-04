<script lang="ts">
	import { Modal, Button, Input } from '$lib/components/ui';
	import { AlertTriangleIcon, ChevronDownIcon } from '$lib/icons/outline';
	import type {
		DatosFacturar,
		MetodoPagoVenta,
		VentaListItem
	} from '$lib/interfaces/venta.interface';
	import type { Cliente } from '$lib/interfaces/cliente.interface';
	import { METODO_PAGO_FACTURA } from '$lib/constants/dataFacturacion';
	import { clienteService } from '$lib/services/cliente.service';

	interface Props {
		venta: VentaListItem | null;
		// Caja abierta del cajero: al facturar solo se cambia el cliente en ventas de esa sesión
		idSesionAbierta?: string | null;
		loading?: boolean;
		onClose: () => void;
		// Facturar: el backend recibe el porcentaje y calcula el monto (igual que al crear la venta).
		// Volver a emitir: los montos no cambian, solo puede cambiar el cliente.
		onConfirm: (datos: DatosFacturar) => void;
	}

	let { venta, idSesionAbierta = null, loading = false, onClose, onConfirm }: Props = $props();

	const CI_CLIENTE_GENERICO = '000000';
	const PORCENTAJE_IVA = 13;
	// Mismos métodos que al crear una venta: los más usados a un toque, el resto del catálogo SIAT en "Más"
	const PRINCIPALES: MetodoPagoVenta[] = ['EFECTIVO', 'QR', 'TARJETA'];
	const SECUNDARIOS = METODO_PAGO_FACTURA.map((m) => m.codigo as MetodoPagoVenta).filter(
		(codigo) => !PRINCIPALES.includes(codigo)
	);

	// El total ya incluye el recargo registrado (si lo hay)
	let base = $derived(venta ? venta.total - (venta.monto_recargo_iva || 0) : 0);
	// Factura con error o anulada: se vuelve a emitir (POST /reintentar-factura)
	let reintento = $derived(venta?.factura?.estado === 'ERROR');
	let reemision = $derived(venta?.factura?.estado === 'ANULADA');
	let volverAEmitir = $derived(reintento || reemision);
	// Al volver a emitir siempre; al facturar por primera vez solo ventas de la caja abierta
	let puedeCambiarCliente = $derived(
		volverAEmitir || (!!idSesionAbierta && venta?.id_sesion_caja === idSesionAbierta)
	);

	let porcentaje = $state<number | null>(PORCENTAJE_IVA);
	let monto = $state<number | null>(0);
	let metodoPagoRecargo = $state<MetodoPagoVenta>('EFECTIVO');
	let esSecundario = $derived(SECUNDARIOS.includes(metodoPagoRecargo));

	// Cambio de cliente (solo al volver a emitir): se busca un cliente ya registrado por CI
	let cambiandoCliente = $state(false);
	let ciBusqueda = $state('');
	let buscandoCliente = $state(false);
	let clienteNuevo = $state<Cliente | null>(null);
	let errorCliente = $state('');

	// Al abrir el modal: al facturar por primera vez se propone el 13%
	$effect(() => {
		if (!venta) return;
		porcentaje = PORCENTAJE_IVA;
		monto = redondear((base * PORCENTAJE_IVA) / 100);
		metodoPagoRecargo = 'EFECTIVO';
		cancelarCambioCliente();
	});

	function redondear(n: number) {
		return Math.round(n * 100) / 100;
	}

	// % y Bs están enlazados: el backend recibe el porcentaje
	function onPorcentaje(valor: number | null) {
		porcentaje = valor;
		monto = redondear((base * (Number(valor) || 0)) / 100);
	}

	function onMonto(valor: number | null) {
		monto = valor;
		porcentaje = base > 0 ? redondear(((Number(valor) || 0) * 100) / base) : 0;
	}

	function cancelarCambioCliente() {
		cambiandoCliente = false;
		ciBusqueda = '';
		clienteNuevo = null;
		errorCliente = '';
	}

	async function buscarCliente() {
		const ci = ciBusqueda.trim();
		clienteNuevo = null;
		errorCliente = '';
		if (!ci) return;
		if (ci === CI_CLIENTE_GENERICO) {
			errorCliente = 'Para facturar, el cliente debe tener CI o NIT.';
			return;
		}
		try {
			buscandoCliente = true;
			const cliente = await clienteService.getClienteByCi(ci);
			if (!cliente) {
				errorCliente = 'Cliente no registrado. Regístrelo en Clientes y vuelva a buscarlo.';
			} else if (cliente.id === venta?.cliente?.id) {
				errorCliente = 'Es el mismo cliente de la venta.';
			} else {
				clienteNuevo = cliente;
			}
		} catch (e: any) {
			errorCliente = e?.message ?? 'No se pudo buscar el cliente.';
		} finally {
			buscandoCliente = false;
		}
	}

	function nombreCliente(c: Cliente) {
		return [c.nombre, c.apellido_paterno, c.apellido_materno].filter(Boolean).join(' ');
	}

	let clienteVentaFacturable = $derived(!!venta?.cliente && venta.cliente.ci !== CI_CLIENTE_GENERICO);
	// Con otro cliente se puede facturar aunque el de la venta sea Público General
	let clienteFacturable = $derived(clienteNuevo ? true : clienteVentaFacturable);

	let porcentajeRecargo = $derived(Number(porcentaje) || 0);
	// Mismo cálculo que el backend: si se escribe el monto, el % se redondea a 2 decimales
	// y el monto final puede variar en centavos respecto a lo escrito
	let montoRecargo = $derived(redondear((base * porcentajeRecargo) / 100));
	let recargoValido = $derived(volverAEmitir || (porcentajeRecargo >= 0 && porcentajeRecargo <= 100));
	let puedeFacturar = $derived(
		clienteFacturable && recargoValido && !loading && !(cambiandoCliente && !clienteNuevo)
	);

	function confirmar() {
		onConfirm({
			porcentaje_recargo_iva: porcentajeRecargo,
			metodo_pago_recargo: metodoPagoRecargo,
			id_cliente: puedeCambiarCliente ? clienteNuevo?.id : undefined
		});
	}

	function fmt(n: number) {
		return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(n);
	}
</script>

<Modal
	isOpen={!!venta}
	title={reintento ? 'Reintentar factura' : reemision ? 'Volver a emitir factura' : 'Facturar venta'}
	{onClose}
	maxWidth="sm:max-w-md"
>
	{#if venta}
		<div class="space-y-5 text-sm">
			<!-- Venta y cliente -->
			<div class="rounded-xl border border-light-four bg-light-one_d/40 p-4">
				<div class="flex items-center justify-between">
					<span class="text-[11px] font-bold tracking-widest text-light-five uppercase">Venta</span>
					<span class="font-mono font-bold text-light-black">{venta.numero_comprobante}</span>
				</div>
				<div class="mt-2 flex items-center justify-between gap-3">
					<span class="text-[11px] font-bold tracking-widest text-light-five uppercase">Cliente</span>
					{#if clienteVentaFacturable && venta.cliente}
						<span class="truncate text-right text-light-black {clienteNuevo ? 'line-through opacity-60' : ''}">
							<span class="font-bold">{venta.cliente.nombre_completo}</span>
							· CI/NIT <span class="font-mono">{venta.cliente.ci}</span>
						</span>
					{:else}
						<span class="font-bold text-light-black italic">Público General</span>
					{/if}
				</div>
				{#if clienteNuevo}
					<div class="mt-1 flex items-center justify-between gap-3">
						<span class="text-[11px] font-bold tracking-widest text-emerald-700 uppercase">Nuevo</span>
						<span class="truncate text-right text-emerald-700">
							<span class="font-bold">{nombreCliente(clienteNuevo)}</span>
							· CI/NIT <span class="font-mono">{clienteNuevo.ci}</span>
						</span>
					</div>
				{/if}

				{#if puedeCambiarCliente}
					{#if !cambiandoCliente}
						<Button variant="link" size="xs" class="mt-3" onclick={() => (cambiandoCliente = true)}>
							{clienteVentaFacturable ? 'Cambiar cliente' : 'Asignar cliente'}
						</Button>
					{:else}
						<div class="mt-3 space-y-2 border-t border-light-four pt-3">
							<div class="flex items-start gap-2">
								<Input
									class="flex-1"
									size="sm"
									type="text"
									placeholder="CI/NIT del cliente registrado"
									bind:value={ciBusqueda}
									error={errorCliente}
									onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && buscarCliente()}
								/>
								<Button
									variant="secondary"
									size="sm"
									onclick={buscarCliente}
									loading={buscandoCliente}
								>
									Buscar
								</Button>
							</div>
							<Button variant="link" size="xs" onclick={cancelarCambioCliente}>
								Mantener el cliente de la venta
							</Button>
						</div>
					{/if}
				{/if}
			</div>

			{#if !clienteFacturable}
				<p
					class="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800"
				>
					<AlertTriangleIcon class="mt-0.5 h-4 w-4 shrink-0" />
					{#if puedeCambiarCliente}
						Esta venta no tiene un cliente con CI o NIT. Asígnele un cliente registrado para facturarla.
					{:else}
						Esta venta no tiene un cliente con CI o NIT. Solo se le puede asignar un cliente si es de su
						caja abierta.
					{/if}
				</p>
			{:else}
				{#if reintento}
					<p
						class="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
					>
						<AlertTriangleIcon class="mt-0.5 h-4 w-4 shrink-0" />
						El intento anterior de emitir la factura falló. Se volverá a enviar al SIAT.
					</p>
				{:else if reemision && venta.factura}
					<p
						class="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800"
					>
						<AlertTriangleIcon class="mt-0.5 h-4 w-4 shrink-0" />
						La factura N° {venta.factura.numero_factura} fue anulada. Se emitirá una nueva factura con otro
						número, con los datos actuales del cliente.
					</p>
				{/if}

				{#if !volverAEmitir}
					<!-- Recargo IVA (solo al facturar por primera vez) -->
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<h3 class="text-[11px] font-bold tracking-widest text-light-five uppercase">
								Recargo IVA al cliente
							</h3>
							<Button
								size="xs"
								variant={Number(porcentaje) === 0 ? 'primary' : 'outline'}
								onclick={() => onPorcentaje(0)}
							>
								Sin recargo
							</Button>
						</div>
						<div class="grid grid-cols-2 gap-2">
							<Input
								size="sm"
								type="number"
								label="Porcentaje (%)"
								min="0"
								max="100"
								step="0.01"
								value={porcentaje}
								oninput={(e: Event) => onPorcentaje((e.target as HTMLInputElement).valueAsNumber)}
								error={recargoValido ? undefined : 'Debe estar entre 0 y 100%.'}
							/>
							<Input
								size="sm"
								type="number"
								label="Monto (Bs)"
								min="0"
								step="0.01"
								value={monto}
								oninput={(e: Event) => onMonto((e.target as HTMLInputElement).valueAsNumber)}
							/>
						</div>
						{#if montoRecargo > 0}
							<div class="space-y-1.5 pt-1">
								<span class="text-xs text-light-five">El cliente paga el recargo con</span>
								<div
									class="grid grid-cols-4 gap-0.5 rounded-lg bg-light-one_d p-0.5"
									role="radiogroup"
									aria-label="Método de pago del recargo"
								>
									{#each PRINCIPALES as metodo (metodo)}
										<button
											type="button"
											role="radio"
											aria-checked={metodoPagoRecargo === metodo}
											onclick={() => (metodoPagoRecargo = metodo)}
											class="rounded-md py-1.5 text-xs font-bold transition {metodoPagoRecargo === metodo
												? 'bg-light-two text-light-one shadow-sm'
												: 'text-light-five hover:bg-light-one hover:text-light-black'}"
										>
											{metodo}
										</button>
									{/each}

									<!-- Select nativo invisible sobre el segmento (igual que en el POS) -->
									<label
										class="relative flex cursor-pointer items-center justify-center gap-0.5 rounded-md py-1.5 text-xs font-bold transition {esSecundario
											? 'bg-light-two text-light-one shadow-sm'
											: 'text-light-five hover:bg-light-one hover:text-light-black'}"
									>
										<span class="truncate">{esSecundario ? metodoPagoRecargo : 'MÁS'}</span>
										<ChevronDownIcon className="h-3 w-3 shrink-0" />
										<select
											class="absolute inset-0 cursor-pointer bg-light-one text-sm font-medium text-light-black opacity-0"
											aria-label="Otros métodos de pago"
											value={esSecundario ? metodoPagoRecargo : ''}
											onchange={(e) =>
												(metodoPagoRecargo = (e.target as HTMLSelectElement).value as MetodoPagoVenta)}
										>
											<option value="" disabled>Otros métodos</option>
											{#each SECUNDARIOS as metodo (metodo)}
												<option value={metodo}>{metodo}</option>
											{/each}
										</select>
									</label>
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Resumen -->
				<dl class="space-y-1 border-t border-light-four pt-3">
					<div class="flex justify-between text-light-black">
						<dt>Monto a facturar</dt>
						<dd class="font-mono">{fmt(base)}</dd>
					</div>
					{#if volverAEmitir}
						<div class="flex justify-between text-light-black">
							<dt>
								Recargo IVA
								<span class="text-light-five">(ya cobrado, no se modifica)</span>
							</dt>
							<dd class="font-mono">+{fmt(venta.monto_recargo_iva || 0)}</dd>
						</div>
						<div class="flex items-end justify-between pt-1">
							<dt class="text-xs font-bold tracking-widest text-light-black uppercase">Total venta</dt>
							<dd class="font-mono text-2xl leading-none font-bold text-light-two">
								{fmt(venta.total)}
							</dd>
						</div>
					{:else}
						<div class="flex justify-between font-semibold text-emerald-700">
							<dt>Recargo IVA a cobrar</dt>
							<dd class="font-mono">+{fmt(montoRecargo)}</dd>
						</div>
						<div class="flex items-end justify-between pt-1">
							<dt class="text-xs font-bold tracking-widest text-light-black uppercase">Nuevo total</dt>
							<dd class="font-mono text-2xl leading-none font-bold text-light-two">
								{fmt(base + montoRecargo)}
							</dd>
						</div>
					{/if}
				</dl>
			{/if}
		</div>
	{/if}

	{#snippet footer()}
		<div class="flex justify-end gap-2">
			<Button variant="secondary" onclick={onClose} disabled={loading}>Cancelar</Button>
			<Button variant="primary" onclick={confirmar} disabled={!puedeFacturar} {loading}>
				{reemision ? 'Emitir nueva factura' : 'Emitir factura'}
			</Button>
		</div>
	{/snippet}
</Modal>
