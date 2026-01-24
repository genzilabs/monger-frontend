/**
 * Data transfer API client for import/export operations
 */

import { PUBLIC_API_URL } from '$env/static/public';
import { tokenStorage } from '$lib/utils/storage';
import type { ApiResult } from '$lib/types';
import type {
	ExportParams,
	ImportOptions,
	ImportValidationResponse,
	ImportExecuteRequest,
	ImportResult,
	ImportHistoryItem
} from '$lib/types/dataTransfer';

/**
 * Export book data as a file (CSV, PDF, or Excel)
 * Returns a Blob for download
 */
export async function exportBook(
	bookId: string,
	params: ExportParams
): Promise<ApiResult<Blob>> {
	const token = tokenStorage.getAccessToken();
	if (!token) {
		return { error: { error: 'Not authenticated', code: 'UNAUTHORIZED' } };
	}

	const queryParams = new URLSearchParams();
	if (params.startDate) queryParams.set('start_date', params.startDate);
	if (params.endDate) queryParams.set('end_date', params.endDate);
	if (params.categoryId) queryParams.set('category_id', params.categoryId);
	if (params.type) queryParams.set('type', params.type);
	if (params.template) queryParams.set('template', params.template);

	const url = `${PUBLIC_API_URL}/books/${bookId}/export/${params.format}${
		queryParams.toString() ? '?' + queryParams.toString() : ''
	}`;

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({
				error: 'Export failed',
				code: `HTTP_${response.status}`
			}));
			return { error: errorData };
		}

		const blob = await response.blob();
		return { data: blob };
	} catch (err) {
		return {
			error: {
				error: err instanceof Error ? err.message : 'Export failed',
				code: 'NETWORK_ERROR'
			}
		};
	}
}

/**
 * Download CSV import template
 */
export async function downloadImportTemplate(bookId: string): Promise<ApiResult<Blob>> {
	const token = tokenStorage.getAccessToken();
	if (!token) {
		return { error: { error: 'Not authenticated', code: 'UNAUTHORIZED' } };
	}

	try {
		const response = await fetch(
			`${PUBLIC_API_URL}/books/${bookId}/import/template`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({
				error: 'Failed to download template',
				code: `HTTP_${response.status}`
			}));
			return { error: errorData };
		}

		const blob = await response.blob();
		return { data: blob };
	} catch (err) {
		return {
			error: {
				error: err instanceof Error ? err.message : 'Download failed',
				code: 'NETWORK_ERROR'
			}
		};
	}
}

/**
 * Validate CSV file before import
 */
export async function validateImport(
	bookId: string,
	file: File,
	columnMapping?: Record<string, string>,
	options?: Partial<ImportOptions>
): Promise<ApiResult<ImportValidationResponse>> {
	const token = tokenStorage.getAccessToken();
	if (!token) {
		return { error: { error: 'Not authenticated', code: 'UNAUTHORIZED' } };
	}

	// Convert file to base64
	const fileBase64 = await fileToBase64(file);

	const body = {
		file: fileBase64,
		column_mapping: columnMapping || {},
		options: {
			skip_duplicates: options?.skipDuplicates || false,
			create_categories: options?.createCategories || false,
			create_pockets: options?.createPockets || false,
			default_category_id: options?.defaultCategoryId,
			timezone: options?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
		}
	};

	try {
		const response = await fetch(
			`${PUBLIC_API_URL}/books/${bookId}/import/validate`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(body)
			}
		);

		const data = await response.json();

		if (!response.ok) {
			return { error: data };
		}

		return { data: transformValidationResponse(data) };
	} catch (err) {
		return {
			error: {
				error: err instanceof Error ? err.message : 'Validation failed',
				code: 'NETWORK_ERROR'
			}
		};
	}
}

/**
 * Execute import with conflict resolutions
 */
export async function executeImport(
	bookId: string,
	request: ImportExecuteRequest
): Promise<ApiResult<ImportResult>> {
	const token = tokenStorage.getAccessToken();
	if (!token) {
		return { error: { error: 'Not authenticated', code: 'UNAUTHORIZED' } };
	}

	const body = {
		job_id: request.jobId,
		conflict_resolutions: request.conflictResolutions.map((r) => ({
			conflict_id: r.conflictId,
			rows: r.rows,
			field: r.field,
			resolution: r.resolution,
			selected_id: r.selectedId,
			create_name: r.createName
		}))
	};

	try {
		const response = await fetch(`${PUBLIC_API_URL}/books/${bookId}/import`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify(body)
		});

		const data = await response.json();

		if (!response.ok) {
			return { error: data };
		}

		return { data: transformImportResult(data) };
	} catch (err) {
		return {
			error: {
				error: err instanceof Error ? err.message : 'Import failed',
				code: 'NETWORK_ERROR'
			}
		};
	}
}

