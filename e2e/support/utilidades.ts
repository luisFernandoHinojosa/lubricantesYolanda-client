import { expect, type Page } from '@playwright/test';

/** Monto como lo muestra la app (es-BO): "Bs 1.045,50". Tolera espacios normales o duros. */
export function bs(monto: number): RegExp {
	const texto = new Intl.NumberFormat('es-BO', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(monto);
	return new RegExp(`Bs\\s*${texto.replace('.', '\\.')}`);
}

/** Espera a que la app termine de montar (la primera compilación de `vite dev` puede tardar) */
export async function esperarApp(page: Page) {
	await expect(page.locator('#contenido')).toBeVisible({ timeout: 60_000 });
}

/** Escanea un código como lo haría la pistola lectora: escribe y presiona Enter */
export async function escanear(page: Page, codigo: string) {
	const input = page.locator('#scan-input');
	await input.fill(codigo);
	await input.press('Enter');
}

/** Notificación emergente (notyf) con el texto indicado */
export function aviso(page: Page, texto: string | RegExp) {
	return page.locator('.notyf__toast').filter({ hasText: texto });
}

/** Abre una página pública y espera a que sea interactiva (formularios listos) */
export async function abrir(page: Page, ruta: string) {
	await page.goto(ruta);
	await expect(page.locator('html[data-app="lista"]')).toBeAttached({ timeout: 60_000 });
}
