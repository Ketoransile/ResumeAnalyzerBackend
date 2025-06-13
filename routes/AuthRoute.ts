import express, { Router } from "express";
import { createUser } from "../controllers/authController";

const router = Router();

router.post("/webhook", createUser);

export default router;
