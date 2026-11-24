<script lang="ts">
	import { SearchIcon, CheckCircleIcon } from '$lib/icons/outline';
	import { Button, Input } from '$lib/components/ui';
	import { TIPO_DOCUMENTO_IDENTIDAD_FACTURA } from '$lib/constants/dataFacturacion';
	import type { ClientePOS } from '$lib/interfaces/venta.interface';
	import type { ClienteFormState } from './ventas.svelte';
	import { PISTA, SEGMENTO, SEGMENTO_ACTIVO, SEGMENTO_INACTIVO, TITULO_SECCION } from './segmentos';

	interface Props {
		clienteActivo: boolean;
		clienteForm: ClienteFormState;
		clienteSeleccionado: ClientePOS | null;
		clienteEncontrado: boolean | null;
		buscandoCi: boolean;
		onBuscarCi: (ci: string) => Promise<void>;
		onSeleccionarPublicoGeneral: () => void;
		onNuevaBusqueda: () => void;
		onRegistrarNuevo: (datos: { ci?: string; nombre?: string }) => void;
	}

	let {
		clienteActivo,
		clienteForm = $bindable(),
		clienteSeleccionado,
		clienteEncontrado,
		buscandoCi,
		onBuscarCi,
		onSeleccionarPublicoGeneral,
		onNuevaBusqueda,
		onRegistrarNuevo
	}: Props = $props();

	const GENEROS = [
		{ id: 'M', label: 'Masc.' },
		{ id: 'F', label: 'Fem.' },
		{ id: 'O', label: 'Otro' }
	] as const;

	const CAMPO =
		'block h-9 w-full rounded-md border border-acero-200 bg-white pl-2 pr-7 text-sm text-acero-950 outline-none hover:border-acero-300 focus:border-acero-600 focus:ring-[3px] focus:ring-acero-200';

	type Modo = 'PUBLICO' | 'EXISTENTE' | 'NUEVO';
	let modo = $derived<Modo>(
		!clienteActivo ? 'PUBLICO' : clienteEncontrado === false ? 'NUEVO' : 'EXISTENTE'
	);

	let ciBusqueda = $state('');
	let ciBuscado = $derived(ciBusqueda.trim());

	let nombreCompleto = $derived(
		[clienteForm.nombre, clienteForm.apellido_paterno].filter(Boolean).join(' ')
	);

	let tipoDocumento = $derived(
		TIPO_DOCUMENTO_IDENTIDAD_FACTURA.find(
			(t) => t.codigoClasificador === clienteForm.tipo_documento
		)?.descripcion.split(' ')[0] ?? 'CI'
	);

	function cambiarModo(nuevo: Modo) {
		if (nuevo === modo) return;
		if (nuevo === 'PUBLICO') onSeleccionarPublicoGeneral();
		else if (nuevo === 'EXISTENTE') onNuevaBusqueda();
		else onRegistrarNuevo({});
	}
</script>

