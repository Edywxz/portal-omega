import { initNavigation } from "../components/navigation.js";
import { initPageTransition } from "../components/pageTransition.js";
import { initReveal } from "../components/reveal.js";
import { initSearch } from "../components/search.js";
import { events } from "../services/portalContentService.js";
import { createElement } from "../utils/dom.js";

const renderEvents = () => {
    const list = document.querySelector("#event-list");

    if (!list) {
        return;
    }

    list.replaceChildren();

    events.forEach((item) => {
        const card = createElement("article", "event-row reveal");
        const date = createElement("div", "event-row-date");

        date.append(createElement("strong", "", item.day), createElement("span", "", item.month));
        card.append(
            date,
            createElement("span", "pill", item.type),
            createElement("h2", "", item.title),
            createElement("p", "", item.summary)
        );
        list.append(card);
    });
};

initPageTransition();
initNavigation();
initSearch();
renderEvents();
initReveal();
