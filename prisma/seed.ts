import { PrismaClient } from "@prisma/client";
import faker from "faker"; 

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 100; i++) {
    const userData = {
      name: faker.name.findName(), 
      email: faker.internet.email(), 
      hash: faker.datatype.uuid(), 
      lat: parseFloat(faker.address.latitude()), 
      lon: parseFloat(faker.address.longitude()), 
    };

    await prisma.user.create({
      data: userData,
    });
  }

  console.log("Seeded 100 users successfully.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
