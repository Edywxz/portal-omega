const OMEGA_STUDENT_STORAGE_KEY = "omegaStudentMock";
const OMEGA_ACADEMIC_YEAR = 2026;

const courseCatalog = [
    {
        name: "Sistemas de Informacao",
        disciplines: [
            "Algoritmos e Estruturas de Dados",
            "Banco de Dados Aplicado",
            "Engenharia de Software",
            "Redes de Computadores",
            "Experiencia do Usuario",
            "Projeto Integrador"
        ]
    },
    {
        name: "Administracao",
        disciplines: [
            "Gestao Estrategica",
            "Contabilidade Gerencial",
            "Marketing Aplicado",
            "Matematica Financeira",
            "Empreendedorismo",
            "Projeto Organizacional"
        ]
    },
    {
        name: "Pedagogia",
        disciplines: [
            "Didatica e Planejamento",
            "Psicologia da Educacao",
            "Politicas Educacionais",
            "Metodologias Ativas",
            "Alfabetizacao e Letramento",
            "Estagio Supervisionado"
        ]
    },
    {
        name: "Engenharia de Producao",
        disciplines: [
            "Calculo Aplicado",
            "Gestao da Qualidade",
            "Logistica e Operacoes",
            "Processos Industriais",
            "Pesquisa Operacional",
            "Projeto de Producao"
        ]
    },
    {
        name: "Analise e Desenvolvimento de Sistemas",
        disciplines: [
            "Programacao Web",
            "Arquitetura de Sistemas",
            "Seguranca da Informacao",
            "Modelagem de Dados",
            "Computacao em Nuvem",
            "Desenvolvimento Mobile"
        ]
    }
];

const campuses = [
    "Campus Centro",
    "Campus Norte",
    "Campus Digital",
    "Unidade Paulista",
    "Polo Integrado Omega"
];

const professors = [
    "Marina Lopes",
    "Carlos Mendes",
    "Helena Rocha",
    "Bruno Almeida",
    "Patricia Nunes",
    "Rafael Torres",
    "Daniela Martins",
    "Andre Vieira"
];

const requestTypes = [
    "Declaracao de matricula",
    "Revisao de nota",
    "Aproveitamento de estudos",
    "Segunda via de boleto",
    "Atualizacao cadastral"
];

const formatName = (value) => value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const slugify = (value) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "");

const hashString = (value) => {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
};

