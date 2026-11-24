import { expect, test } from '@playwright/test';
import { CREDENCIALES } from './support/datos';
import { iniciarSesion, mockApi } from './support/mockApi';
import { abrir, esperarApp } from './support/utilidades';

test.describe('Inicio de sesión', () => {
	test('rechaza credenciales incorrectas con un mensaje claro', async ({ page }) => {
		await mockApi(page);
		await abrir(page, '/auth/sign-in');

		await page.getByLabel('Correo electrónico').fill(CREDENCIALES.email);
		await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta');
		await page.getByRole('button', { name: 'Ingresar' }).click();

		await expect(page.getByRole('alert')).toHaveText('El correo o la contraseña no son correctos.');
		await expect(page).toHaveURL(/\/auth\/sign-in/);
		// El foco vuelve al correo para corregir sin usar el mouse
		await expect(page.getByLabel('Correo electrónico')).toBeFocused();
	});

	test('el administrador entra al inicio', async ({ page }) => {
		await mockApi(page, { rol: 'SADM' });
		await abrir(page, '/auth/sign-in');

		await page.getByLabel('Correo electrónico').fill(CREDENCIALES.email);
		await page.getByLabel('Contraseña', { exact: true }).fill(CREDENCIALES.password);
		await page.getByRole('button', { name: 'Ingresar' }).click();

		await expect(page).toHaveURL(/\/v1\/inicio$/);
		await esperarApp(page);
	});

	test('el cajero entra directo al punto de venta', async ({ page }) => {
		await mockApi(page, { rol: 'CAJ' });
		await abrir(page, '/auth/sign-in');

		await page.getByLabel('Correo electrónico').fill(CREDENCIALES.email);
		await page.getByLabel('Contraseña', { exact: true }).fill(CREDENCIALES.password);
		await page.keyboard.press('Enter');

		await expect(page).toHaveURL(/\/v1\/finanzas\/venta-productos-pedidos$/);
	});

	test('mostrar contraseña cambia el tipo del campo', async ({ page }) => {
		await mockApi(page);
		await abrir(page, '/auth/sign-in');
		const clave = page.getByLabel('Contraseña', { exact: true });
		await clave.fill('secreto');
		await expect(clave).toHaveAttribute('type', 'password');
		await page.getByRole('button', { name: 'Mostrar contraseña' }).click();
		await expect(clave).toHaveAttribute('type', 'text');
		await expect(page.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	});
});

test.describe('Rutas protegidas', () => {
	test('sin sesión, pide ingresar y luego vuelve a la pantalla pedida', async ({ page }) => {
		await mockApi(page, { rol: 'SADM' });
		await page.goto('/v1/productos/productos');

		await expect(page).toHaveURL(/\/auth\/sign-in\?redirectTo=%2Fv1%2Fproductos%2Fproductos/, {
			timeout: 60_000
		});
		await expect(
			page.getByText('Su sesión terminó. Ingrese de nuevo para continuar.')
		).toBeVisible();

		await page.getByLabel('Correo electrónico').fill(CREDENCIALES.email);
		await page.getByLabel('Contraseña', { exact: true }).fill(CREDENCIALES.password);
		await page.getByRole('button', { name: 'Ingresar' }).click();

		await expect(page).toHaveURL(/\/v1\/productos\/productos$/);
	});

	test('el cajero no puede abrir inventario y vuelve al punto de venta', async ({ page }) => {
		await mockApi(page, { rol: 'CAJ' });
		await iniciarSesion(page, 'CAJ');
		await page.goto('/v1/productos/productos');
		await expect(page).toHaveURL(/\/v1\/finanzas\/venta-productos-pedidos$/, { timeout: 60_000 });
	});

	test('cerrar sesión desde el menú de usuario', async ({ page }) => {
		await mockApi(page);
		await iniciarSesion(page);
		await page.goto('/v1/inicio');
		await esperarApp(page);

		await page.getByRole('button', { name: /Menú de usuario: Yolanda Quispe/ }).click();
		await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();

		// Cierre voluntario: sin el aviso de "sesión terminó"
		await expect(page).toHaveURL(/\/auth\/sign-in$/);
		await expect(
			page.getByText('Ingrese con la cuenta que le dio el administrador.')
		).toBeVisible();
		const sesion = await page.evaluate(() => localStorage.getItem('lby::auth::ud'));
		expect(sesion).toBeNull();
	});
});

test.describe('Recuperar contraseña', () => {
	test('confirma el envío del enlace', async ({ page }) => {
		await mockApi(page);
		await abrir(page, '/auth/sign-in');
		await page.getByRole('link', { name: '¿La olvidó?' }).click();

		await expect(page.getByRole('heading', { name: 'Recuperar contraseña' })).toBeVisible();
		await page.getByLabel('Correo electrónico').fill(CREDENCIALES.email);
		await page.getByRole('button', { name: 'Enviar enlace' }).click();

		await expect(page.getByRole('heading', { name: 'Revise su correo' })).toBeVisible();
		await expect(page.getByRole('status')).toContainText(CREDENCIALES.email);
	});

	test('valida la contraseña nueva antes de enviarla', async ({ page }) => {
		await mockApi(page);
		await abrir(page, '/auth/reset-password/token-de-prueba');

		const guardar = page.getByRole('button', { name: 'Guardar contraseña' });
		await page.getByLabel('Contraseña nueva').fill('corta');
		await expect(page.getByText('Faltan 3 caracteres.')).toBeVisible();
		await expect(guardar).toBeDisabled();

		await page.getByLabel('Contraseña nueva').fill('una-clave-larga');
		await page.getByLabel('Repita la contraseña').fill('otra-clave-larga');
		await expect(page.getByText('Las contraseñas no coinciden.')).toBeVisible();
		await expect(guardar).toBeDisabled();

		await page.getByLabel('Repita la contraseña').fill('una-clave-larga');
		await expect(guardar).toBeEnabled();
		await guardar.click();
		await expect(page.getByRole('heading', { name: 'Contraseña guardada' })).toBeVisible();
	});
});
