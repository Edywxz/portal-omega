import { initNavigation } from "../components/navigation.js";
import { initPageTransition } from "../components/pageTransition.js";
import { initReveal } from "../components/reveal.js";
import { initSearch } from "../components/search.js";
import { contactChannels } from "../services/portalContentService.js";
import { saveContactMessage } from "../services/contactService.js";
import { createElement } from "../utils/dom.js";

const getField = (form, name) => form.elements.namedItem(name);

const setMessage = (element, message, type = "success") => {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `form-status ${type}`;
};

const initContactForm = () => {
    const form = document.querySelector("#contact-form");
    const status = document.querySelector("#contact-status");

    form?.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = getField(form, "name")?.value.trim() || "";
        const email = getField(form, "email")?.value.trim() || "";
        const audience = getField(form, "audience")?.value || "";
        const subject = getField(form, "subject")?.value.trim() || "";
        const message = getField(form, "message")?.value.trim() || "";

        if (!name || !email || !audience || !subject || !message) {
            setMessage(status, "Preencha todos os campos para enviar sua mensagem.", "error");
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            setMessage(status, "Informe um email valido para retorno.", "error");
            getField(form, "email")?.focus();
            return;
        }

        const savedMessage = saveContactMessage({ name, email, audience, subject, message });

        form.reset();
        setMessage(
            status,
            `Mensagem registrada localmente em ${new Date(savedMessage.createdAt).toLocaleString("pt-BR")}.`
        );
    });
};

const renderContactChannels = () => {
    const list = document.querySelector("#contact-channels");

    if (!list) {
        return;
    }

    list.replaceChildren();

    contactChannels.forEach((channel) => {
        list.append(createElement("dt", "", channel.label), createElement("dd", "", channel.value));
    });
};

initPageTransition();
initNavigation();
initReveal();
initSearch();
renderContactChannels();
initContactForm();
