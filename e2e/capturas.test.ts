import { test } from '@playwright/test';
import { iniciarSesion, mockApi } from './support/mockApi';

/**
 * Recorrido visual: guarda capturas de las pantallas principales para revisar el diseño.
 * Solo corre si se define CAPTURAS con la carpeta destino:
 *   CAPTURAS=./capturas npx playwright test capturas --project=escritorio
 */
const destino = process.env.CAPTURAS;
test.skip(!destino, 'Define CAPTURAS=<carpeta> para generar las capturas');
test.setTimeout(120_000);

const PANTALLAS = [
	'/v1/inicio',
	'/v1/finanzas/venta-productos-pedidos',
	'/v1/productos/productos',
	'/v1/finanzas/historial-ventas',
	'/v1/inventario/kardex',
	'/v1/usuarios/clientes'
];

for (const ruta of PANTALLAS) {
	test(`captura ${ruta}`, async ({ page }, info) => {
		await mockApi(page);
		await iniciarSesion(page);
		await page.goto(ruta);
		await page.locator('#contenido').waitFor({ timeout: 90_000 });
		await page.waitForTimeout(1200);
		const nombre = ruta.replaceAll('/', '_').replace(/^_/, '');
		await page.screenshot({ path: `${destino}/${nombre}-${info.project.name}.png` });
	});
}

test('captura públicas', async ({ page }, info) => {
	await mockApi(page);
	for (const ruta of ['/', '/auth/sign-in']) {
		await page.goto(ruta);
		await page.locator('h1').first().waitFor({ timeout: 90_000 });
		await page.waitForTimeout(1200);
		const nombre = ruta === '/' ? 'landing' : 'login';
		await page.screenshot({
			path: `${destino}/${nombre}-${info.project.name}.png`,
			fullPage: ruta === '/'
		});
	}
});
