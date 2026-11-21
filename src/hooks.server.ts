import type { Handle } from '@sveltejs/kit';

// El HTML nunca se guarda en caché: así cada recarga pide la versión actual del sitio.
// Los archivos de /_app/immutable/* llevan hash en el nombre y sí se cachean (lo maneja el adapter).
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	if (response.headers.get('content-type')?.includes('text/html')) {
		response.headers.set('cache-control', 'no-cache, no-store, must-revalidate');
	}

	return response;
};
