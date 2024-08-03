import { Router, Request, Response } from "express";
import path from "path";
import { dirPath } from "../../../path";
const router = Router();

router.get("/login", (req, res) => {
  res.sendFile(path.join(dirPath, "public", "app", "login.html"));
});


router.get("/user/nearby", (req, res) => {
  res.sendFile(path.join(dirPath, "public", "app", "nearby_user.html"));
});

router.get("/register", (req, res) => {
  res.sendFile(path.join(dirPath, "public", "app", "register.html"));
});

router.get("/profile", (req, res) => {
  res.sendFile(path.join(dirPath, "public", "app", "profile.html"));
});

export default router