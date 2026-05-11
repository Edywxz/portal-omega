import { initPageTransition, navigateToPage } from "../components/pageTransition.js";
import { createStudentMock } from "../services/studentMockService.js";
import { saveStudent } from "../services/studentSessionService.js";

const initLogin = () => {
    const form = document.querySelector("#student-login-form");
    const error = document.querySelector("#login-error");
    const nameInput = document.querySelector("#student-name");
    const passwordInput = document.querySelector("#student-password");
    const submitButton = form?.querySelector("button[type='submit']");

    form?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (form.classList.contains("is-submitting")) {
            return;
        }

        const name = nameInput?.value.trim() || "";
        const password = passwordInput?.value.trim() || "";

        if (!name || !password) {
            if (error) {
                error.textContent = "Informe nome e senha para acessar a area do estudante.";
            }

            if (!name) {
                nameInput?.focus();
            } else {
                passwordInput?.focus();
            }

            return;
        }

        saveStudent(createStudentMock(name, password));

        if (error) {
            error.textContent = "";
        }

        form.classList.add("is-submitting");
        submitButton?.setAttribute("disabled", "true");
        navigateToPage("area-estudante.html");
    });
};

initPageTransition();
initLogin();
