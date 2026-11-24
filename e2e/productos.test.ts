import { expect, test, type Page } from '@playwright/test';
import { iniciarSesion, mockApi } from './support/mockApi';
import { esperarApp } from './support/utilidades';

async function abrirProductos(page: Page) {
	await mockApi(page);
	await iniciarSesion(page);
	await page.goto('/v1/productos/productos');
	await esperarApp(page);
	await expect(page.getByRole('heading', { level: 1, name: 'Productos' })).toBeVisible();
}

const tabla = (page: Page) => page.getByRole('table', { name: 'Productos del inventario' });
const filas = (page: Page) => tabla(page).locator('tbody tr');

test.describe('Listado de productos', () => {
	test('muestra el total y el estado de stock de cada producto', async ({ page }) => {
		await abrirProductos(page);

		await expect(page.getByText('3 productos registrados')).toBeVisible();
		await expect(filas(page)).toHaveCount(3);

		await expect(filas(page).filter({ hasText: 'Aceite Motul 5100' })).toContainText('mín. 6');
		await expect(filas(page).filter({ hasText: 'Castrol GTX' })).toContainText('Stock bajo');
		await expect(filas(page).filter({ hasText: 'Refrigerante Prestone' })).toContainText('Agotado');
		await expect(filas(page).filter({ hasText: 'Refrigerante Prestone' })).toContainText(
			'Con vencimiento'
		);
	});

	test('la búsqueda filtra y "Quitar filtros" vuelve a mostrar todo', async ({ page }) => {
		await abrirProductos(page);

		await page.getByRole('searchbox', { name: 'Buscar' }).fill('castrol');
		await expect(filas(page)).toHaveCount(1);
		await expect(filas(page).first()).toContainText('Castrol GTX 20W-50 4 L');
		await expect(page.getByText('1 producto con estos filtros')).toBeVisible();

		await page.getByRole('button', { name: 'Quitar filtros' }).click();
		await expect(filas(page)).toHaveCount(3);
		await expect(page.getByRole('searchbox', { name: 'Buscar' })).toHaveValue('');
	});

	test('sin resultados, explica cómo seguir', async ({ page }) => {
		await abrirProductos(page);
		await page.getByRole('searchbox', { name: 'Buscar' }).fill('no-existe');
		await expect(tabla(page)).toContainText('Ningún producto coincide con los filtros');
		await expect(tabla(page)).toContainText('Pruebe con otro nombre o quite algún filtro.');
	});

	test('el filtro de proveedor ofrece los proveedores del catálogo', async ({ page }) => {
		await abrirProductos(page);
		const proveedor = page.getByLabel('Proveedor');
		await expect(proveedor.locator('option')).toHaveText([
			'Todos',
			'Distribuidora El Motor',
			'Lubricantes del Sur'
		]);
	});

	test('filtrar por marca consulta solo esa marca', async ({ page }) => {
		await abrirProductos(page);
		await page.getByLabel('Marca').selectOption({ label: 'Motul' });
		await expect(filas(page)).toHaveCount(1);
		await expect(filas(page).first()).toContainText('Motul');
	});

	test('cambia a vista de tarjetas', async ({ page }) => {
		await abrirProductos(page);
		await page.getByRole('radio', { name: 'Ver como tarjetas' }).click();
		await expect(tabla(page)).toBeHidden();
		await expect(page.getByRole('article')).toHaveCount(3);
		await expect(
			page.getByRole('article').filter({ hasText: 'Refrigerante Prestone' })
		).toContainText('Agotado');
	});

	test('el menú de acciones funciona con teclado', async ({ page }) => {
		await abrirProductos(page);
		const acciones = page.getByRole('button', { name: 'Acciones para Castrol GTX 20W-50 4 L' });
		await acciones.focus();
		await page.keyboard.press('Enter');

		const menu = page.getByRole('menu');
		await expect(menu.getByRole('menuitem')).toHaveText([
			'Ver detalle',
			'Editar',
			'Trasladar stock',
			'Presentaciones',
			'Eliminar'
		]);
		await expect(menu.getByRole('menuitem', { name: 'Ver detalle' })).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(menu.getByRole('menuitem', { name: 'Editar' })).toBeFocused();

		await page.keyboard.press('Escape');
		await expect(menu).toBeHidden();
		await expect(acciones).toBeFocused();
	});

	test('eliminar pide confirmación con el foco en "Cancelar"', async ({ page }) => {
		await abrirProductos(page);
		await page.getByRole('button', { name: 'Acciones para Castrol GTX 20W-50 4 L' }).click();
		await page.getByRole('menuitem', { name: 'Eliminar' }).click();

		const confirmar = page.getByRole('alertdialog', { name: '¿Eliminar este producto?' });
		await expect(confirmar).toContainText('"Castrol GTX 20W-50 4 L" se eliminará del inventario.');
		await expect(confirmar.getByRole('button', { name: 'Cancelar' })).toBeFocused();

		await page.keyboard.press('Escape');
		await expect(confirmar).toBeHidden();
	});

	test('editar lleva a la ficha del producto', async ({ page }) => {
		await abrirProductos(page);
		await page.getByRole('button', { name: 'Acciones para Aceite Motul 5100 15W-50 1 L' }).click();
		await page.getByRole('menuitem', { name: 'Editar' }).click();
		await expect(page).toHaveURL(/\/v1\/productos\/productos\/p-motul$/);
		// El header indica dónde se está
		await expect(page.getByRole('navigation', { name: 'Ubicación' })).toContainText('Productos');
		await expect(page.getByRole('navigation', { name: 'Ubicación' })).toContainText('Detalle');
	});
});
