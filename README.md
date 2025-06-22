# A Recreativa - Gerenciador Inteligente de Planos de Aula

 <!-- Sugestão: Tire um screenshot da sua aplicação funcionando e hospede no imgur.com para colocar aqui -->

## 📝 Visão Geral do Projeto

Este projeto é uma solução completa (Full Stack) desenvolvida como parte do **[Teste Técnico - A Recreativa](https://fast-moonstone-365.notion.site/Teste-t-cnico-A-Recreativa-0e432742e6884d568529ee6b9f6a3a87)**, proposto pela plataforma Studio MIA.

O objetivo é resolver um problema comum enfrentado por professores: a desorganização e falta de padronização de planos de aula. A plataforma permite que um professor:
1.  **Faça o upload** de seus planos de aula antigos nos formatos `.pdf` ou `.docx`.
2.  **Visualize** o conteúdo do documento original diretamente na tela.
3.  **Receba uma versão estruturada** do plano, com campos como "Objetivos", "Habilidades" e "Passo a Passo" preenchidos automaticamente por Inteligência Artificial (usando a API do Google Gemini).
4.  **Edite e refine** o conteúdo extraído.
5.  **Aprimore o plano com um clique**, solicitando à IA que detalhe e enriqueça as atividades e objetivos.
6.  **Gere um novo PDF moderno e padronizado**, pronto para ser usado.

### ✨ Funcionalidades Extras Implementadas

Para ir além do escopo básico, foram adicionadas funcionalidades que agregam grande valor à ferramenta:
*   **Extração de Dados com IA**: Utilização da API do **Google Gemini 2.0 Flash-Lite** para analisar o conteúdo dos documentos e preencher o formulário de forma inteligente, poupando tempo do professor.
*   **Aprimoramento com IA**: Uma funcionalidade "mágica" que pega o plano de aula já estruturado e usa a IA para sugerir melhorias, detalhar atividades e refinar objetivos pedagógicos.
*   **Testes Automatizados**: O backend possui uma suíte de testes completa com **Jest** para garantir a estabilidade e a qualidade do código.

## 🛠️ Tecnologias Utilizadas

O projeto segue a stack tecnológica solicitada, utilizando versões modernas das bibliotecas:

*   **Linguagem**: TypeScript
*   **Frontend**: Next.js (com App Router), React, Ant Design
*   **Backend**: Node.js, Express.js, Prisma ORM
*   **Banco de Dados**: SQLite
*   **Inteligência Artificial**: Google Gemini API
*   **Testes**: Jest, Supertest

## 📂 Estrutura de Pastas

O projeto está organizado em um monorepo com duas pastas principais:

-   `/backend`: Contém toda a lógica da API, comunicação com o banco de dados e serviços de IA.
-   `/frontend`: Contém a aplicação Next.js, responsável pela interface do usuário.

Cada pasta possui seu próprio `README.md` com instruções técnicas detalhadas.

## 🚀 Como Rodar o Projeto Completo

Para executar a aplicação localmente, você precisará ter o **Node.js** (v18 ou superior) e o **npm** instalados.

### 1. Clone o Repositório
```bash
git clone https://github.com/BrenoHenriqueAlves/Teste-t-cnico.git
cd Teste-tecnico
```

### 2. Configure o Backend
Navegue até a pasta do backend e siga as instruções do seu `README.md`.

```bash
cd recreativa-backend
npm install
# Siga as instruções em backend/README.md para configurar o .env
npm run dev
```
O servidor backend estará rodando em `http://localhost:3333`.

### 3. Configure o Frontend
Em um **novo terminal**, navegue até a pasta do frontend e siga as instruções do seu `README.md`.

```bash
cd recreativa-frontend
npm install
# Siga as instruções em frontend/README.md para configurar o .env.local
npm run dev
```
A aplicação estará acessível em `http://localhost:3000`.