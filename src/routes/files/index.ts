import express from "express";
import logger from "../../cors/logger";

import path from "path";
import { dirPath } from "../../../path";
const router = express.Router();

/**
 * @swagger
 * /files/{filename}:
 *   get:
 *     summary: Get image by filename
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         description: The filename of the image to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image retrieved successfully
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Image not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error retrieving image
 *                 error:
 *                   type: string
 *                   example: File system error
 */

router.get("/:filename", (req, res) => {
  try {
    const filePath = path.join(
      dirPath,
      "public/images",
      req.params.filename
    );
    res.sendFile(filePath);
  } catch (error) {
    logger.log("Error while get image", error);
  }
});

export default router;
