import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { UsersService } from "./Services/UsersService";
import { UsersController } from "./WebAPI/controllers/UsersController";
import { LogerService } from "./Services/LogerService";
import { PetService } from "./Services/PetService";
import { PetController } from "./WebAPI/controllers/PetController";
import { JsonPetRepository } from "./Repository/JsonPetRepository";
import { JsonUserRepository } from "./Repository/JsonUserRepository";
import { DailySaleService } from "./Services/DailySaleService";
import { NightSaleService } from "./Services/NightSaleService";
import { JsonReceiptRepository } from "./Repository/JsonReceiptRepository";

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = ["http://localhost:5173", "http://localhost:4000"]; // Dodajemo tvoj React port
const corsMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]; // Dodajemo OPTIONS

app.use(
  cors({
    origin: corsOrigin,
    methods: corsMethods,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 1. Logger
const logerService = new LogerService();

// --- LOGIKA ZA SMENE (Dependency Injection) ---
const hour = new Date().getHours();
let saleService;

// Prva smena: 08:00 - 16:00
if (hour >= 8 && hour < 16) {
  saleService = new DailySaleService();
} else {
  // Druga smena ili noć (zadatak kaže NightService za drugu smenu)
  saleService = new NightSaleService();
}

// 2. Repositories (JSON umesto TypeORM)
const petRepository = new JsonPetRepository();
const userRepository = new JsonUserRepository();
const receiptRepository = new JsonReceiptRepository();

const petService = new PetService(
  petRepository,
  receiptRepository,
  logerService,
  saleService
);
const userService = new UsersService(userRepository);

// 3. Controllers
// Ovde prosleđujemo servise i logger
const userController = new UsersController(userService, logerService);
const petController = new PetController(petService, logerService);

// --- RUTE ---

// Rute za korisnike (npr. /api/v1/users)
app.use("/api/v1/users", userController.getRouter());

// Rute za ljubimce (npr. /api/v1/pets)
app.use("/api/v1/pets", petController.getRouter());

export default app;
