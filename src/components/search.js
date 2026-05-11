export const initSearch = () => {
    const searchForm = document.querySelector(".search-form");

    searchForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = searchForm.querySelector("input");

        if (!input?.value.trim()) {
            input?.focus();
            return;
        }

        window.alert(`Busca simulada por: ${input.value.trim()}`);
    });
};
