import dotenv from "dotenv";
dotenv.config();
import app from "./server";

function print(path, layer) {
  if (layer.route) {
    layer.route.stack.forEach(
      print.bind(null, path.concat(split(layer.route.path)))
    );
  } else if (layer.name === "router" && layer.handle.stack) {
    layer.handle.stack.forEach(
      print.bind(null, path.concat(split(layer.regexp)))
    );
  } else if (layer.method) {
    console.log(
      "%s /%s",
      layer.method.toUpperCase(),
      path.concat(split(layer.regexp)).filter(Boolean).join("/")
    );
  }
}

function split(thing) {
  if (typeof thing === "string") {
    return thing.split("/");
  } else if (thing.fast_slash) {
    return "";
  } else {
    var match = thing
      .toString()
      .replace("\\/?", "")
      .replace("(?=\\/|$)", "$")
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
    return match
      ? match[1].replace(/\\(.)/g, "$1").split("/")
      : "<complex:" + thing.toString() + ">";
  }
}

app._router.stack.forEach(print.bind(null, []));

const PORT = process.env.SERVER_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from "express";
import http from "http";
import logger from "./cors/logger";
import WebSocket from "ws";
import { validateClientJWT } from "./cors/jwt";

const wss = new WebSocket.Server({ port: 3000 }); // Set path to "/ws"

// Store connected clients
const clients = new Map();

wss.on("connection", (ws) => {
  logger.info("New WebSocket connection");

  // Handle incoming messages from clients
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "handshake":
        handleHandshake(ws, data.token);
        break;
      case "like":
        handleLikeEvent(ws, data.userId, data.likedById);
        break;
      default:
        logger.info("Unknown message type:", data.type);
    }
  });

  // Handle disconnection
  ws.on("close", () => {
    logger.info("WebSocket connection closed");
    // Remove client from the list
    for (let [key, value] of clients) {
      if (value === ws) {
        clients.delete(key);
        break;
      }
    }
  });

  // Handle errors
  ws.on("error", (error) => {
    logger.error("WebSocket error:", error);
  });
});

function handleHandshake(ws, token) {
  const user = validateClientJWT(token);
  // Authenticate the user and store the WebSocket connection
  if (user) {
    clients.set(user.email, ws);
    logger.info(`User ${user.email} connected`);
  } else {
    ws.close();
    logger.info("Invalid token. Connection closed.");
  }
}

function handleLikeEvent(ws, userId, likedById) {
  // Notify the liked user
  const likedUserSocket = clients.get(userId);
  if (likedUserSocket) {
    likedUserSocket.send(
      JSON.stringify({
        type: "notification",
        data: {
          userId: userId,
        },
      })
    );
    logger.info(`User ${userId} liked by ${likedById}`);
  }
}
