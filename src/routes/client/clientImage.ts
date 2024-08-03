import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import logger from "../../cors/logger";
import storage from "../../cors/multer";
import multer from "multer";
import { protectClient } from "../../cors/middlewares";
import { protectedRequest } from "../../interface/protectedRequest";
import { createImage } from "../../controllers/images";
import { getUserByEmail } from "../../controllers/users";







const upload = multer({ storage: storage });

const router = Router();

/**
 * @swagger
 * /client/image:
 *   post:
 *     summary: Create a new coperation with image upload.
 *     tags:
 *       - AdminCoperations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *             required:
 *               - image
 *     responses:
 *       200:
 *         description: Successfully created a coperation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     image_filename:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request. Validation error or missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: string
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post(
  "/",
  protectClient,
  upload.single("image"), // Handle file upload with multer
  async (req: protectedRequest, res: Response) => {
    try {
      logger.info("Incoming request to create coperation", {
        section: "createCoperationRoute",
        userId: req.user.email,
        filename: req.file ? req.file.filename : undefined,
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error("Validation errors", {
          section: "createCoperationRoute",
          errors: errors.array(),
        });
        return res.status(400).json({ errors: errors.array() });
      }

      const image_filename = req.file ? req.file.filename : undefined;


      let getStatus = await getUserByEmail(req.user.email);

      if (!getStatus.success) {
        logger.warn(`Cant find user with the the email ${req.user.email}`);
        return res.status(401).json(getStatus);
      }

      const createStatus = await createImage(
        getStatus.data.id,
        image_filename
      );

      if (!createStatus.success) {
        logger.error("Coperation creation failed", {
          section: "createCoperationRoute",
          error: createStatus.message,
        });
        return res.status(500).json({ error: createStatus.message });
      }

      logger.info("Coperation created successfully", {
        section: "createCoperationRoute",
        data: createStatus.data,
      });
      return res.status(200).json(createStatus);
    } catch (error: any) {
      logger.error("Unexpected error during coperation creation", {
        section: "createCoperationRoute",
        error: error.message,
      });
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router