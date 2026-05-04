# Portal Institucional da Instituição Ômega

Bem-vindo ao repositório oficial do Portal Institucional Ômega. Este projeto foi desenvolvido durante a fase de **Levantamento de Requisitos e Arquitetura**.

## 1. Objetivo do Projeto
Desenvolver um portal institucional web responsivo para a instituição Ômega, visando centralizar informações acadêmicas, administrativas e institucionais, facilitando o acesso de alunos, professores, colaboradores e público externo.

O portal permite a divulgação de cursos, notícias, eventos acadêmicos, informações institucionais e serviços digitais, melhorando a comunicação entre a instituição e sua comunidade.

## 2. Justificativa
A presença digital é essencial para instituições educacionais modernas. O desenvolvimento deste portal institucional permitirá:
- Melhorar a comunicação com alunos e futuros estudantes;
- Divulgar cursos, eventos e notícias institucionais;
- Centralizar informações acadêmicas;
- Modernizar a presença digital da instituição;
- Facilitar o acesso a serviços online.

## 3. Entregas do Projeto
As principais entregas incluem:

### 3.1 Arquitetura do Sistema
- Definição da arquitetura através de uma estrutura hierárquica atômica;
- Uso de JavaScript Vanilla, HTML5 Semântico, Vanilla CSS;
- Ambiente integrado usando VS Code e GitHub.

### 3.2 Design e Interface
- Interface elegante e moderna, com tipografia, paletas de cores refinadas e responsividade de ponta (Desktop, tablet, mobile);
- Prototipação baseada nas telas projetadas.

### 3.3 Funcionalidades
- Página inicial institucional e Sobre a Instituição;
- Catálogo de cursos, calendário acadêmico, notícias, eventos;
- Formulário de contato;
- Estrutura escalável para futura Área Administrativa / CMS.

## 4. Estrutura Atômica de Pastas
```text
portal-omega/
├── src/
│   ├── assets/       # CSS, JS, Imagens, Fontes
│   ├── components/   # Headers, Footers, Cards (Componentes isolados)
│   ├── pages/        # Telas construídas com componentes
│   ├── services/     # Consumo de APIs (Mock ou reias)
│   └── utils/        # Funções de conversão e utilitários
├── public/           # Arquivos estáticos puros (favicon)
├── docs/             # Documentação adicional de requisitos
├── tests/            # Testes de unidade e E2E
├── scripts/          # Automações de build e deploy
└── index.html        # Arquivo de entrada do portal
```

## 5. Fora do Escopo
- Desenvolvimento de aplicativo mobile nativo;
- Sistemas acadêmicos completos (sistema de matrícula/notas);
- Integração com ERP institucionais pesados;
- Gestão de mídias sociais ou marketing;
- Manutenção evolutiva e suporte após entrega total.

## 6. Critérios de Aceitação
- Publicação online (utilizando serviços como Vercel);
- Design Responsivo e funcionamento de links/páginas base;
- Painel base permitindo a aprovação do stakeholder.

---

📖 **Guia de Contribuição:** Veja o arquivo [CONTRIBUTING.md](./CONTRIBUTING.md) para saber mais sobre regras de commits, versionamento e como interagir com o fluxo de Git do portal.
