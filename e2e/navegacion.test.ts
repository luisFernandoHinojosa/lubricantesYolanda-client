import { expect, test } from '@playwright/test';
import { iniciarSesion, mockApi } from './support/mockApi';
import { esperarApp } from './support/utilidades';

test.describe('Navegación', () => {
	test.beforeEach(async ({ page }) => {
		await mockApi(page);
		await iniciarSesion(page);
	});

	test('el menú lleva a cada pantalla y el header dice dónde se está', async ({
		page,
		isMobile
	}) => {
		await page.goto('/v1/inicio');
		await esperarApp(page);

		const menu = page.getByRole('complementary', { name: 'Menú principal' });
		if (isMobile) await page.getByRole('button', { name: 'Abrir menú' }).click();

		await menu.getByRole('button', { name: 'Inventario' }).click();
		await menu.getByRole('link', { name: 'Kardex' }).click();

		await expect(page).toHaveURL(/\/v1\/inventario\/kardex$/);
		const ubicacion = page.getByRole('navigation', { name: 'Ubicación' });
		await expect(ubicacion.locator('[aria-current="page"]')).toHaveText('Kardex');
		if (!isMobile)
			await expect(menu.getByRole('link', { name: 'Kardex' })).toHaveAttribute(
				'aria-current',
				'page'
			);
	});

	test('el grupo de la pantalla actual aparece abierto', async ({ page, isMobile }) => {
		await page.goto('/v1/productos/marcas');
		await esperarApp(page);
		if (isMobile) await page.getByRole('button', { name: 'Abrir menú' }).click();
		const menu = page.getByRole('complementary', { name: 'Menú principal' });
		await expect(menu.getByRole('button', { name: 'Inventario' })).toHaveAttribute(
			'aria-expanded',
			'true'
		);
		await expect(menu.getByRole('link', { name: 'Marcas' })).toHaveAttribute(
			'aria-current',
			'page'
		);
	});

	test('el enlace "Saltar al contenido" es lo primero al tabular', async ({ page }) => {
		await page.goto('/v1/inicio');
		await esperarApp(page);
		await page.keyboard.press('Tab');
		const saltar = page.getByRole('link', { name: 'Saltar al contenido' });
		await expect(saltar).toBeFocused();
		await expect(saltar).toBeVisible();
	});
});

test.describe('Menú en escritorio', () => {
	test.skip(({ isMobile }) => isMobile, 'Solo escritorio');

	test('se puede contraer y la preferencia se recuerda', async ({ page }) => {
		await mockApi(page);
		await iniciarSesion(page);
		await page.goto('/v1/inicio');
		await esperarApp(page);

		const menu = page.getByRole('complementary', { name: 'Menú principal' });
		await page.getByRole('button', { name: 'Contraer menú' }).click();
		await expect(menu).toHaveCSS('width', '72px');

		await page.reload();
		await esperarApp(page);
		await expect(menu).toHaveCSS('width', '72px');

		// Contraído, los grupos se abren como menú flotante
		await menu.getByRole('button', { name: 'Inventario' }).click();
		await expect(page.getByRole('menu').getByRole('menuitem', { name: 'Productos' })).toBeVisible();

		await page.getByRole('button', { name: 'Expandir menú' }).click();
		await expect(menu).toHaveCSS('width', '256px');
	});
});

test.describe('Menú en móvil', () => {
	test.skip(({ isMobile }) => !isMobile, 'Solo móvil');

	test('se abre con el botón y se cierra con Escape', async ({ page }) => {
		await mockApi(page);
		await iniciarSesion(page);
		await page.goto('/v1/inicio');
		await esperarApp(page);

		const abrir = page.getByRole('button', { name: 'Abrir menú' });
		await expect(abrir).toHaveAttribute('aria-expanded', 'false');
		await abrir.click();
		await expect(abrir).toHaveAttribute('aria-expanded', 'true');
		await expect(
			page
				.getByRole('complementary', { name: 'Menú principal' })
				.getByRole('link', { name: 'Clientes' })
		).toBeInViewport();

		await page.keyboard.press('Escape');
		await expect(abrir).toHaveAttribute('aria-expanded', 'false');
	});
});
