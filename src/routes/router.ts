import { Router } from "express"
const router = Router()

import client from "../routes/client/userAuth"


import files from "./files/index"


router.use("/client", client)


router.use("/files", files)



export default router