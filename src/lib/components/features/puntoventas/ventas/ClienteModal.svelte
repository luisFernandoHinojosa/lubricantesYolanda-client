<script lang="ts">
	import { fade, scale, slide } from 'svelte/transition';
	import {
		UserIcon,
		SearchIcon,
		CheckCircleIcon,
		XIcon,
		FileDescriptionIcon,
		AlertTriangleIcon,
		SparklesIcon,
		LoaderIcon,
		CopyIcon,
		CheckIcon,
		UsersIcon
	} from '$lib/icons/outline';
	import { Button, Input, Select } from '$lib/components/ui';
	import { TIPO_DOCUMENTO_IDENTIDAD_FACTURA } from '$lib/constants/dataFacturacion';
	import type { ClientePOS, DatosFacturacionDto } from '$lib/interfaces/venta.interface';

	interface ClienteFormState {
		ci: string;
		nombre: string;
		apellido_paterno: string;
		apellido_materno: string;
		fecha_nacimiento: string;
		telefono: string;
		correo_electronico: string;
		genero: 'M' | 'F' | 'O';
	}

	interface Props {
		clienteActivo: boolean;
		clienteSeleccionado: ClientePOS | null;
		clienteForm: ClienteFormState;
		clienteEncontrado: boolean | null;
		buscandoCi: boolean;
		facturar: boolean;
		datosFacturacion: DatosFacturacionDto;
		busquedaCliente: string;
		buscandoCliente: boolean;
		resultadosCliente: ClientePOS[];
		onCerrar: () => void;
		onBuscarCi: (ci: string) => Promise<void>;
		onSeleccionarPublicoGeneral: () => void;
		onSeleccionarClienteDeBusqueda: (c: ClientePOS) => void;
		onBusquedaCliente: (e: Event) => void;
	}

	let {
		clienteActivo = $bindable(),
		clienteSeleccionado,
		clienteForm = $bindable(),
		clienteEncontrado,
		buscandoCi,
		facturar = $bindable(),
		datosFacturacion = $bindable(),
		busquedaCliente = $bindable(),
		buscandoCliente,
		resultadosCliente,
		onCerrar,
		onBuscarCi,
		onSeleccionarPublicoGeneral,
		onSeleccionarClienteDeBusqueda,
		onBusquedaCliente
	}: Props = $props();

	let ciInputTemp = $state(clienteForm.ci || '');
	let mostrarCatalogo = $state(false);

	// Sincronizar input temporal con el form
	$effect(() => {
		if (clienteForm.ci && clienteForm.ci !== ciInputTemp) {
			ciInputTemp = clienteForm.ci;
		}
	});

	function handleBuscarCi() {
		if (!ciInputTemp.trim()) return;
		clienteForm.ci = ciInputTemp.trim();
		onBuscarCi(ciInputTemp.trim());
	}

	function handleKeydownCi(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleBuscarCi();
		}
	}

	function copiarNombreARazonSocial() {
		const nombreCompleto = [
			clienteForm.nombre,
			clienteForm.apellido_paterno,
			clienteForm.apellido_materno
		]
			.filter(Boolean)
			.join(' ')
			.trim();
		if (nombreCompleto) {
			datosFacturacion.razonSocial = nombreCompleto;
		}
	}

	function copiarCiANumeroDoc() {
		if (clienteForm.ci) {
			datosFacturacion.numeroDocumento = clienteForm.ci;
		}
	}

	function elegirPublicoGeneral() {
		onSeleccionarPublicoGeneral();
		ciInputTemp = '';
	}

	function setGenero(g: 'M' | 'F' | 'O') {
		clienteForm.genero = g;
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-md"
	transition:fade={{ duration: 150 }}
>
	<div
		class="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-light-four bg-light-one shadow-2xl"
		transition:scale={{ duration: 200 }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-light-four px-6 py-4 bg-light-one_d/50 shrink-0">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-light-two text-light-one shadow-sm">
					<UserIcon class="h-5 w-5" />
				</div>
				<div>
					<h3 class="text-base font-bold text-light-black">Cliente y Facturación</h3>
					<p class="text-xs text-light-five">Identificación del cliente y emisión fiscal SIAT</p>
				</div>
			</div>
			<Button onclick={onCerrar} variant="ghost" size="xs">
				<XIcon class="h-5 w-5" />
			</Button>
		</div>

		<!-- Body Scrollable -->
		<div class="flex-1 overflow-y-auto p-6 space-y-6">

			<!-- Selector Principal: Público General vs Cliente Registrado/Nuevo -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<button
					type="button"
					onclick={elegirPublicoGeneral}
					class="flex items-center gap-3 rounded-2xl border p-4 text-left transition-all {!clienteActivo
						? 'border-light-two bg-light-two/10 shadow-sm ring-1 ring-light-two'
						: 'border-light-four bg-light-one hover:border-light-two_d hover:bg-light-one_d'}"
				>
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl {!clienteActivo
							? 'bg-light-two text-light-one'
							: 'bg-light-four text-light-five'}"
					>
						<UserIcon class="h-5 w-5" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-sm font-bold text-light-black">Público General</p>
						<p class="text-xs text-light-five truncate">Sin cliente / Consumidor final</p>
					</div>
					{#if !clienteActivo}
						<CheckCircleIcon class="h-5 w-5 shrink-0 text-light-two" />
					{/if}
				</button>

				<button
					type="button"
					onclick={() => {
						clienteActivo = true;
					}}
					class="flex items-center gap-3 rounded-2xl border p-4 text-left transition-all {clienteActivo
						? 'border-light-two bg-light-two/10 shadow-sm ring-1 ring-light-two'
						: 'border-light-four bg-light-one hover:border-light-two_d hover:bg-light-one_d'}"
				>
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl {clienteActivo
							? 'bg-light-two text-light-one'
							: 'bg-light-four text-light-five'}"
					>
						<SparklesIcon class="h-5 w-5" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-sm font-bold text-light-black">Cliente con Datos</p>
						<p class="text-xs text-light-five truncate">Buscar por CI o nuevo registro</p>
					</div>
					{#if clienteActivo}
						<CheckCircleIcon class="h-5 w-5 shrink-0 text-light-two" />
					{/if}
				</button>
			</div>

			<!-- Switch de Facturación SIAT -->
			<div
				class="rounded-2xl border transition-all p-4 {facturar
					? 'border-emerald-300 bg-emerald-50/70 shadow-sm'
					: 'border-light-four bg-light-one_d/30'}"
			>
				<div class="flex items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<div
							class="flex h-9 w-9 items-center justify-center rounded-xl {facturar
								? 'bg-emerald-600 text-white'
								: 'bg-light-four text-light-five'}"
						>
							<FileDescriptionIcon class="h-5 w-5" />
						</div>
						<div>
							<div class="flex items-center gap-2">
								<span class="text-sm font-bold text-light-black">Emitir Factura Electrónica</span>
								{#if facturar}
									<span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
										SIAT en Línea
									</span>
								{/if}
							</div>
							<p class="text-xs text-light-five">
								{facturar
									? 'Se generará la factura con CUF y código QR oficial de Impuestos Nacionales'
									: 'La venta se registrará como recibo simple de caja sin efectos tributarios'}
							</p>
						</div>
					</div>

					<!-- Toggle Switch -->
					<label class="relative inline-flex cursor-pointer items-center shrink-0">
						<input
							type="checkbox"
							checked={facturar}
							onchange={(e) => {
								facturar = (e.currentTarget as HTMLInputElement).checked;
								if (facturar) {
									if (!datosFacturacion.numeroDocumento && clienteForm.ci) {
										datosFacturacion.numeroDocumento = clienteForm.ci;
									}
									if (!datosFacturacion.razonSocial && clienteForm.nombre) {
										copiarNombreARazonSocial();
									}
								}
							}}
							class="peer sr-only"
						/>
						<div
							class="peer h-7 w-12 rounded-full bg-light-four transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-5"
						></div>
					</label>
				</div>
			</div>

			<!-- Búsqueda y Datos del Cliente (Si clienteActivo está habilitado) -->
			{#if clienteActivo}
				<div class="space-y-4" transition:slide={{ duration: 180 }}>
					<!-- Input de Búsqueda de CI / NIT -->
					<div>
						<label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-light-black">
							CI o NIT del Cliente (Búsqueda Rápida)
						</label>
						<div class="flex gap-2">
							<div class="relative flex-1">
								<input
									type="text"
									bind:value={ciInputTemp}
									onkeydown={handleKeydownCi}
									placeholder="Ingrese CI o NIT y presione Enter..."
									class="block h-11 w-full rounded-xl border border-light-four bg-white px-4 text-sm font-mono text-light-black outline-none placeholder:text-light-five focus:border-light-two focus:ring-2 focus:ring-light-two/20"
								/>
								{#if ciInputTemp}
									<button
										type="button"
										onclick={() => (ciInputTemp = '')}
										class="absolute right-3 top-1/2 -translate-y-1/2 text-light-five hover:text-light-black"
									>
										<XIcon class="h-4 w-4" />
									</button>
								{/if}
							</div>
							<Button
								type="button"
								variant="primary"
								onclick={handleBuscarCi}
								disabled={buscandoCi || !ciInputTemp.trim()}
								loading={buscandoCi}
							>
								{#snippet leftIcon()}
									<SearchIcon class="h-4 w-4" />
								{/snippet}
								Buscar CI
							</Button>
						</div>
					</div>

					<!-- Estado de la Búsqueda / Feedback -->
					{#if clienteEncontrado === true}
						<div
							class="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-900"
							transition:slide={{ duration: 150 }}
						>
							<CheckCircleIcon class="h-5 w-5 shrink-0 text-emerald-600" />
							<div class="min-w-0 flex-1">
								<p class="text-sm font-bold">Cliente existente encontrado</p>
								<p class="text-xs text-emerald-700 truncate">
									{clienteForm.nombre} {clienteForm.apellido_paterno} {clienteForm.apellido_materno} • CI: {clienteForm.ci}
								</p>
							</div>
							{#if clienteSeleccionado?.puntos}
								<span class="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shrink-0">
									⭐ {clienteSeleccionado.puntos} pts
								</span>
							{/if}
						</div>
					{:else if clienteEncontrado === false}
						<div
							class="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-amber-900"
							transition:slide={{ duration: 150 }}
						>
							<SparklesIcon class="h-5 w-5 shrink-0 text-amber-600" />
							<div class="min-w-0 flex-1">
								<p class="text-sm font-bold">Cliente no encontrado (Registro automático)</p>
								<p class="text-xs text-amber-700">
									Complete los datos a continuación; se creará el cliente automáticamente con la venta.
								</p>
							</div>
						</div>
					{/if}

					<!-- Formulario de Datos Personales del Cliente -->
					<div class="rounded-2xl border border-light-four bg-white p-4 shadow-sm space-y-4">
						<div class="flex items-center justify-between border-b border-light-four pb-2.5">
							<h4 class="text-xs font-bold uppercase tracking-wider text-light-black">
								Datos Personales del Cliente
							</h4>
							<button
								type="button"
								onclick={() => (mostrarCatalogo = !mostrarCatalogo)}
								class="text-xs font-semibold text-light-two hover:underline flex items-center gap-1"
							>
								<UsersIcon class="h-3.5 w-3.5" />
								{mostrarCatalogo ? 'Ocultar catálogo' : 'Buscar por nombre en lista'}
							</button>
						</div>

						<!-- Lista desplegable si el usuario desea buscar por nombre -->
						{#if mostrarCatalogo}
							<div class="rounded-xl border border-light-four bg-light-one_d/50 p-3 space-y-2" transition:slide>
								<Input
									placeholder="Escriba nombre o apellido para filtrar..."
									value={busquedaCliente}
									oninput={onBusquedaCliente}
									icon={SearchIcon}
									size="sm"
								/>
								<div class="max-h-36 overflow-y-auto space-y-1">
									{#if buscandoCliente}
										<p class="text-center text-xs text-light-five py-2">Buscando...</p>
									{:else if resultadosCliente.length === 0 && busquedaCliente}
										<p class="text-center text-xs text-light-five py-2">No se encontraron clientes</p>
									{:else}
										{#each resultadosCliente as c (c.id)}
											<button
												type="button"
												onclick={() => {
													onSeleccionarClienteDeBusqueda(c);
													ciInputTemp = c.ci;
													mostrarCatalogo = false;
												}}
												class="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs hover:bg-light-two/10 hover:text-light-two transition"
											>
												<span class="font-bold">{c.nombre} {c.apellido_paterno}</span>
												<span class="font-mono text-light-five">CI: {c.ci}</span>
											</button>
										{/each}
									{/if}
								</div>
							</div>
						{/if}

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Input
								label="CI / NIT"
								bind:value={clienteForm.ci}
								required
								placeholder="Ej: 8765432"
								size="sm"
							/>
							<Input
								label="Nombre(s)"
								bind:value={clienteForm.nombre}
								required
								placeholder="Ej: María"
								size="sm"
							/>
							<Input
								label="Apellido Paterno"
								bind:value={clienteForm.apellido_paterno}
								placeholder="Ej: Gómez (opcional)"
								size="sm"
							/>
							<Input
								label="Apellido Materno"
								bind:value={clienteForm.apellido_materno}
								placeholder="Ej: López (opcional)"
								size="sm"
							/>
							<Input
								label="Teléfono / WhatsApp"
								bind:value={clienteForm.telefono}
								placeholder="Ej: 76543210 (opcional)"
								size="sm"
							/>
							<Input
								type="email"
								label="Correo Electrónico"
								bind:value={clienteForm.correo_electronico}
								placeholder="maria@ejemplo.com (opcional)"
								size="sm"
							/>
						</div>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
							<div>
								<label class="block text-xs font-medium text-light-black mb-1">
									Género
								</label>
								<div class="flex gap-1.5">
									{#each [{ id: 'M', label: 'Masc.' }, { id: 'F', label: 'Fem.' }, { id: 'O', label: 'Otro' }] as gen}
										<button
											type="button"
											onclick={() => setGenero(gen.id as any)}
											class="flex-1 py-1.5 text-xs font-bold rounded-lg border transition {clienteForm.genero === gen.id
												? 'border-light-two bg-light-two text-white'
												: 'border-light-four bg-light-one text-light-five hover:bg-light-one_d'}"
										>
											{gen.label}
										</button>
									{/each}
								</div>
							</div>
							<div>
								<label class="block text-xs font-medium text-light-black mb-1">
									Fecha de Nacimiento
								</label>
								<input
									type="date"
									bind:value={clienteForm.fecha_nacimiento}
									class="block h-9 w-full rounded-xl border border-light-four bg-light-one px-3 text-xs text-light-black outline-none focus:border-light-two focus:ring-1 focus:ring-light-two"
								/>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Sección de Facturación SIAT -->
			{#if facturar}
				<div
					class="rounded-2xl border border-emerald-300 bg-white p-4 shadow-sm space-y-4"
					transition:slide={{ duration: 180 }}
				>
					<div class="flex items-center justify-between border-b border-emerald-100 pb-2.5">
						<div class="flex items-center gap-2">
							<FileDescriptionIcon class="h-4 w-4 text-emerald-600" />
							<h4 class="text-xs font-bold uppercase tracking-wider text-emerald-950">
								Datos para la Factura (SIAT)
							</h4>
						</div>
						<span class="text-[11px] font-semibold text-emerald-700">Obligatorio para emitir factura</span>
					</div>

					<!-- Tipo de Documento -->
					<div>
						<label class="block text-xs font-bold uppercase tracking-wider text-light-black mb-1.5">
							Tipo de Documento de Identidad *
						</label>
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
							{#each TIPO_DOCUMENTO_IDENTIDAD_FACTURA as tipoDoc (tipoDoc.codigoClasificador)}
								<button
									type="button"
									onclick={() => (datosFacturacion.tipoDocumento = tipoDoc.codigoClasificador)}
									class="py-2 px-3 text-xs font-bold rounded-lg border transition text-left leading-tight {datosFacturacion.tipoDocumento === tipoDoc.codigoClasificador
										? 'border-emerald-600 bg-emerald-600 text-white'
										: 'border-light-four bg-light-one text-light-black hover:border-emerald-400'}"
								>
									{tipoDoc.descripcion}
								</button>
							{/each}
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<div class="flex items-center justify-between mb-1">
								<label class="text-xs font-medium text-light-black">
									Número de Documento (NIT / CI) <span class="text-red-500">*</span>
								</label>
								{#if clienteForm.ci && datosFacturacion.numeroDocumento !== clienteForm.ci}
									<button
										type="button"
										onclick={copiarCiANumeroDoc}
										class="text-[11px] text-emerald-700 hover:underline flex items-center gap-0.5"
									>
										<CopyIcon class="h-3 w-3" /> Usar CI del cliente
									</button>
								{/if}
							</div>
							<Input
								bind:value={datosFacturacion.numeroDocumento}
								placeholder="Ej: 1020304050"
								size="sm"
								required
							/>
						</div>

						<div>
							<div class="flex items-center justify-between mb-1">
								<label class="text-xs font-medium text-light-black">
									Razón Social <span class="text-red-500">*</span>
								</label>
								{#if clienteForm.nombre}
									<button
										type="button"
										onclick={copiarNombreARazonSocial}
										class="text-[11px] text-emerald-700 hover:underline flex items-center gap-0.5"
									>
										<CopyIcon class="h-3 w-3" /> Usar nombre
									</button>
								{/if}
							</div>
							<Input
								bind:value={datosFacturacion.razonSocial}
								placeholder="Ej: Industrias XYZ o Carlos Pérez"
								size="sm"
								required
							/>
						</div>
					</div>
				</div>
			{/if}

		</div>

		<!-- Footer -->
		<div class="flex items-center justify-between border-t border-light-four px-6 py-4 bg-light-one_d/30 shrink-0">
			{#if clienteActivo}
				<Button type="button" variant="ghost" onclick={elegirPublicoGeneral} size="sm">
					Quitar Cliente
				</Button>
			{:else}
				<span class="text-xs text-light-five">Venta a Público General</span>
			{/if}

			<div class="flex items-center gap-2">
				<Button type="button" variant="ghost" onclick={onCerrar} size="sm">
					Cancelar
				</Button>
				<Button
					type="button"
					variant="primary"
					onclick={() => {
						// Si activó facturación y dejó vacíos los datos, copiar automáticamente
						if (facturar) {
							if (!datosFacturacion.numeroDocumento && clienteForm.ci) {
								datosFacturacion.numeroDocumento = clienteForm.ci;
							}
							if (!datosFacturacion.razonSocial && clienteForm.nombre) {
								copiarNombreARazonSocial();
							}
						}
						onCerrar();
					}}
					size="md"
				>
					{#snippet leftIcon()}
						<CheckIcon class="h-4 w-4" />
					{/snippet}
					Aplicar y Continuar
				</Button>
			</div>
		</div>
	</div>
</div>
