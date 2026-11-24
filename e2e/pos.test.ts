import { expect, test, type Page } from '@playwright/test';
import { iniciarSesion, mockApi, type RegistroApi } from './support/mockApi';
import { aviso, bs, escanear } from './support/utilidades';

const POS = '/v1/finanzas/venta-productos-pedidos';
const MOTUL = '3374650247434'; // Bs 95,00
const MOTUL_CAJA = '3374650247999'; // presentación Caja x12, Bs 1.080,00

async function abrirPos(page: Page, cajaAbierta = true): Promise<RegistroApi> {
	const registro = await mockApi(page, { cajaAbierta });
	await iniciarSesion(page);
	await page.goto(POS);
	if (cajaAbierta) {
		await expect(page.locator('#scan-input')).toBeVisible({ timeout: 60_000 });
	}
	return registro;
}

const carrito = (page: Page) => page.getByRole('region', { name: 'Productos en la venta' });
const total = (page: Page) => page.getByTestId('pos-total');
const modoBuscar = (page: Page) =>
	page.getByRole('radiogroup', { name: 'Modo de búsqueda' }).getByRole('radio', { name: 'Buscar' });
const cobrar = (page: Page) => page.getByRole('button', { name: /^Cobrar (venta|y facturar)/ });

test.describe('Caja', () => {
	test('sin caja abierta, pide el fondo inicial y la abre', async ({ page }) => {
		const registro = await abrirPos(page, false);

		const dialogo = page.getByRole('dialog', { name: 'Abrir caja' });
		await expect(dialogo).toBeVisible({ timeout: 60_000 });
		const abrir = dialogo.getByRole('button', { name: 'Abrir caja' });
		await expect(abrir).toBeDisabled();

		await dialogo.getByLabel('Fondo inicial en efectivo').fill('150');
		await abrir.click();

		await expect(dialogo).toBeHidden();
		await expect(page.getByRole('region', { name: 'Turno de caja' })).toContainText(bs(150));
		expect(registro.aperturas).toEqual([{ monto_apertura: 150 }]);
	});

	test('el cierre muestra el arqueo y la diferencia mientras se cuenta', async ({ page }) => {
		const registro = await abrirPos(page);

		await page.getByRole('button', { name: 'Cerrar caja' }).click();
		const dialogo = page.getByRole('dialog', { name: 'Cerrar caja' });
		await expect(dialogo).toBeVisible();
		// Fondo 200 + ventas en efectivo 845,50
		await expect(dialogo.getByText('Debería haber')).toBeVisible();
		await expect(dialogo).toContainText(bs(1045.5));

		const conteo = dialogo.getByLabel('Efectivo contado en caja');
		await expect(conteo).toBeFocused();
		await conteo.fill('1000');
		await expect(dialogo).toContainText(/Faltan\s+Bs\s*45,50/);
		await conteo.fill('1045.5');
		await expect(dialogo.getByText('La caja cuadra.')).toBeVisible();

		await dialogo.getByRole('button', { name: 'Cerrar caja' }).click();
		await expect(aviso(page, 'Caja cerrada')).toBeVisible();
		expect(registro.cierres).toEqual([{ monto_cierre: 1045.5 }]);
		// Tras cerrar, vuelve a pedir la apertura
		await expect(page.getByRole('dialog', { name: 'Abrir caja' })).toBeVisible();
	});

	test('"Seguir vendiendo" cierra el diálogo sin cerrar la caja', async ({ page }) => {
		const registro = await abrirPos(page);
		await page.getByRole('button', { name: 'Cerrar caja' }).click();
		await page.getByRole('button', { name: 'Seguir vendiendo' }).click();
		await expect(page.getByRole('dialog', { name: 'Cerrar caja' })).toBeHidden();
		expect(registro.cierres).toHaveLength(0);
	});
});

