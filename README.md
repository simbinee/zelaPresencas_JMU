# JMU Maputo Norte — Sistema de Presenças

Sistema web (funciona também em telemóvel) para gerir a presença dos
candidatos à envergadura / membros em pleno compromisso da Igreja Metodista
Unida em Moçambique, nos eventos organizados pela JMU Maputo Norte.

- **Painel de Administrador**: cria eventos, candidatos e contas de
  responsáveis, e vê relatórios de assiduidade.
- **Painel de Responsável**: escolhe um evento e marca presença/ausência de
  cada candidato com um toque.

## Passo a passo para publicar amanhã (Vercel)

### 1. Criar a base de dados (5 min)
1. Vai a [vercel.com](https://vercel.com) e cria/entra na tua conta.
2. No dashboard, vai a **Storage → Create Database → Neon (Postgres)** e
   cria uma base de dados grátis.
3. Copia a `DATABASE_URL` gerada — vais precisar dela no passo 3.

### 2. Subir o código
Sobe esta pasta para um repositório no GitHub (ou faz upload direto na
Vercel, se preferires arrastar a pasta):
```
git init
git add .
git commit -m "Sistema de presenças JMU Maputo Norte"
git branch -M main
git remote add origin <o-teu-repositorio>
git push -u origin main
```

### 3. Importar o projeto na Vercel
1. Na Vercel, clica em **Add New → Project** e escolhe o repositório.
2. Em **Environment Variables**, adiciona:
   - `DATABASE_URL` → a connection string do passo 1
   - `AUTH_SECRET` → qualquer frase longa e aleatória (ex: gera uma em
     https://generate-secret.vercel.app/32)
3. Clica em **Deploy**.

### 4. Criar as tabelas e os utilizadores iniciais
Depois do primeiro deploy, no teu computador (com Node.js instalado):
```
npm install
echo "DATABASE_URL=cola-aqui-a-mesma-url" > .env
npx prisma db push
npm run seed
```
Isto cria a estrutura da base de dados e dois utilizadores de teste:

| Utilizador    | Palavra-passe   | Papel        |
|---------------|-----------------|--------------|
| admin         | admin123        | Administrador|
| responsavel   | responsavel123  | Responsável  |

**Muda estas palavras-passe assim que entrares** (podes criar novos
responsáveis e apagar este, ou simplesmente avisar o utilizador `admin` da
nova palavra-passe através da tua base de dados — no dia-a-dia, cria contas
novas em "Responsáveis" no painel de administrador).

### 5. Usar amanhã
- Entra como `admin` → cria o(s) evento(s) do dia em **Eventos**, adiciona
  os candidatos em **Candidatos**, e cria os acessos dos responsáveis em
  **Responsáveis**.
- Cada responsável entra com a sua conta, escolhe o evento em
  **Eventos** e toca em cada nome para marcar presente/ausente — atualiza
  na hora e funciona bem no telemóvel.
- O admin acompanha tudo em **Visão geral** e **Relatórios**.

## Desenvolvimento local
```
npm install
npm run dev
```
Precisas de um ficheiro `.env` com `DATABASE_URL` e `AUTH_SECRET` (vê
`.env.example`).
