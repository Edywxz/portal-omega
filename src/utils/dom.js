export const createElement = (tagName, className = "", text) => {
    const element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
};

export const setText = (selector, value) => {
    const element = document.querySelector(selector);

    if (element) {
        element.textContent = value;
    }
};

export const renderDefinitionList = (selector, items) => {
    const list = document.querySelector(selector);

    if (!list) {
        return;
    }

    list.replaceChildren();

    items.forEach(({ label, value }) => {
        list.append(createElement("dt", "", label), createElement("dd", "", value));
    });
};
