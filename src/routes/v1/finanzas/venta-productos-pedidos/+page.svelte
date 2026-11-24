<script lang="ts">
	import { MainLayout } from '$lib/components/layout';
	import {
		AperturaCajaModal,
		CierreCajaModal,
		SesionHeader,
		ProductSearchControl,
		ProductResultDropdown,
		CartTable,
		VentaPanel,
		ReciboModal,
		CantidadManualModal,
		VentasState
	} from '$lib/components/features/puntoventas/ventas';
	import { LoaderIcon } from '$lib/icons/outline';

	const pos = new VentasState();
</script>

<!-- F2 cobra la venta; Escape cierra búsquedas y modales del POS -->
<svelte:window onkeydown={(e) => pos.handleGlobalKeydown(e)} />

{#if pos.cargandoSesion}
	<div class="flex h-full items-center justify-center gap-3 text-acero-500" role="status">
		<LoaderIcon class="size-5 animate-spin" />
		<span>Revisando el estado de la caja</span>
	</div>
{/if}

{#if pos.modalApertura && !pos.cargandoSesion}
	<AperturaCajaModal
		bind:montoApertura={pos.montoApertura}
		guardandoCaja={pos.guardandoCaja}
		onAbrirCaja={() => pos.abrirCaja()}
	/>
{/if}

{#if !pos.cargandoSesion && pos.sesionActiva}
	<MainLayout
		title="Nueva venta · Lubricantes Yolanda"
		description="Punto de venta de Lubricantes Yolanda."
		class="flex min-h-full flex-col lg:h-full"
	>
		<SesionHeader
			sesionActiva={pos.sesionActiva}
			horaActual={pos.horaActual}
			onAbrirModalCierre={() => pos.abrirModalCierre()}
			fmt={pos.fmt}
		/>

		<div class="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
			<!-- Productos: búsqueda + carrito -->
			<div class="flex min-h-[24rem] min-w-0 flex-1 flex-col gap-3">
				<ProductSearchControl
					bind:modoBusqueda={pos.modoBusqueda}
					busqueda={pos.busqueda}
					buscando={pos.buscando}
					onModoBusqueda={(modo) => {
						pos.modoBusqueda = modo;
						pos.busqueda = '';
						if (modo === 'TEXTO') pos.buscarProductos('');
						else pos.productos = [];
						pos.mostrarDropdown = modo === 'TEXTO';
						document.getElementById('scan-input')?.focus();
					}}
					onBusqueda={(e) => pos.onBusqueda(e)}
					onBarcode={(e) => pos.onBarcode(e)}
					onIrACobrar={() => pos.finalizarVenta()}
					setMostrarDropdown={(val) => (pos.mostrarDropdown = val)}
				>
					{#if pos.modoBusqueda === 'TEXTO' && pos.mostrarDropdown}
						<ProductResultDropdown
							buscando={pos.buscando}
							productos={pos.productos}
							onAgregarAlCarrito={(p, id) => {
								pos.agregarAlCarrito(p, id);
								document.getElementById('scan-input')?.focus();
							}}
							onCerrar={() => (pos.mostrarDropdown = false)}
							fmt={pos.fmt}
						/>
					{/if}
				</ProductSearchControl>

				<CartTable
					carrito={pos.carrito}
					itemRecienAgregado={pos.itemRecienAgregado}
					onCambiarCantidad={(id, d) => pos.cambiarCantidad(id, d)}
					onSetCantidad={(id, n) => pos.setCantidad(id, n)}
					onEliminarItem={(id) => pos.eliminarItem(id)}
					onSetDescuentoItem={(id, m) => pos.setDescuentoItem(id, m)}
					onActualizarSerie={(id, s) => pos.actualizarSerie(id, s)}
					fmt={pos.fmt}
				/>
			</div>

			<!-- Configuración y cobro de la venta -->
			<VentaPanel {pos} />
		</div>
	</MainLayout>
{/if}

{#if pos.modalCantidad && pos.pendingProduct}
	<CantidadManualModal
		pendingProduct={pos.pendingProduct}
		bind:cantidadManual={pos.cantidadManual}
		onCerrar={() => (pos.modalCantidad = false)}
		onConfirmar={() => pos.confirmarCantidadManual()}
	/>
{/if}

{#if pos.modalRecibo && pos.ultimaVenta}
	<ReciboModal
		ultimaVenta={pos.ultimaVenta}
		onCerrar={() => {
			pos.modalRecibo = false;
			setTimeout(() => document.getElementById('scan-input')?.focus(), 0);
		}}
		onImprimir={() => window.print()}
		fmt={pos.fmt}
		fmtDate={pos.fmtDate}
		fmtPrec={pos.fmtPrec}
	/>
{/if}

{#if pos.modalCierre}
	<CierreCajaModal
		sesionActiva={pos.sesionActiva}
		bind:montoCierre={pos.montoCierre}
		cargandoCierre={pos.cargandoCierre}
		resumenCierrePrevio={pos.resumenCierrePrevio}
		guardandoCaja={pos.guardandoCaja}
		onCerrar={() => (pos.modalCierre = false)}
		onCerrarCaja={() => pos.cerrarCaja()}
		fmt={pos.fmt}
	/>
{/if}
