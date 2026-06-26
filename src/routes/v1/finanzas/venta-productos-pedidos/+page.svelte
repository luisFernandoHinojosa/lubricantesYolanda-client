<script lang="ts">
	import { MainLayout } from '$lib/components/layout';
	import {
		AperturaCajaModal,
		CierreCajaModal,
		SesionHeader,
		ProductSearchControl,
		ProductResultDropdown,
		CartTable,
		SalesSummaryPanel,
		PagoModal,
		ReciboModal,
		ClienteModal,
		DescuentoModal,
		CantidadManualModal,
		VentasState
	} from '$lib/components/features/puntoventas/ventas';

	const pos = new VentasState();
	//console.log('pos', pos.carrito);
</script>

{#if pos.modalApertura && !pos.cargandoSesion}
	<AperturaCajaModal
		bind:montoApertura={pos.montoApertura}
		guardandoCaja={pos.guardandoCaja}
		onAbrirCaja={() => pos.abrirCaja()}
	/>
{/if}

{#if !pos.cargandoSesion && pos.sesionActiva}
	<MainLayout
		title="Venta de productos pedidos"
		description="Realiza ventas de productos pedidos."
		class="container mx-auto flex h-full flex-col"
	>
		<SesionHeader
			sesionActiva={pos.sesionActiva}
			horaActual={pos.horaActual}
			onAbrirModalCierre={() => pos.abrirModalCierre()}
			fmt={pos.fmt}
		/>

		<ProductSearchControl
			bind:modoBusqueda={pos.modoBusqueda}
			busqueda={pos.busqueda}
			buscando={pos.buscando}
			onModoBusqueda={(modo) => {
				pos.modoBusqueda = modo;
				pos.busqueda = '';
				if (modo === 'TEXTO') pos.buscarProductos('');
				else pos.productos = [];
				pos.mostrarDropdown = false;
				document.getElementById('scan-input')?.focus();
			}}
			onBusqueda={(e) => pos.onBusqueda(e)}
			onBarcode={(e) => pos.onBarcode(e)}
			onIrACobrar={() => pos.irACobrar()}
			setMostrarDropdown={(val) => (pos.mostrarDropdown = val)}
		>
			{#if pos.modoBusqueda === 'TEXTO' && pos.mostrarDropdown}
				<ProductResultDropdown
					buscando={pos.buscando}
					productos={pos.productos}
					onAgregarAlCarrito={(p, id) => pos.agregarAlCarrito(p, id)}
					fmt={pos.fmt}
				/>
			{/if}
		</ProductSearchControl>

		<div class="flex min-h-0 flex-1">
			<CartTable
				carrito={pos.carrito}
				itemRecienAgregado={pos.itemRecienAgregado}
				subtotalItems={pos.subtotalItems}
				montoDescuentoGlobal={pos.montoDescuentoGlobal()}
				onCambiarCantidad={(id, d) => pos.cambiarCantidad(id, d)}
				onSetCantidad={(id, n) => pos.setCantidad(id, n)}
				onEliminarItem={(id) => pos.eliminarItem(id)}
				onAbrirDescuento={(t) => pos.abrirDescuento(t)}
				onQuitarDescuentoItem={(id) => pos.quitarDescuentoItem(id)}
				onActualizarSerie={(id, s) => pos.actualizarSerie(id, s)}
				fmt={pos.fmt}
			/>

			<SalesSummaryPanel
				carrito={pos.carrito}
				clienteSeleccionado={pos.clienteSeleccionado}
				montoDescuentoGlobal={pos.montoDescuentoGlobal()}
				totalFinal={pos.totalFinal}
				onAbrirCliente={() => (pos.modalCliente = true)}
				onAbrirDescuento={(t) => pos.abrirDescuento(t)}
				onQuitarDescuentoGlobal={() => pos.quitarDescuentoGlobal()}
				onIrACobrar={() => pos.irACobrar()}
				fmt={pos.fmt}
			/>
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

{#if pos.modalPago}
	<PagoModal
		totalFinal={pos.totalFinal}
		metodoPago={pos.metodoPago}
		bind:montoPagado={pos.montoPagado}
		bind:notasVenta={pos.notasVenta}
		procesandoVenta={pos.procesandoVenta}
		pagoSuficiente={pos.pagoSuficiente}
		cambio={pos.cambio}
		onCerrar={() => (pos.modalPago = false)}
		onCambiarMetodo={(m) => (pos.metodoPago = m)}
		onFinalizarVenta={() => pos.finalizarVenta()}
		fmt={pos.fmt}
	/>
{/if}

{#if pos.modalRecibo && pos.ultimaVenta}
	<ReciboModal
		ultimaVenta={pos.ultimaVenta}
		onCerrar={() => (pos.modalRecibo = false)}
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

{#if pos.modalCliente}
	<ClienteModal
		clienteSeleccionado={pos.clienteSeleccionado}
		bind:busquedaCliente={pos.busquedaCliente}
		buscandoCliente={pos.buscandoCliente}
		resultadosCliente={pos.resultadosCliente}
		onCerrar={() => (pos.modalCliente = false)}
		onSeleccionarCliente={(c) => {
			pos.clienteSeleccionado = c;
			pos.modalCliente = false;
		}}
		onBusquedaCliente={(e) => pos.onBusquedaCliente(e)}
	/>
{/if}

{#if pos.modalDescuento}
	<DescuentoModal
		descuentoTarget={pos.descuentoTarget}
		descuentoTipo={pos.descuentoTipo}
		bind:descuentoValor={pos.descuentoValor}
		onCerrar={() => (pos.modalDescuento = false)}
		onAplicarDescuento={() => pos.aplicarDescuento()}
		onCambiarTipo={(tipo) => {
			pos.descuentoTipo = tipo;
			pos.descuentoValor = 0;
		}}
	/>
{/if}
