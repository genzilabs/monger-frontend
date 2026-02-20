import { booksStore } from "$lib/stores";
import { get } from "svelte/store";
import { redirect } from "@sveltejs/kit";

export const load = async ({ params }) => {
    const bookId = params.id;
    if (!bookId) {
        throw redirect(302, "/dashboard");
    }

    // Since we're in SPA mode, we just need to ensure the store is populated before render.
    // the layout.ts above already ensures auth, so we just check books.
    if (booksStore.activeBook?.id === bookId) {
        return { loadedBookId: bookId };
    }

    try {
        // Trigger load
        const success = await booksStore.setActiveBookById(bookId);
        if (!success) {
            throw redirect(302, "/dashboard");
        }
    } catch {
        throw redirect(302, "/dashboard");
    }

    return { loadedBookId: bookId };
};