{#snippet etiqueta(texto: string, para: string, requerido: boolean)}
	<label for={para} class="mb-1 block truncate text-xs font-medium text-acero-700">
		{texto}{#if requerido}<span class="text-marca" aria-hidden="true"> *</span>{/if}
	</label>
{/snippet}

<section class="space-y-2.5" aria-labelledby="pos-cliente">
	<h3 id="pos-cliente" class={TITULO_SECCION}>Cliente</h3>

	<div class="{PISTA} grid-cols-3" role="radiogroup" aria-labelledby="pos-cliente">
		{#each [['PUBLICO', 'Sin cliente'], ['EXISTENTE', 'Buscar'], ['NUEVO', 'Nuevo']] as const as [id, label] (id)}
			<button
				type="button"
				role="radio"
				aria-checked={modo === id}
				onclick={() => cambiarModo(id)}
				class="{SEGMENTO} {modo === id ? SEGMENTO_ACTIVO : SEGMENTO_INACTIVO}"
			>
				{label}
			</button>
		{/each}
	</div>

	{#if modo === 'PUBLICO'}
		<p class="text-sm text-acero-500">Venta a público general, sin datos del cliente.</p>
	{:else if modo === 'EXISTENTE' && clienteEncontrado}
		<!-- Cliente asignado -->
		<div class="flex items-center gap-2.5 rounded-lg border border-ok/25 bg-ok-tinte px-3 py-2">
			<CheckCircleIcon class="h-5 w-5 shrink-0 text-ok" />
			<div class="min-w-0 flex-1 leading-tight">
				<p class="truncate text-sm font-semibold text-acero-950">{nombreCompleto}</p>
				<p class="truncate text-xs text-acero-600">
					<span class="tabular-nums">
						{tipoDocumento}
						{clienteForm.ci}{clienteForm.complemento ? `-${clienteForm.complemento}` : ''}
					</span>
					{#if clienteForm.telefono}· Tel. {clienteForm.telefono}{/if}
					{#if clienteSeleccionado?.puntos}· {clienteSeleccionado.puntos} puntos{/if}
				</p>
			</div>
			<button
				type="button"
				onclick={onNuevaBusqueda}
				class="shrink-0 rounded px-1 text-sm font-semibold text-acero-700 underline-offset-2 hover:text-acero-950 hover:underline"
			>
				Cambiar
			</button>
		</div>
	{:else if modo === 'EXISTENTE'}
		<!-- Búsqueda exacta por CI o NIT: si no existe se pasa a registrarlo -->
		<form
			class="flex gap-1.5"
			onsubmit={(e) => {
				e.preventDefault();
				if (ciBuscado && !buscandoCi) onBuscarCi(ciBuscado);
			}}
		>
			<div class="flex-1">
				<Input
					size="sm"
					icon={SearchIcon}
					aria-label="CI o NIT del cliente"
					placeholder="CI o NIT del cliente"
					inputmode="numeric"
					bind:value={ciBusqueda}
					autocomplete="off"
					autofocus
				/>
			</div>
			<Button type="submit" size="sm" variant="primary" loading={buscandoCi} disabled={!ciBuscado}>
				Buscar
			</Button>
		</form>
		<p class="text-xs text-acero-500">
			Si el CI o NIT no está registrado, podrá registrarlo junto con la venta.
		</p>
	{:else}
		<!-- Cliente nuevo: se registra junto con la venta -->
		<div class="grid grid-cols-6 gap-x-2 gap-y-2">
			<div class="col-span-3">
				{@render etiqueta('CI o NIT', 'cliente-ci', true)}
				<Input id="cliente-ci" size="sm" bind:value={clienteForm.ci} autocomplete="off" />
			</div>
			<div class="col-span-2">
				{@render etiqueta('Tipo doc.', 'cliente-tipo-documento', true)}
				<select
					id="cliente-tipo-documento"
					bind:value={clienteForm.tipo_documento}
					class={CAMPO}
					title={TIPO_DOCUMENTO_IDENTIDAD_FACTURA.find(
						(t) => t.codigoClasificador === clienteForm.tipo_documento
					)?.descripcion}
				>
					{#each TIPO_DOCUMENTO_IDENTIDAD_FACTURA as t (t.codigoClasificador)}
						<option value={t.codigoClasificador}>{t.descripcion.split(' ')[0]}</option>
					{/each}
				</select>
			</div>
			<div class="col-span-1">
				{@render etiqueta('Compl.', 'cliente-complemento', false)}
				<Input
					id="cliente-complemento"
					size="sm"
					maxlength={5}
					bind:value={clienteForm.complemento}
				/>
			</div>

			<div class="col-span-3">
				{@render etiqueta('Nombre / Razón social', 'cliente-nombre', true)}
				<Input id="cliente-nombre" size="sm" bind:value={clienteForm.nombre} />
			</div>
			<div class="col-span-3">
				{@render etiqueta('Apellidos', 'cliente-apellidos', false)}
				<Input id="cliente-apellidos" size="sm" bind:value={clienteForm.apellido_paterno} />
			</div>

			<div class="col-span-3">
				<p class="mb-1 block truncate text-xs font-medium text-acero-700">
					Género<span class="text-marca" aria-hidden="true"> *</span>
				</p>
				<div
					id="cliente-genero"
					class="{PISTA} h-9 grid-cols-3"
					role="radiogroup"
					aria-label="Género"
				>
					{#each GENEROS as g (g.id)}
						<button
							type="button"
							role="radio"
							aria-checked={clienteForm.genero === g.id}
							onclick={() => (clienteForm.genero = g.id)}
							class="{SEGMENTO} px-1 py-0 text-xs {clienteForm.genero === g.id
								? SEGMENTO_ACTIVO
								: SEGMENTO_INACTIVO}"
						>
							{g.label}
						</button>
					{/each}
				</div>
			</div>
			<div class="col-span-3">
				{@render etiqueta('Teléfono', 'cliente-telefono', true)}
				<Input id="cliente-telefono" type="tel" size="sm" bind:value={clienteForm.telefono} />
			</div>
		</div>
	{/if}
</section>
