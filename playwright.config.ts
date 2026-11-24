import { defineConfig, devices } from '@playwright/test';

/**
 * Tests E2E con la API simulada (ver e2e/support/mockApi.ts): no tocan el backend real.
 *
 * - En local reutiliza un `vite dev` que ya esté corriendo en el puerto 4173.
 * - En CI (variable CI) compila y sirve la versión de producción.
 */
const PORT = 4173;
const isCI = !!process.env.CI;

export default defineConfig({
	testDir: 'e2e',
	timeout: 45_000,
	expect: { timeout: 10_000 },
	fullyParallel: true,
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	reporter: isCI ? 'github' : [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL: `http://localhost:${PORT}`,
		locale: 'es-BO',
		timezoneId: 'America/La_Paz',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure'
	},
	projects: [
		{
			name: 'escritorio',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } }
		},
		{
			name: 'movil',
			use: { ...devices['Pixel 7'] },
			// En móvil solo se prueba lo que tiene sentido usar desde el teléfono
			testMatch: /(acceso|navegacion|landing)\.test\.ts/
		}
	],
	webServer: {
		command: isCI
			? `npm run build && npm run preview -- --port ${PORT} --strictPort`
			: `npx vite dev --port ${PORT} --strictPort`,
		port: PORT,
		reuseExistingServer: !isCI,
		timeout: 180_000
	}
});
