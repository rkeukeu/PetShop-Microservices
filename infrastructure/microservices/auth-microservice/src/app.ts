import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { IAuthService } from "./Domain/services/IAuthService";
import { AuthService } from "./Services/AuthService";
import { AuthController } from "./WebAPI/controllers/AuthController";
import { ILogerService } from "./Domain/services/ILogerService";
import { LogerService } from "./Services/LogerService";
import { JsonUserRepository } from "./Domain/Repositories/JsonUserRepository";

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) =>
  m.trim()
) ?? ["POST"];

// Protected microservice from unauthorized access
app.use(
  cors({
    origin: corsOrigin,
    methods: corsMethods,
  })
);

app.use(express.json());

const logerService: ILogerService = new LogerService();

const userRepository = new JsonUserRepository();

const authService: IAuthService = new AuthService(userRepository, logerService);

const authController = new AuthController(authService, logerService);

app.use("/api/v1", authController.getRouter());

export default app;
