import { initNavigation } from "../components/navigation.js";
import { initPageTransition } from "../components/pageTransition.js";
import { initReveal } from "../components/reveal.js";
import { initSearch } from "../components/search.js";
import { courses } from "../services/portalContentService.js";
import { createElement } from "../utils/dom.js";

const renderCourses = () => {
    const list = document.querySelector("#course-list");

    if (!list) {
        return;
    }

    list.replaceChildren();

    courses.forEach((course) => {
        const card = createElement("article", "catalog-card reveal");
        const tagList = createElement("div", "tag-list");

        course.tags.forEach((tag) => {
            tagList.append(createElement("span", "", tag));
        });

        card.append(
            createElement("span", "pill", course.category),
            createElement("h2", "", course.name),
            createElement("p", "", course.summary),
            createElement("strong", "catalog-meta", `${course.duration} - ${course.modality}`),
            tagList
        );
        list.append(card);
    });
};

initPageTransition();
initNavigation();
initSearch();
renderCourses();
initReveal();
