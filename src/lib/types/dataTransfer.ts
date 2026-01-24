/**
 * Data transfer (import/export) type definitions
 */

// Export types
export type ExportFormat = 'csv' | 'pdf' | 'xlsx';

export interface ExportParams {
	format: ExportFormat;
	startDate?: string;
	endDate?: string;
	categoryId?: string;
	type?: 'income' | 'expense' | 'transfer';
	template?: 'monthly_statement' | 'expense_report' | 'annual_summary';
}

// Import types
export type ImportStatus = 
	| 'pending' 
	| 'validating' 
	| 'conflicts' 
	| 'importing' 
	| 'completed' 
	| 'failed' 
	| 'rolled_back';

export interface ImportOptions {
	skipDuplicates: boolean;
	createCategories: boolean;
	createPockets: boolean;
	defaultCategoryId?: string;
	timezone?: string;
}

export interface ImportError {
	row: number;
	column?: string;
	code: string;
	value?: string;
	message: string;
	suggestions?: string[];
}

export interface ImportWarning {
	row: number;
	code: string;
	message: string;
}

export interface ConflictOption {
	id: string;
	label: string;
	type: string;
	extra?: string;
}

export interface ImportConflict {
	id: string;
	rows: number[];
	field: string;
	conflictType: string;
	value: string;
	message: string;
	options: ConflictOption[];
}

export interface ImportPreviewRow {
	row: number;
	date: string;
	name: string;
	type: string;
	amount: number;
	pocketName: string;
	category?: string;
	description?: string;
}

export interface ImportValidationResponse {
	jobId: string;
	valid: boolean;
	totalRows: number;
	validRows: number;
	errors?: ImportError[];
	warnings?: ImportWarning[];
	conflicts?: ImportConflict[];
	preview?: ImportPreviewRow[];
}

export interface ConflictResolution {
	conflictId: string;
	rows: number[];
	field: string;
	resolution: 'select' | 'skip' | 'create' | 'first';
	selectedId?: string;
	createName?: string;
}

export interface ImportExecuteRequest {
	jobId: string;
	conflictResolutions: ConflictResolution[];
}

export interface ImportResult {
	jobId: string;
	status: ImportStatus;
	totalRows: number;
	importedRows: number;
	skippedRows: number;
	completedAt?: string;
	rollbackUntil?: string;
}

export interface ImportHistoryItem {
	id: string;
	fileName: string;
	status: ImportStatus;
	totalRows: number;
	importedRows: number;
	createdAt: string;
	completedAt?: string;
	rollbackUntil?: string;
	canRollback: boolean;
}