test.describe('Carrito', () => {
	test('empieza vacío y explica qué hacer', async ({ page }) => {
		await abrirPos(page);
		await expect(carrito(page)).toContainText('Escanee un producto para empezar');
		await expect(cobrar(page)).toBeDisabled();
		await expect(page.getByText('Agregue al menos un producto.')).toBeVisible();
		// El buscador queda listo para la pistola lectora
		await expect(page.locator('#scan-input')).toBeFocused();
	});

	test('escanear suma el producto y repetir el código aumenta la cantidad', async ({ page }) => {
		await abrirPos(page);

		await escanear(page, MOTUL);
		const fila = carrito(page).getByRole('row', { name: /Aceite Motul 5100/ });
		await expect(fila).toBeVisible();
		await expect(total(page)).toContainText('95,00');

		await escanear(page, MOTUL);
		await expect(fila.getByRole('spinbutton', { name: 'Cantidad' })).toHaveValue('2');
		await expect(total(page)).toContainText('190,00');
		await expect(carrito(page).getByRole('row')).toHaveCount(2); // cabecera + 1 producto
	});

	test('escanear una presentación la agrega con su precio especial', async ({ page }) => {
		await abrirPos(page);
		await escanear(page, MOTUL_CAJA);
		const fila = carrito(page).getByRole('row', { name: /Aceite Motul 5100/ });
		await expect(fila).toContainText('Caja x12');
		await expect(total(page)).toContainText('1.080,00');
	});

	test('un código desconocido avisa y deja el código para corregirlo', async ({ page }) => {
		await abrirPos(page);
		await escanear(page, '0000000000');
		await expect(aviso(page, 'Código "0000000000" no encontrado')).toBeVisible();
		await expect(page.locator('#scan-input')).toHaveValue('0000000000');
		await expect(carrito(page)).toContainText('Escanee un producto para empezar');
	});

	test('los botones + y − cambian la cantidad y el importe', async ({ page }) => {
		await abrirPos(page);
		await escanear(page, MOTUL);
		const fila = carrito(page).getByRole('row', { name: /Aceite Motul 5100/ });

		await fila.getByRole('button', { name: 'Sumar uno' }).click();
		await fila.getByRole('button', { name: 'Sumar uno' }).click();
		await expect(fila.getByRole('spinbutton', { name: 'Cantidad' })).toHaveValue('3');
		await expect(total(page)).toContainText('285,00');

		await fila.getByRole('button', { name: 'Restar uno' }).click();
		await expect(total(page)).toContainText('190,00');
	});

	test('el descuento por producto se descuenta del importe', async ({ page }) => {
		await abrirPos(page);
		await escanear(page, MOTUL);
		const fila = carrito(page).getByRole('row', { name: /Aceite Motul 5100/ });
		await fila.getByLabel(/Descuento en bolivianos/).fill('5');
		await expect(total(page)).toContainText('90,00');
	});

	test('quitar un producto lo saca de la venta', async ({ page }) => {
		await abrirPos(page);
		await escanear(page, MOTUL);
		await carrito(page)
			.getByRole('button', { name: 'Quitar Aceite Motul 5100 15W-50 1 L' })
			.click();
		await expect(carrito(page)).toContainText('Escanee un producto para empezar');
		await expect(total(page)).toContainText('0,00');
	});

	test('el carrito sobrevive a una recarga accidental', async ({ page }) => {
		await abrirPos(page);
		await escanear(page, MOTUL);
		await expect(total(page)).toContainText('95,00');
		await page.reload();
		await expect(carrito(page).getByRole('row', { name: /Aceite Motul 5100/ })).toBeVisible({
			timeout: 60_000
		});
	});
});

test.describe('Búsqueda por nombre', () => {
	test('encuentra productos, marca los agotados y agrega con un clic', async ({ page }) => {
		const registro = await abrirPos(page);
		await modoBuscar(page).click();

		const resultados = page.getByRole('listbox', { name: 'Resultados de búsqueda' });
		await expect(resultados).toBeVisible();
		// El filtro Bosch no tiene stock: se ve pero no se puede elegir
		await expect(resultados.getByRole('option', { name: /Filtro de aceite Bosch/ })).toBeDisabled();
		await expect(resultados.getByRole('option', { name: /Filtro de aceite Bosch/ })).toContainText(
			'Agotado'
		);
		await expect(resultados.getByRole('option', { name: /Castrol GTX/ })).toContainText(
			'3 en stock'
		);

		await page.locator('#scan-input').fill('castrol');
		await expect.poll(() => registro.busquedasProductos.at(-1)).toBe('castrol');
		await resultados.getByRole('option', { name: /Castrol GTX/ }).click();

		await expect(carrito(page).getByRole('row', { name: /Castrol GTX 20W-50/ })).toBeVisible();
		await expect(total(page)).toContainText('210,00');
		await expect(page.locator('#scan-input')).toBeFocused();
	});

	test('se recorre con las flechas y Escape vuelve al buscador', async ({ page }) => {
		await abrirPos(page);
		await modoBuscar(page).click();
		const input = page.locator('#scan-input');
		await input.focus();
		await expect(page.getByRole('listbox', { name: 'Resultados de búsqueda' })).toBeVisible();

		await input.press('ArrowDown');
		await expect(page.getByRole('option', { name: /Aceite Motul 5100/ }).first()).toBeFocused();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('listbox', { name: 'Resultados de búsqueda' })).toBeHidden();
		await expect(input).toBeFocused();
	});
});

