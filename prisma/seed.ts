import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`A variável ${name} é obrigatória para executar o seed.`);
  return value;
}

async function main() {
  const adminUsername = requiredEnv("SEED_ADMIN_USERNAME");
  const adminPassword = requiredEnv("SEED_ADMIN_PASSWORD");
  const responsavelUsername = requiredEnv("SEED_RESPONSAVEL_USERNAME");
  const responsavelPassword = requiredEnv("SEED_RESPONSAVEL_PASSWORD");
  const adminPass = await bcrypt.hash(adminPassword, 12);
  const admin2Pass = await bcrypt.hash(responsavelPassword, 12);

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      nome: "Administrador JMU",
      passwordHash: adminPass,
      role: Role.ADMIN,
    },
    create: {
      nome: "Administrador JMU",
      username: adminUsername,
      passwordHash: adminPass,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { username: responsavelUsername },
    update: {
      nome: "Responsável de Turma",
      passwordHash: admin2Pass,
      role: Role.RESPONSAVEL,
    },
    create: {
      nome: "Responsável de Turma",
      username: responsavelUsername,
      passwordHash: admin2Pass ,
      role: Role.RESPONSAVEL,
    },
  });

  console.log("Utilizadores iniciais criados ou confirmados.");

  // Numa instalação nova (sem candidatos antigos para migrar), cria já o ano
  // letivo atual para o admin poder começar logo a criar turmas.
  const totalAnos = await prisma.anoLetivo.count();
  if (totalAnos === 0) {
    const ano = new Date().getFullYear();
    const mes = new Date().getMonth();
    const inicio = mes >= 7 ? ano : ano - 1;
    const nomeAno = `${inicio}/${inicio + 1}`;
    await prisma.anoLetivo.create({ data: { nome: nomeAno, atual: true } });
    console.log(`Ano letivo "${nomeAno}" criado como ano atual.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
