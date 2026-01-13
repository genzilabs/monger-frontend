/**
 * Collaboration API service
 */

import { apiClient } from './client';
import type {
	Invitation,
	InvitationsListResponse,
	InviteRequest,
	BookMember,
	MembersListResponse,
	UpdateMemberRequest,
	TransferOwnershipRequest,
	PendingTransfer,
	PendingTransfersListResponse,
	CreateP2PTransferRequest,
	AcceptP2PTransferRequest
} from '$lib/types/collaboration';

export const collaborationApi = {
	// ============ Invitations ============

	/**
	 * List pending invitations for current user
	 */
	listInvitations() {
		return apiClient.get<InvitationsListResponse>('/invitations', true);
	},

	/**
	 * Accept an invitation
	 */
	acceptInvitation(invitationId: string) {
		return apiClient.post<{ message: string }>(`/invitations/${invitationId}/accept`, {}, true);
	},

	/**
	 * Reject an invitation
	 */
	rejectInvitation(invitationId: string) {
		return apiClient.post<{ message: string }>(`/invitations/${invitationId}/reject`, {}, true);
	},

	/**
	 * Cancel an invitation (inviter only)
	 */
	cancelInvitation(invitationId: string) {
		return apiClient.delete(`/invitations/${invitationId}`, true);
	},

	// ============ Book Collaboration ============

	/**
	 * Invite a user to a book
	 */
	inviteToBook(bookId: string, data: InviteRequest) {
		return apiClient.post<Invitation>(`/books/${bookId}/invite`, data, true);
	},

	/**
	 * List book members
	 */
	listBookMembers(bookId: string) {
		return apiClient.get<MembersListResponse>(`/books/${bookId}/members`, true);
	},

	/**
	 * Update a book member's role
	 */
	updateBookMember(bookId: string, userId: string, data: UpdateMemberRequest) {
		return apiClient.patch<{ message: string }>(`/books/${bookId}/members/${userId}`, data, true);
	},

	/**
	 * Remove a member from a book
	 */
	removeBookMember(bookId: string, userId: string) {
		return apiClient.delete(`/books/${bookId}/members/${userId}`, true);
	},

	/**
	 * Leave a book
	 */
	leaveBook(bookId: string) {
		return apiClient.post<{ message: string }>(`/books/${bookId}/leave`, {}, true);
	},

	/**
	 * Transfer book ownership
	 */
	transferBookOwnership(bookId: string, data: TransferOwnershipRequest) {
		return apiClient.post<{ message: string }>(`/books/${bookId}/transfer-ownership`, data, true);
	},

	// ============ Pocket Collaboration ============

	/**
	 * Invite a user to a pocket
	 */
	inviteToPocket(pocketId: string, data: InviteRequest) {
		return apiClient.post<Invitation>(`/pockets/${pocketId}/invite`, data, true);
	},

	// ============ P2P Transfers ============

	/**
	 * Create a P2P transfer
	 */
	createP2PTransfer(data: CreateP2PTransferRequest) {
		return apiClient.post<PendingTransfer>('/p2p-transfers', data, true);
	},

	/**
	 * List pending P2P transfers
	 */
	listP2PTransfers(type?: 'sent' | 'received') {
		const query = type ? `?type=${type}` : '';
		return apiClient.get<PendingTransfersListResponse>(`/p2p-transfers${query}`, true);
	},

	/**
	 * Accept a P2P transfer
	 */
	acceptP2PTransfer(transferId: string, data: AcceptP2PTransferRequest) {
		return apiClient.post<{ message: string }>(`/p2p-transfers/${transferId}/accept`, data, true);
	},

	/**
	 * Reject a P2P transfer
	 */
	rejectP2PTransfer(transferId: string) {
		return apiClient.post<{ message: string }>(`/p2p-transfers/${transferId}/reject`, {}, true);
	},

	/**
	 * Cancel a P2P transfer (sender only)
	 */
	cancelP2PTransfer(transferId: string) {
		return apiClient.post<{ message: string }>(`/p2p-transfers/${transferId}/cancel`, {}, true);
	}
};
