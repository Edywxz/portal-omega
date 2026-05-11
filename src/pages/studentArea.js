import { initPageTransition, navigateToPage } from "../components/pageTransition.js";
import { createElement, renderDefinitionList, setText } from "../utils/dom.js";
import { clearStudent, readStudent } from "../services/studentSessionService.js";
import { getStatusClass } from "../services/studentMockService.js";

const renderMetrics = (student) => {
    const metrics = document.querySelector("#student-metrics");

    if (!metrics) {
        return;
    }

    const items = [
        { label: "CR", value: student.cr },
        { label: "Frequencia", value: student.frequency },
        { label: "Progresso", value: student.progress },
        { label: "Creditos", value: String(student.credits) }
    ];

    metrics.replaceChildren();

    items.forEach((item) => {
        const card = createElement("div", "metric-card");
        card.append(createElement("span", "", item.label), createElement("strong", "", item.value));
        metrics.append(card);
    });
};

const renderDisciplines = (student) => {
    const tableBody = document.querySelector("#discipline-table-body");

    if (!tableBody) {
        return;
    }

    tableBody.replaceChildren();

    student.disciplines.forEach((discipline) => {
        const row = document.createElement("tr");
        const status = createElement("span", `status-pill ${getStatusClass(discipline.status)}`, discipline.status);
        const statusCell = document.createElement("td");

        statusCell.append(status);
        row.append(
            createElement("td", "", discipline.name),
            createElement("td", "", discipline.professor),
            createElement("td", "", discipline.schedule),
            createElement("td", "", discipline.grade.toFixed(1)),
            createElement("td", "", `${discipline.absences} faltas`),
            statusCell
        );
        tableBody.append(row);
    });
};

const renderTimeline = (selector, items, getMeta) => {
    const list = document.querySelector(selector);

    if (!list) {
        return;
    }

    list.replaceChildren();

    items.forEach((item) => {
        const row = createElement("div", "timeline-item");
        const copy = createElement("div");
        const title = createElement("strong", "", item.label || item.term);
        const meta = createElement("span", "", getMeta(item));
        const status = createElement("span", `status-pill ${getStatusClass(item.status)}`, item.status);

        copy.append(title, meta);
        row.append(copy, status);
        list.append(row);
    });
};

const initStudentArea = () => {
    const student = readStudent();

    if (!student) {
        navigateToPage("login.html");
        return;
    }

    setText("#student-greeting", `Ola, ${student.fullName}.`);
    setText("#student-summary", `${student.course} - ${student.period} - ${student.campus}`);
    setText("#student-status", student.academicStatus);
    setText("#student-register", `Matricula ${student.enrollment}`);

    renderDefinitionList("#student-data-list", [
        { label: "Nome completo", value: student.fullName },
        { label: "Email institucional", value: student.email },
        { label: "CPF mock", value: student.cpf },
        { label: "Matricula", value: student.enrollment },
        { label: "Curso principal", value: student.course },
        { label: "Periodo", value: student.period },
        { label: "Campus", value: student.campus },
        { label: "Situacao academica", value: student.academicStatus }
    ]);

    renderMetrics(student);
    renderDisciplines(student);
    renderTimeline("#history-list", student.history, (item) => `Media ${item.average} - ${item.credits} creditos`);
    renderTimeline("#deadline-list", student.deadlines, (item) => item.date);
    renderTimeline("#request-list", student.requests, (item) => item.protocol);
    renderDefinitionList("#finance-list", [
        { label: "Situacao", value: student.finance.status },
        { label: "Valor em aberto", value: student.finance.currentBill },
        { label: "Bolsa ativa", value: student.finance.scholarship },
        { label: "Vencimento", value: student.finance.dueDate }
    ]);

    document.querySelector("#logout-button")?.addEventListener("click", () => {
        clearStudent();
        navigateToPage("login.html");
    });
};

initPageTransition();
initStudentArea();