test.describe('Cobro', () => {
	test('calcula el cambio y registra la venta con F2', async ({ page }) => {
		const registro = await abrirPos(page);
		await escanear(page, MOTUL);
		await expect(total(page)).toContainText('95,00');

		const pago = page.getByLabel('Monto recibido en Efectivo');
		await expect(pago).toHaveValue('95'); // el pago sigue al total mientras no se edite
		await pago.fill('200');
		await expect(page.getByTestId('pos-cambio')).toHaveText(bs(105));

		await page.keyboard.press('F2');

		const recibo = page.getByRole('dialog', { name: 'Venta registrada' });
		await expect(recibo).toBeVisible();
		await expect(recibo).toContainText('V-000101');

		expect(registro.ventas).toHaveLength(1);
		expect(registro.ventas[0]).toMatchObject({
			id_sesion_caja: 'caja-1',
			facturar: false,
			items: [{ id_producto: 'p-motul', id_presentacion: null, cantidad: 1, monto_descuento: 0 }],
			pagos: [{ metodo_pago: 'EFECTIVO', monto: 200 }]
		});
		expect(registro.ventas[0]).not.toHaveProperty('cliente');

		await recibo.getByRole('button', { name: 'Nueva venta' }).click();
		await expect(recibo).toBeHidden();
		await expect(carrito(page)).toContainText('Escanee un producto para empezar');
		await expect(page.locator('#scan-input')).toBeFocused();
	});

	test('si el pago no alcanza, dice cuánto falta y no deja cobrar', async ({ page }) => {
		await abrirPos(page);
		await escanear(page, MOTUL);
		await page.getByLabel('Monto recibido en Efectivo').fill('50');
		await expect(cobrar(page)).toBeDisabled();
		await expect(page.locator('#pos-motivo')).toHaveText(/Falta cobrar Bs\s*45,00/);
	});

	test('dividir el pago propone lo que falta en el segundo método', async ({ page }) => {
		const registro = await abrirPos(page);
		await escanear(page, MOTUL);
		await page.getByLabel('Monto recibido en Efectivo').fill('50');
		await page.getByRole('button', { name: 'Dividir pago' }).click();

		await expect(page.getByLabel('Monto recibido en QR')).toHaveValue('45');
		await expect(cobrar(page)).toBeEnabled();
		await cobrar(page).click();

		await expect(page.getByRole('dialog', { name: 'Venta registrada' })).toBeVisible();
		expect(registro.ventas[0].pagos).toEqual([
			{ metodo_pago: 'EFECTIVO', monto: 50 },
			{ metodo_pago: 'QR', monto: 45 }
		]);
	});

	test('para facturar exige un cliente con CI o NIT', async ({ page }) => {
		const registro = await abrirPos(page);
		await escanear(page, MOTUL);

		await page.getByRole('radio', { name: 'Factura' }).click();
		await expect(
			page.getByText('Asigne un cliente con CI o NIT para emitir la factura.')
		).toBeVisible();
		await expect(cobrar(page)).toBeDisabled();

		await page.getByLabel('CI o NIT del cliente').fill('6543210');
		await page.getByRole('button', { name: 'Buscar', exact: true }).click();
		const panelCobro = page.getByRole('complementary', { name: 'Cobro de la venta' });
		await expect(
			panelCobro.getByRole('paragraph').filter({ hasText: /^Carlos Mendoza$/ })
		).toBeVisible();

		// Con factura se suma el recargo del IVA (13 %)
		await expect(total(page)).toContainText('107,35');
		await expect(cobrar(page)).toHaveText(/Cobrar y facturar/);
		await cobrar(page).click();

		await expect(page.getByRole('dialog', { name: 'Venta registrada' })).toBeVisible();
		expect(registro.ventas[0]).toMatchObject({
			facturar: true,
			porcentaje_recargo_iva: 13,
			cliente: { ci: '6543210', nombre: 'Carlos' }
		});
	});
});
