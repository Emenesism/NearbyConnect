import express from "express";
import http from "http";
import WebSocket from "ws";
import app from "../server";
import logger from "../cors/logger";
import { protectClient } from "../cors/middlewares";
import { validateClientJWT } from "../cors/jwt";

const wss = new WebSocket.Server({ port: 80 }); // Set path to "/ws"

