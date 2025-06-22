# Backend - A Recreativa

Este diretório contém a API RESTful construída com Node.js, Express e Prisma, responsável por toda a lógica de negócio da aplicação.

## 🛠️ Tecnologias Utilizadas

*   **Node.js**: Ambiente de execução JavaScript.
*   **Express.js**: Framework para construção da API.
*   **TypeScript**: Linguagem principal, garantindo tipagem e segurança.
*   **Prisma ORM**: Para interação com o banco de dados.
*   **SQLite**: Banco de dados local para simplicidade de desenvolvimento.
*   **Google Gemini API**: Utilizada para os serviços de extração e aprimoramento de texto.
*   **Multer**: Middleware para lidar com o upload de arquivos.
*   **Jest & Supertest**: Para a suíte de testes de unidade e integração.

## ⚙️ Setup Local

### 1. Instale as Dependências
A partir da pasta `/recreativa-backend`, execute:
```bash
npm install
```

### 2. Configure as Variáveis de Ambiente
Crie um arquivo chamado `.env` na raiz da pasta `/recreativa-backend` e preencha com as seguintes variáveis:

```env
# URL do Banco de Dados (padrão do Prisma para SQLite)
DATABASE_URL="file:./prisma/dev.db"

# Porta para o servidor
PORT=3333

# Uma chave de API do Google Gemini
# Utilize a Seguinte Chave Para Testes
GEMINI_API_KEY=AIzaSyAt9TGAtvvRZJTQivkb3JZWXKk6ZHLQOc8
```


### 3. Crie As Pastas para Upload

# No Linux/macOS
mkdir -p uploads/originals uploads/generated

# No Windows (PowerShell)
New-Item -Path "uploads/originals", "uploads/generated" -ItemType Directory -Force


### 4. Prepare o Banco de Dados
Este comando irá ler seu `schema.prisma` e criar o arquivo do banco de dados SQLite.

```bash
npx prisma db push
```

## 🚀 Scripts Disponíveis

*   **Para rodar em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O servidor estará disponível em `http://localhost:3333`.



*   **Para visualizar o banco de dados (desenvolvimento):**
    ```bash
    npx prisma studio
    ```
