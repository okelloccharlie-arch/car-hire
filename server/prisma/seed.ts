import { PrismaClient, Role, CarStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin@12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@carrental.com" },
    update: {},
    create: {
      firstName: "System",
      lastName: "Admin",
      email: "admin@carrental.com",
      phone: "0700000000",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const cars = [
    {
      brand: "Toyota",
      model: "Corolla",
      year: 2022,
      pricePerDay: 45,
      transmission: "Automatic",
      fuelType: "Petrol",
      seats: 5,
      image: "https://placehold.co/600x400?text=Toyota+Corolla",
      status: CarStatus.AVAILABLE,
    },
    {
      brand: "Nissan",
      model: "X-Trail",
      year: 2021,
      pricePerDay: 65,
      transmission: "Automatic",
      fuelType: "Petrol",
      seats: 5,
      image: "https://placehold.co/600x400?text=Nissan+X-Trail",
      status: CarStatus.AVAILABLE,
    },
    {
      brand: "Mazda",
      model: "Demio",
      year: 2020,
      pricePerDay: 35,
      transmission: "Manual",
      fuelType: "Petrol",
      seats: 5,
      image: "https://placehold.co/600x400?text=Mazda+Demio",
      status: CarStatus.MAINTENANCE,
    },
    {
      brand: "Toyota",
      model: "Land Cruiser Prado",
      year: 2023,
      pricePerDay: 120,
      transmission: "Automatic",
      fuelType: "Diesel",
      seats: 7,
      image: "https://placehold.co/600x400?text=Prado",
      status: CarStatus.AVAILABLE,
    },
  ];

  for (const car of cars) {
    await prisma.car.create({ data: car });
  }

  console.log("Seed complete. Admin login: admin@carrental.com / Admin@12345");
  console.log({ admin: admin.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
