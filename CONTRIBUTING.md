# Como Contribuir - Portal Institucional Ômega

Obrigado por se interessar em contribuir para o Portal Institucional Ômega. Este documento estabelece diretrizes para o versionamento e envio de código.

## 1. Controle de Versionamento com Git e GitHub

O projeto utiliza o fluxo de trabalho **Git Flow** ou baseado em ramificações (Branch Based Workflow).

### 1.1 Ramificações (Branches) Padrão
- **`main`**: Possui o código unificado de produção, deve estar sempre estável.
- **`develop`**: Ramificação principal de desenvolvimento. Onde todas as *features* se integram antes de irem para `main`.
- **`feature/<nome>`**: Criada a partir da `develop`. Serve para construir novas funcionalidades (ex: `feature/catalogo-cursos`).
- **`bugfix/<nome>`**: Criada para corrigir erros de regras ou UI (ex: `bugfix/menu-responsivo`).
- **`hotfix/<nome>`**: Criada a partir da `main` em casos urgentes em produção.

## 2. Padrões de Mensagem de Commit

Este projeto adota o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0-beta.4/):
- `feat:` Nova funcionalidade (`feat: adicionado formulario de contato base`)
- `fix:` Correção de bug (`fix: correção do link quebrado no footer`)
- `docs:` Apenas atualização de documentação (`docs: atualizado README.md com fluxo`)
- `style:` Formatações, ponto e vírgula, espaços (sem impacto lógico)
- `refactor:` Alterações no código que não adicionam ou removem features nem consertam bugs
- `test:` Testes novos ou existentes
- `chore:` Tarefas rotineiras, atualizações de dependências (`chore: add package.json`)

## 3. Fluxo e Comandos Úteis

### 3.1 Clonando o Repositório
Para sua máquina:
```bash
git clone https://github.com/SuaInstituicao/portal-omega.git
cd portal-omega
```

### 3.2 Iniciando Nova Funcionalidade (Feature)
Sempre atualize primeiro e crie a *branch*:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/pagina-sobre
```

### 3.3 Salvando Suas Alterações (Commit)
Após terminar parte ou totalmente a tarefa na sua *branch*:
```bash
# Verifica as alterações
git status

# Adiciona arquivos para stage (estado de preparo)
git add src/pages/sobre.html src/assets/css/sobre.css

# Faz o commit usando Conventional Commits
git commit -m "feat: criação da página sobre nós responsiva"
```

### 3.4 Enviando suas Alterações para o GitHub (Push)
```bash
git push origin feature/pagina-sobre
```

### 3.5 Fluxo Completo para Inserir sua *Feature* (Pull Request)
1. Após rodar o comando `push`, acesse o repositório no GitHub.
2. Você verá um botão "Compare & pull request".
3. Crie um Pull Request (PR) selecionando como destino (**base**) a branch `develop`.
4. Um administrador fará a revisão e os testes de UI do código.
5. Se aprovado, o código será fundido (*merged*) para a `develop`.

## 4. Boas Práticas
- Evite *commits* grandes: divida seu código de forma atômica (ex: "feat: banner.js" e dps "feat: header.js", e não apenas "feat: adicionado todos js").
- Comente o seu código CSS e JS onde for complexo.
- Mantenha variáveis de ambiente no arquivo `.env` (quando formos usar APIs) e **nunca** versione credenciais sensíveis. O arquivo padrão é o `.env.example`.
