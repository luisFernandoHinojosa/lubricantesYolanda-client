// import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			fallback: 'index.html',
			strict: false
		}),
		// Cada build genera una versión nueva; el navegador revisa /_app/version.json
		// cada 60 s para detectar si hay un despliegue nuevo (ver src/routes/+layout.svelte)
		version: {
			pollInterval: 60_000
		}
	}
};

export default config;
