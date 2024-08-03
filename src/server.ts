import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./cors/swagger";
import router from "./routes/router";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));    
app.use(express.static(path.join(__dirname, "public", "app")));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("", router);

export default app;
