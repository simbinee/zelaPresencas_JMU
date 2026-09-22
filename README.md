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
   - `AUTH_SECRET` → uma chave aleatória com pelo menos 32 caracteres (não a
     partilhes nem a comites no repositório)
3. Clica em **Deploy**.

### 4. Criar as tabelas e os utilizadores iniciais
Depois do primeiro deploy, no teu computador (com Node.js instalado), define
também quatro variáveis temporárias para o seed e executa:
```
npm install
echo "DATABASE_URL=cola-aqui-a-mesma-url" > .env
echo "AUTH_SECRET=uma-chave-aleatoria-com-pelo-menos-32-caracteres" >> .env
echo "SEED_ADMIN_USERNAME=admin" >> .env
echo "SEED_ADMIN_PASSWORD=define-uma-palavra-passe-forte" >> .env
echo "SEED_RESPONSAVEL_USERNAME=responsavel" >> .env
echo "SEED_RESPONSAVEL_PASSWORD=define-outra-palavra-passe-forte" >> .env
npx prisma db push
npm run seed
```
Isto cria a estrutura da base de dados e dois utilizadores iniciais:

| Utilizador    | Palavra-passe   | Papel        |
|---------------|-----------------|--------------|
| valor de `SEED_ADMIN_USERNAME` | valor de `SEED_ADMIN_PASSWORD` | Administrador|
| valor de `SEED_RESPONSAVEL_USERNAME` | valor de `SEED_RESPONSAVEL_PASSWORD` | Responsável  |

Não coloques estas variáveis no GitHub. Depois da configuração inicial,
remove-as do ambiente local ou substitui-as por valores seguros. No dia-a-dia,
cria contas novas em "Responsáveis" no painel de administrador.

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
