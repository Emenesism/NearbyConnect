import { Router } from "express"
const router = Router()

import client from "../routes/client/userAuth"
import interact from "../routes/client/clientInteract"
import image from "./client/clientImage"

import staticRouter from "./pages"

import files from "./files/index"
import { stat } from "fs"


router.use("/client/auth", client)
router.use("/client/interact", interact);
router.use("/client/image", image);
router.use("", staticRouter)


router.use("/files", files)



export default router