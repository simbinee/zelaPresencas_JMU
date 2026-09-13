import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash("admin123", 10);
  const respPass = await bcrypt.hash("responsavel123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      nome: "Administrador JMU",
      username: "admin",
      passwordHash: adminPass,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { username: "responsavel" },
    update: {},
    create: {
      nome: "Responsável de Turma",
      username: "responsavel",
      passwordHash: respPass,
      role: Role.RESPONSAVEL,
    },
  });

  console.log("Utilizadores de teste criados: admin/admin123 e responsavel/responsavel123");

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
