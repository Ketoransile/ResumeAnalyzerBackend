import express, { Router } from "express";

const router = Router();

router.post("/webhook", express.raw({ type: "application/json" }));

export default router;
