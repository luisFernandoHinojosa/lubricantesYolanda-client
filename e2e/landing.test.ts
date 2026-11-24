import { expect, test } from '@playwright/test';
import { mockApi } from './support/mockApi';

test.describe('Página pública', () => {
	test.beforeEach(async ({ page }) => {
		await mockApi(page);
		await page.goto('/');
	});

	test('presenta la tienda y su propuesta', async ({ page }) => {
		await expect(page).toHaveTitle(/Lubricantes Yolanda/);
		await expect(
			page.getByRole('heading', {
				level: 1,
				name: 'Aceite, filtros y todo lo que tu motor necesita.'
			})
		).toBeVisible({ timeout: 60_000 });
		await expect(page.getByLabel('Grados de viscosidad disponibles')).toContainText('20W-50');
	});

	test('el botón principal abre WhatsApp con el número de la tienda', async ({ page }) => {
		const whatsapp = page.getByRole('link', { name: 'Consultar por WhatsApp' });
		await expect(whatsapp).toHaveAttribute('href', /^https:\/\/wa\.me\/59172123855\?text=/);
		await expect(whatsapp).toHaveAttribute('target', '_blank');
		await expect(whatsapp).toHaveAttribute('rel', /noopener/);
	});

	test('muestra el horario de atención', async ({ page }) => {
		const horario = page.getByRole('table', { name: 'Horario de atención' });
		await expect(horario.getByRole('row', { name: /Lunes a viernes/ })).toContainText(
			'7:30 – 19:30'
		);
		await expect(horario.getByRole('row', { name: /Domingo/ })).toContainText('Cerrado');
	});

	test('el personal llega al inicio de sesión', async ({ page }) => {
		await page.getByRole('banner').getByRole('link', { name: 'Acceso del personal' }).click();
		await expect(page).toHaveURL(/\/auth\/sign-in$/);
		await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
	});
});
