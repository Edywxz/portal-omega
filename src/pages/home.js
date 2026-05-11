import { initNavigation } from "../components/navigation.js";
import { initPageTransition } from "../components/pageTransition.js";
import { initReveal } from "../components/reveal.js";

const initSearch = () => {
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

initPageTransition();
initNavigation();
initReveal();
initSearch();
