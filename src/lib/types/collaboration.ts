/**
 * Collaboration type definitions
 */

// Roles and Permissions
export type CollaborationRole = 'owner' | 'viewer' | 'editor' | 'admin';
export type InvitationType = 'book' | 'pocket';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type P2PTransferStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';

// Book Member
export interface BookMember {
	id: string;
	book_id: string;
	user_id: string;
	role: CollaborationRole;
	can_add_transaction?: boolean;
	can_edit_transaction?: boolean;
	can_delete_transaction?: boolean;
	can_manage_wallet?: boolean;
	user_name?: string;
	user_email?: string;
	user_avatar?: string;
	joined_at: string;
}

// Pocket Member
export interface PocketMember {
	id: string;
	pocket_id: string;
	user_id: string;
	role: CollaborationRole;
	can_add_transaction?: boolean;
	can_edit_transaction?: boolean;
	can_delete_transaction?: boolean;
	user?: {
		id: string;
		name: string;
		email: string;
		avatar_url?: string;
	};
	created_at: string;
}

// Invitation
export interface Invitation {
	id: string;
	type: InvitationType;
	target_id: string;
	target_name?: string;
	inviter_name?: string;
	inviter_email?: string;
	inviter_avatar?: string;
	role: CollaborationRole;
	status: InvitationStatus;
	message?: string;
	created_at: string;
	expires_at?: string;
}

// Pending P2P Transfer
export interface PendingTransfer {
	id: string;
	sender_name?: string;
	sender_email?: string;
	sender_pocket_name?: string;
	recipient_email?: string;
	amount_cents: number;
	fee_cents: number;
	name: string;
	description?: string;
	status: P2PTransferStatus;
	created_at: string;
	expires_at?: string;
}

// Request types
export interface InviteRequest {
	email: string;
	role: CollaborationRole;
	can_add_transaction?: boolean;
	can_edit_transaction?: boolean;
	can_delete_transaction?: boolean;
	can_manage_wallet?: boolean;
	message?: string;
}

export interface UpdateMemberRequest {
	role: CollaborationRole;
	can_add_transaction?: boolean;
	can_edit_transaction?: boolean;
	can_delete_transaction?: boolean;
	can_manage_wallet?: boolean;
}

export interface TransferOwnershipRequest {
	new_owner_id: string;
}

export interface CreateP2PTransferRequest {
	sender_pocket_id: string;
	recipient_email: string;
	amount_cents: number;
	fee_cents?: number;
	name: string;
	description?: string;
}

export interface AcceptP2PTransferRequest {
	recipient_pocket_id: string;
}

// Response types
export interface InvitationsListResponse {
	invitations: Invitation[];
	total: number;
}

export interface MembersListResponse {
	members: BookMember[];
	total: number;
}

export interface PendingTransfersListResponse {
	sent: PendingTransfer[];
	received: PendingTransfer[];
}
