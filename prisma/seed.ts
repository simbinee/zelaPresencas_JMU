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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
