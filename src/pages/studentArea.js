import { initPageTransition, navigateToPage } from "../components/pageTransition.js";
import { createElement, renderDefinitionList, setText } from "../utils/dom.js";
import { clearStudent, readStudent } from "../services/studentSessionService.js";
import { getStatusClass } from "../services/studentMockService.js";

const MONTHS = [
    "Janeiro",
    "Fevereiro",
    "Marco",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const CALENDAR_YEAR = 2026;

const renderMetrics = (student) => {
    const metrics = document.querySelector("#student-metrics");

    if (!metrics) {
        return;
    }

    const items = [
        { label: "Frequencia", value: student.frequency },
        { label: "Progresso", value: student.progress },
        { label: "Disciplinas", value: String(student.disciplineCount) },
        { label: "Pendencias", value: String(student.pendingCount) }
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

const createCalendarEvents = (student) => [
    ...student.history.map((item) => ({ ...item, source: "Histórico" })),
    ...student.deadlines.map((item) => ({ ...item, source: "Agenda" }))
];

const getInitialMonth = (events) => {
    const pendingEvent = events.find((item) => item.source === "Agenda" && item.status !== "Concluido");

    return pendingEvent?.monthIndex ?? 0;
};

const renderSelectedEvent = (container, event) => {
    const detail = container.querySelector(".calendar-detail");

    if (!detail || !event) {
        return;
    }

    const status = createElement("span", `status-pill ${getStatusClass(event.status)}`, event.status);
    const meta = createElement("span", "calendar-type", `${event.source} - ${event.type}`);

    detail.replaceChildren(
        meta,
        createElement("h3", "", event.title),
        createElement("p", "", `${event.day} de ${event.month} - ${event.description}`),
        status
    );
};

const renderCalendarMonth = (container, events, monthIndex) => {
    const title = container.querySelector(".calendar-month-title");
    const grid = container.querySelector(".calendar-table-body");
    const monthEvents = events.filter((item) => item.monthIndex === monthIndex);
    const selectedEvent = monthEvents[0] || events[0];
    const firstWeekday = new Date(CALENDAR_YEAR, monthIndex, 1).getDay();
    const daysInMonth = new Date(CALENDAR_YEAR, monthIndex + 1, 0).getDate();
    const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    title.textContent = `${MONTHS[monthIndex]} ${CALENDAR_YEAR}`;
    grid.replaceChildren();

    for (let cellIndex = 0; cellIndex < totalCells; cellIndex += 1) {
        const day = cellIndex - firstWeekday + 1;
        const cell = createElement("div", "calendar-cell");

        if (day < 1 || day > daysInMonth) {
            cell.classList.add("is-empty");
            grid.append(cell);
            continue;
        }

        const dayEvents = monthEvents.filter((item) => Number(item.day) === day);
        cell.append(createElement("span", "calendar-day-number", String(day)));

        dayEvents.forEach((event) => {
            const eventButton = createElement("button", "calendar-event-button", event.source);
            eventButton.type = "button";
            eventButton.addEventListener("click", () => renderSelectedEvent(container, event));
            cell.append(eventButton);
        });

        if (dayEvents.length > 0) {
            cell.classList.add("has-event");
        }

        grid.append(cell);
    }

    renderSelectedEvent(container, selectedEvent);
};

const renderAcademicCalendar = (selector, student) => {
    const calendar = document.querySelector(selector);

    if (!calendar) {
        return;
    }

    const events = createCalendarEvents(student);
    let currentMonthIndex = getInitialMonth(events);
    const controls = createElement("div", "calendar-controls");
    const previousButton = createElement("button", "calendar-nav-button", "Anterior");
    const nextButton = createElement("button", "calendar-nav-button", "Próximo");
    const title = createElement("strong", "calendar-month-title");
    const weekdays = createElement("div", "calendar-weekdays");
    const body = createElement("div", "calendar-table-body");
    const detail = createElement("div", "calendar-detail");

    calendar.replaceChildren();
    previousButton.type = "button";
    nextButton.type = "button";

    WEEKDAYS.forEach((weekday) => {
        weekdays.append(createElement("span", "", weekday));
    });

    previousButton.addEventListener("click", () => {
        currentMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;
        renderCalendarMonth(calendar, events, currentMonthIndex);
    });

    nextButton.addEventListener("click", () => {
        currentMonthIndex = currentMonthIndex === 11 ? 0 : currentMonthIndex + 1;
        renderCalendarMonth(calendar, events, currentMonthIndex);
    });

    controls.append(previousButton, title, nextButton);
    calendar.append(controls, weekdays, body, detail);
    renderCalendarMonth(calendar, events, currentMonthIndex);
};

const renderPendingDeadlines = (selector, items) => {
    const list = document.querySelector(selector);

    if (!list) {
        return;
    }

    const pendingItems = items.filter((item) => item.status !== "Concluido");

    list.replaceChildren();

    if (pendingItems.length === 0) {
        list.append(createElement("p", "empty-state", "Nenhum prazo pendente no momento."));
        return;
    }

    pendingItems.forEach((item) => {
        const row = createElement("div", "timeline-item deadline-item");
        const copy = createElement("div");
        const title = createElement("strong", "", item.title);
        const meta = createElement("span", "", `${item.date} - ${item.type}`);
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
    renderAcademicCalendar("#history-list", student);
    renderPendingDeadlines("#deadline-list", student.deadlines);
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