/**
 * Get import history for a book
 */
export async function getImportHistory(
	bookId: string,
	limit = 10,
	offset = 0
): Promise<ApiResult<ImportHistoryItem[]>> {
	const token = tokenStorage.getAccessToken();
	if (!token) {
		return { error: { error: 'Not authenticated', code: 'UNAUTHORIZED' } };
	}

	try {
		const response = await fetch(
			`${PUBLIC_API_URL}/books/${bookId}/import/history?limit=${limit}&offset=${offset}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		const data = await response.json();

		if (!response.ok) {
			return { error: data };
		}

		return { data: data.map(transformHistoryItem) };
	} catch (err) {
		return {
			error: {
				error: err instanceof Error ? err.message : 'Failed to load history',
				code: 'NETWORK_ERROR'
			}
		};
	}
}

/**
 * Rollback an import
 */
export async function rollbackImport(
	bookId: string,
	importId: string
): Promise<ApiResult<{ message: string }>> {
	const token = tokenStorage.getAccessToken();
	if (!token) {
		return { error: { error: 'Not authenticated', code: 'UNAUTHORIZED' } };
	}

	try {
		const response = await fetch(
			`${PUBLIC_API_URL}/books/${bookId}/import/${importId}/rollback`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);

		const data = await response.json();

		if (!response.ok) {
			return { error: data };
		}

		return { data };
	} catch (err) {
		return {
			error: {
				error: err instanceof Error ? err.message : 'Rollback failed',
				code: 'NETWORK_ERROR'
			}
		};
	}
}

// Helper functions

async function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const base64 = (reader.result as string).split(',')[1];
			resolve(base64);
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

function transformValidationResponse(data: Record<string, unknown>): ImportValidationResponse {
	return {
		jobId: data.job_id as string,
		valid: data.valid as boolean,
		totalRows: data.total_rows as number,
		validRows: data.valid_rows as number,
		errors: (data.errors as unknown[])?.map((e: unknown) => {
			const err = e as Record<string, unknown>;
			return {
				row: err.row as number,
				column: err.column as string | undefined,
				code: err.code as string,
				value: err.value as string | undefined,
				message: err.message as string,
				suggestions: err.suggestions as string[] | undefined
			};
		}),
		warnings: (data.warnings as unknown[])?.map((w: unknown) => {
			const warn = w as Record<string, unknown>;
			return {
				row: warn.row as number,
				code: warn.code as string,
				message: warn.message as string
			};
		}),
		conflicts: (data.conflicts as unknown[])?.map((c: unknown) => {
			const conflict = c as Record<string, unknown>;
			return {
				id: conflict.id as string,
				rows: conflict.rows as number[],
				field: conflict.field as string,
				conflictType: conflict.conflict_type as string,
				value: conflict.value as string,
				message: conflict.message as string,
				options: (conflict.options as unknown[])?.map((o: unknown) => {
					const opt = o as Record<string, unknown>;
					return {
						id: opt.id as string,
						label: opt.label as string,
						type: opt.type as string,
						extra: opt.extra as string | undefined
					};
				}) || []
			};
		}),
		preview: (data.preview as unknown[])?.map((p: unknown) => {
			const row = p as Record<string, unknown>;
			return {
				row: row.row as number,
				date: row.date as string,
				name: row.name as string,
				type: row.type as string,
				amount: row.amount as number,
				pocketName: row.pocket_name as string,
				category: row.category as string | undefined,
				description: row.description as string | undefined
			};
		})
	};
}

function transformImportResult(data: Record<string, unknown>): ImportResult {
	return {
		jobId: data.job_id as string,
		status: data.status as ImportResult['status'],
		totalRows: data.total_rows as number,
		importedRows: data.imported_rows as number,
		skippedRows: data.skipped_rows as number,
		completedAt: data.completed_at as string | undefined,
		rollbackUntil: data.rollback_until as string | undefined
	};
}

function transformHistoryItem(data: Record<string, unknown>): ImportHistoryItem {
	return {
		id: data.id as string,
		fileName: data.file_name as string,
		status: data.status as ImportHistoryItem['status'],
		totalRows: data.total_rows as number,
		importedRows: data.imported_rows as number,
		createdAt: data.created_at as string,
		completedAt: data.completed_at as string | undefined,
		rollbackUntil: data.rollback_until as string | undefined,
		canRollback: data.can_rollback as boolean
	};
}

/**
 * Trigger browser download of a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
