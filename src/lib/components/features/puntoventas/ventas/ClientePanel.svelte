<script lang="ts">
	import { SearchIcon, CheckCircleIcon } from '$lib/icons/outline';
	import { Button, Input } from '$lib/components/ui';
	import { TIPO_DOCUMENTO_IDENTIDAD_FACTURA } from '$lib/constants/dataFacturacion';
	import type { ClientePOS } from '$lib/interfaces/venta.interface';
	import type { ClienteFormState } from './ventas.svelte';

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

	const SEGMENTO_ACTIVO = 'bg-light-two text-light-one shadow-sm';
	const SEGMENTO_INACTIVO = 'text-light-five hover:bg-light-one hover:text-light-black';
	const CAMPO =
		'block h-8 w-full rounded-lg border border-light-four bg-light-one px-2 text-xs text-black outline-none transition-all hover:ring-1 hover:ring-light-two_d focus:ring-2 focus:ring-light-three';

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
		TIPO_DOCUMENTO_IDENTIDAD_FACTURA.find((t) => t.codigoClasificador === clienteForm.tipo_documento)
			?.descripcion.split(' ')[0] ?? 'CI'
	);

	function cambiarModo(nuevo: Modo) {
		if (nuevo === modo) return;
		if (nuevo === 'PUBLICO') onSeleccionarPublicoGeneral();
		else if (nuevo === 'EXISTENTE') onNuevaBusqueda();
		else onRegistrarNuevo({});
	}

</script>

{#snippet etiqueta(texto: string, para: string, requerido: boolean)}
	<label for={para} class="mb-0.5 block truncate text-[11px] font-semibold text-light-black">
		{texto}{#if requerido}<span class="text-red-500"> *</span>{/if}
	</label>
{/snippet}

<section class="space-y-2.5">
	<h3 class="text-[11px] font-bold tracking-widest text-light-five uppercase">Cliente</h3>

	<div class="grid grid-cols-3 gap-1 rounded-xl bg-light-one_d p-1">
		{#each [['PUBLICO', 'Público general'], ['EXISTENTE', 'Buscar cliente'], ['NUEVO', 'Nuevo cliente']] as const as [id, label] (id)}
			<button
				type="button"
				onclick={() => cambiarModo(id)}
				class="rounded-lg py-1.5 text-xs font-bold transition {modo === id
					? SEGMENTO_ACTIVO
					: SEGMENTO_INACTIVO}"
			>
				{label}
			</button>
		{/each}
	</div>

	{#if modo === 'PUBLICO'}
		<p class="text-xs text-light-five">Venta sin cliente, a consumidor final.</p>
	{:else if modo === 'EXISTENTE' && clienteEncontrado}
		<!-- Cliente asignado -->
		<div class="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
			<CheckCircleIcon class="h-5 w-5 shrink-0 text-emerald-600" />
			<div class="min-w-0 flex-1 leading-tight">
				<p class="truncate text-sm font-bold text-emerald-950">{nombreCompleto}</p>
				<p class="truncate text-xs text-emerald-800">
					<span class="font-mono">
						{tipoDocumento}
						{clienteForm.ci}{clienteForm.complemento ? `-${clienteForm.complemento}` : ''}
					</span>
					{#if clienteForm.telefono}· Tel. {clienteForm.telefono}{/if}
					{#if clienteSeleccionado?.puntos}· ⭐ {clienteSeleccionado.puntos} pts{/if}
				</p>
			</div>
			<button
				type="button"
				onclick={onNuevaBusqueda}
				class="shrink-0 text-xs font-semibold text-light-two hover:underline"
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
		<p class="text-[11px] text-light-five">
			Presione Enter para buscar. Si el CI no está registrado, podrá registrarlo con la venta.
		</p>
	{:else}
		<!-- Cliente nuevo: se registra junto con la venta -->
		<div class="grid grid-cols-6 gap-x-2 gap-y-2">
			<div class="col-span-3">
				{@render etiqueta('CI o NIT', 'cliente-ci', true)}
				<Input id="cliente-ci" size="xs" bind:value={clienteForm.ci} autocomplete="off" />
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
				<Input id="cliente-complemento" size="xs" maxlength={5} bind:value={clienteForm.complemento} />
			</div>

			<div class="col-span-3">
				{@render etiqueta('Nombre / Razón social', 'cliente-nombre', true)}
				<Input id="cliente-nombre" size="xs" bind:value={clienteForm.nombre} />
			</div>
			<div class="col-span-3">
				{@render etiqueta('Apellidos', 'cliente-apellidos', false)}
				<Input id="cliente-apellidos" size="xs" bind:value={clienteForm.apellido_paterno} />
			</div>

			<div class="col-span-3">
				{@render etiqueta('Género', 'cliente-genero', true)}
				<div id="cliente-genero" class="grid h-8 grid-cols-3 gap-0.5 rounded-lg bg-light-one_d p-0.5">
					{#each GENEROS as g (g.id)}
						<button
							type="button"
							onclick={() => (clienteForm.genero = g.id)}
							class="rounded-md text-xs font-bold transition {clienteForm.genero === g.id
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
				<Input id="cliente-telefono" type="tel" size="xs" bind:value={clienteForm.telefono} />
			</div>
		</div>
	{/if}
</section>
