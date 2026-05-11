import { formatName, slugify } from "../utils/formatters.js";
import { createRng, decimalBetween, hashString, numberBetween, pick } from "../utils/random.js";

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

    return `${first}.${last}${suffix}@aluno.omega.edu.gov.br`;
};

export const getDisciplineStatus = (grade, absences) => {
    if (grade >= 7 && absences <= 8) {
        return "Regular";
    }

    if (grade < 5 || absences > 12) {
        return "Atencao";
    }

    return "Em acompanhamento";
};

export const getStatusClass = (status) => {
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

const createHistory = (rng) => [1, 2, 3].map((offset) => ({
    term: `${OMEGA_ACADEMIC_YEAR - Math.ceil(offset / 2)}.${offset % 2 === 0 ? "2" : "1"}`,
    average: decimalBetween(6.8, 9.4, rng).toFixed(1),
    credits: numberBetween(18, 24, rng),
    status: pick(["Concluido", "Concluido", "Em validacao"], rng)
}));

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

export const createStudentMock = (name, password) => {
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
