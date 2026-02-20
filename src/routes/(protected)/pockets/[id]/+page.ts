import { booksStore, transactionsStore } from "$lib/stores";
import { redirect } from "@sveltejs/kit";

export const load = async ({ params }) => {
    const pocketId = params.id;
    if (!pocketId) {
        throw redirect(302, "/pockets");
    }

    // Try finding the pocket in current store
    let pocket = booksStore.pockets.find((p) => p.id === pocketId);

    // If not found but book active, try refresh
    if (!pocket && booksStore.activeBook) {
        await booksStore.loadPockets(booksStore.activeBook.id);
        pocket = booksStore.pockets.find((p) => p.id === pocketId);
    }

    // Still no pocket? Redirect
    if (!pocket) {
        throw redirect(302, "/pockets");
    }

    // Start loading transactions (can be awaited here or let it run async)
    // Awaiting ensures SSR/state is fully populated before render
    await transactionsStore.loadByPocket(pocketId);

    return { loadedPocketId: pocketId };
};
