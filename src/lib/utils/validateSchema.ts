import type { ZodSchema, ZodError } from 'zod';

export type ValidationResult<T> =
	| { success: true; data: T }
	| { success: false; errors: Record<string, string> };

export function validateSchema<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
	const result = schema.safeParse(data);

	if (result.success) {
		return {
			success: true,
			data: result.data
		};
	}
	const errors = formatZodErrors(result.error);

	return {
		success: false,
		errors
	};
}

function formatZodErrors(error: ZodError): Record<string, string> {
	const formatted: Record<string, string> = {};

	for (const issue of error.issues) {
		const field = issue.path[0];
		if (field) {
			formatted[field as string] = issue.message;
		}
	}

	return formatted;
}
