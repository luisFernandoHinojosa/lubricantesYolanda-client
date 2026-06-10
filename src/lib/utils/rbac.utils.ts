import { ROLE_PERMISSIONS } from '$lib/config/permissions.config';

/**
 * Checks if a role has access to a specific path.
 * @param role The user's role code (e.g., 'ADM', 'SADM', 'CAJ')
 * @param path The current path (e.g., '/v1/inicio')
 * @returns boolean
 */
export function canAccess(role: string | undefined, path: string): boolean {
	if (!role) return false;

	const config = ROLE_PERMISSIONS[role];
	if (!config) return false;

	// Always allow public paths (if any, but here we assume /v1/ is protected)
	// You might want to add a list of always-allowed paths here

	if (config.strategy === 'allow-all') {
		// Check if the path or any of its parents is in the denied list
		if (config.deniedPaths) {
			return !config.deniedPaths.some((deniedPath) => path.startsWith(deniedPath));
		}
		return true;
	}

	if (config.strategy === 'deny-all') {
		// Check if the path or its parent is in the allowed list
		if (config.allowedPaths) {
			return config.allowedPaths.some((allowedPath) => path.startsWith(allowedPath));
		}
		return false;
	}

	return false;
}

/**
 * Gets the default redirect path for a role.
 */
export function getDefaultRedirect(role: string | undefined): string {
	console.log('role', role);
	if (!role) return '/auth/sign-in';
	return ROLE_PERMISSIONS[role]?.defaultRedirect || '/v1/inicio';
}
