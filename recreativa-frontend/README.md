# Frontend - A Recreativa

Este diretório contém a aplicação frontend construída com Next.js e Ant Design, responsável por toda a interface e experiência do usuário.

## 🎨 Tecnologias Utilizadas

*   **Next.js 14+**: Framework React com App Router para renderização no servidor e no cliente.
*   **React**: Biblioteca para construção da interface.
*   **TypeScript**: Linguagem principal.
*   **Ant Design**: Biblioteca de componentes UI para um design rápido e consistente.
*   **Axios**: Cliente HTTP para comunicação com a API do backend.
*   **react-pdf & docx-preview**: Bibliotecas para a renderização de previews de arquivos `.pdf` e `.docx`.

## ⚙️ Setup Local

**Pré-requisito:** O servidor do backend deve estar em execução para que o frontend funcione corretamente.

### 1. Instale as Dependências
A partir da pasta raiz `/recreativa-frontend`, execute:
```bash
npm install
```

### 2. Configure as Variáveis de Ambiente
Crie um arquivo chamado `.env.local` na raiz da pasta `/recreativa-frontend` e adicione a URL da sua API backend:

```env
# O prefixo NEXT_PUBLIC_ é necessário para expor a variável ao navegador
NEXT_PUBLIC_API_URL=http://localhost:3333/api
```

### 3. Configuração do `react-pdf`
Para que o preview de PDF funcione, é necessário copiar o worker da biblioteca para a pasta `public`. Execute o seguinte comando na raiz da pasta `/recreativa-frontend`:

*   **No Linux/macOS:**
    ```bash
    cp ./node_modules/pdfjs-dist/build/pdf.worker.min.mjs ./public/
    ```
*   **No Windows (PowerShell):**
    ```bash
    Copy-Item -Path "./node_modules/pdfjs-dist/build/pdf.worker.min.mjs" -Destination "./public/"
    ```

## 🚀 Como Rodar

*   **Para rodar em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:3000`.

