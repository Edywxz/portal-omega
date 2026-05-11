import { initNavigation } from "../components/navigation.js";
import { initPageTransition } from "../components/pageTransition.js";
import { initReveal } from "../components/reveal.js";
import { initSearch } from "../components/search.js";
import { news } from "../services/portalContentService.js";
import { createElement } from "../utils/dom.js";

const renderNews = () => {
    const list = document.querySelector("#news-list");

    if (!list) {
        return;
    }

    list.replaceChildren();

    news.forEach((item) => {
        const card = createElement("article", "catalog-card reveal");

        card.append(
            createElement("span", "pill", item.category),
            createElement("h2", "", item.title),
            createElement("strong", "catalog-meta", item.date),
            createElement("p", "", item.summary)
        );
        list.append(card);
    });
};

initPageTransition();
initNavigation();
initSearch();
renderNews();
initReveal();