const createRng = (seed) => {
    let value = seed >>> 0;

    return () => {
        value += 0x6D2B79F5;
        let mixed = value;
        mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
        mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
        return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
};

const pick = (items, rng) => items[Math.floor(rng() * items.length)];

const numberBetween = (min, max, rng) => Math.floor(rng() * (max - min + 1)) + min;

const decimalBetween = (min, max, rng) => Number((rng() * (max - min) + min).toFixed(1));

const createCpf = (rng) => {
    const digits = [String(numberBetween(1, 9, rng))];

    while (digits.length < 11) {
        digits.push(String(numberBetween(0, 9, rng)));
    }

    return `${digits.slice(0, 3).join("")}.${digits.slice(3, 6).join("")}.${digits.slice(6, 9).join("")}-${digits.slice(9).join("")}`;
};

const createEmail = (fullName, rng) => {
    const parts = fullName.split(" ");
    const first = slugify(parts[0] || "aluno") || "aluno";
    const last = slugify(parts.length > 1 ? parts[parts.length - 1] : "omega") || "omega";
    const suffix = numberBetween(100, 999, rng);

    return `${first}.${last}${suffix}@aluno.omega.edu.br`;
};

const getDisciplineStatus = (grade, absences) => {
    if (grade >= 7 && absences <= 8) {
        return "Regular";
    }

    if (grade < 5 || absences > 12) {
        return "Atencao";
    }

    return "Em acompanhamento";
};

const getStatusClass = (status) => {
    if (status === "Regular" || status === "Quitado" || status === "Concluido") {
        return "status-good";
    }

    if (status === "Atencao" || status === "Pendente") {
        return "status-risk";
    }

    return "status-watch";
};

const createDisciplines = (catalog, rng) => {
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex"];
    const shifts = ["08:00 - 09:40", "10:00 - 11:40", "19:00 - 20:40", "20:50 - 22:30"];
    const count = numberBetween(5, 6, rng);

    return catalog.disciplines.slice(0, count).map((name) => {
        const grade = decimalBetween(4.2, 9.8, rng);
        const absences = numberBetween(0, 16, rng);
        const workload = pick([40, 60, 80], rng);
        const status = getDisciplineStatus(grade, absences);

        return {
            name,
            professor: pick(professors, rng),
            schedule: `${pick(days, rng)} ${pick(shifts, rng)}`,
            grade,
            absences,
            workload,
            status
        };
    });
};

const createHistory = (rng) => {
    return [1, 2, 3].map((offset) => ({
        term: `${OMEGA_ACADEMIC_YEAR - Math.ceil(offset / 2)}.${offset % 2 === 0 ? "2" : "1"}`,
        average: decimalBetween(6.8, 9.4, rng).toFixed(1),
        credits: numberBetween(18, 24, rng),
        status: pick(["Concluido", "Concluido", "Em validacao"], rng)
    }));
};

const createDeadlines = (rng) => {
    const items = [
        "Entrega de atividades avaliativas",
        "Renovacao de matricula",
        "Semana de provas",
        "Solicitacao de documentos",
        "Encontro com coordenacao"
    ];
    const months = ["Maio", "Junho", "Julho", "Agosto"];

    return items.slice(0, 4).map((label) => ({
        label,
        date: `${numberBetween(6, 28, rng)} de ${pick(months, rng)}`,
        status: pick(["Aberto", "Em breve", "Prioritario"], rng)
    }));
};

const createRequests = (rng) => requestTypes.slice(0, 4).map((label) => ({
    label,
    protocol: `OMG-${numberBetween(10000, 99999, rng)}`,
    status: pick(["Concluido", "Em analise", "Pendente"], rng)
}));

const createStudentMock = (name, password) => {
    const fullName = formatName(name);
    const seed = hashString(`${fullName.toLowerCase()}|${password}`);
    const rng = createRng(seed);
    const catalog = pick(courseCatalog, rng);
    const disciplines = createDisciplines(catalog, rng);
    const average = disciplines.reduce((total, item) => total + item.grade, 0) / disciplines.length;
    const totalAbsences = disciplines.reduce((total, item) => total + item.absences, 0);
    const totalWorkload = disciplines.reduce((total, item) => total + item.workload, 0);
    const frequency = Math.max(0, Math.round(100 - ((totalAbsences * 2) / totalWorkload) * 100));
    const period = `${numberBetween(1, 8, rng)}o periodo`;
    const enrollmentYear = numberBetween(2021, OMEGA_ACADEMIC_YEAR, rng);
    const enrollment = `${enrollmentYear}${numberBetween(1, 2, rng)}${numberBetween(10000, 99999, rng)}`;
    const financialStatus = pick(["Quitado", "Quitado", "Pendente"], rng);

    return {
        fullName,
        email: createEmail(fullName, rng),
        cpf: createCpf(rng),
        enrollment,
        course: catalog.name,
        period,
        campus: pick(campuses, rng),
        academicStatus: average >= 7 && frequency >= 75 ? "Regular" : "Em acompanhamento",
        cr: average.toFixed(1),
        progress: `${numberBetween(38, 88, rng)}%`,
        frequency: `${frequency}%`,
        credits: totalWorkload,
        disciplines,
        history: createHistory(rng),
        deadlines: createDeadlines(rng),
        finance: {
            status: financialStatus,
            currentBill: financialStatus === "Quitado" ? "R$ 0,00" : `R$ ${numberBetween(580, 1420, rng)},00`,
            scholarship: `${pick([0, 10, 15, 20, 30, 40], rng)}%`,
            dueDate: `${numberBetween(5, 15, rng)} de Junho`
        },
        requests: createRequests(rng)
    };
};

const createElement = (tagName, className, text) => {
    const element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
};

const setText = (selector, value) => {
    const element = document.querySelector(selector);

    if (element) {
        element.textContent = value;
    }
};

const renderDefinitionList = (selector, items) => {
    const list = document.querySelector(selector);

    if (!list) {
        return;
    }

    list.replaceChildren();

    items.forEach(({ label, value }) => {
        list.append(createElement("dt", "", label), createElement("dd", "", value));
    });
};

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

const readStudent = () => {
    const rawStudent = sessionStorage.getItem(OMEGA_STUDENT_STORAGE_KEY);

    if (!rawStudent) {
        return null;
    }

    try {
        return JSON.parse(rawStudent);
    } catch (error) {
        sessionStorage.removeItem(OMEGA_STUDENT_STORAGE_KEY);
        return null;
    }
};

const navigateToPage = (url) => {
    if (window.OmegaPageTransition) {
        window.OmegaPageTransition.goTo(url);
        return;
    }

    window.location.href = url;
};

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

        const student = createStudentMock(name, password);
        sessionStorage.setItem(OMEGA_STUDENT_STORAGE_KEY, JSON.stringify(student));

        if (error) {
            error.textContent = "";
        }

        form.classList.add("is-submitting");
        submitButton?.setAttribute("disabled", "true");
        navigateToPage("area-estudante.html");
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
        sessionStorage.removeItem(OMEGA_STUDENT_STORAGE_KEY);
        navigateToPage("login.html");
    });
};

if (document.body?.dataset.page === "login") {
    initLogin();
}

if (document.body?.dataset.page === "student-area") {
    initStudentArea();
}
