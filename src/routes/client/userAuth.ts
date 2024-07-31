import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { createUser, getUserByEmail } from "../../controllers/users";
import { comparePassword, hashPassword } from "../../cors/password";
import logger from "../../cors/logger";
import { generateClientJWT } from "../../cors/jwt";
const router = Router();

/**
 * @swagger
 * /client/user:
 *   post:
 *     summary: Register a new user with phone number and password
 *     tags:
 *       - ClientUsers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 description: The phone number of the user
 *               password:
 *                 type: string
 *                 description: The password for the user account
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 createStatus:
 *                   type: object
 *                   description: Status of user creation in the database
 *                 token:
 *                   type: string
 *                   description: JWT token for user authentication
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Validation failure message
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       location:
 *                         type: string
 *                         description: The location of the error
 *                       msg:
 *                         type: string
 *                         description: The error message
 *                       param:
 *                         type: string
 *                         description: The parameter that caused the error
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.post(
  "/user",
  body("name").isString(),
  body("email").isEmail(),
  body("location").isString(),
  body("password").isString().isLength({ min: 6 }), // Ensure password is at least 6 characters
  async (req: Request, res: Response) => {
    try {
      logger.info("Request received to create a new user", {
        section: "createUserRoute",
        requestBody: req.body,
      });

      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error("Validation errors:", {
          section: "createUserRoute",
          errors: errors.array(),
        });
        return res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
      }

      logger.info("Input validated successfully", {
        section: "createUserRoute",
      });

      const { name, email, password, location } = req.body;

      // Hash password
      const hashedPassword = hashPassword(password);
      logger.info("Password hashed successfully", {
        section: "createUserRoute",
      });

      // Create user
      const createStatus = await createUser(
        name,
        email,
        hashedPassword,
        "103jdfklsflsjs"
      );

      if (!createStatus.success) {
        logger.error("Failed to create user in database", {
          section: "createUserRoute",
          error: createStatus.error,
        });
        return res.status(500).json(createStatus);
      }

      logger.info("User created successfully in database", {
        section: "createUserRoute",
        userId: createStatus.data.id,
      });

      const token = generateClientJWT(email);

      logger.info("JWT token generated successfully", {
        section: "createUserRoute",
        email: email,
        token: token,
      });

      logger.info("User creation process completed successfully", {
        section: "createUserRoute",
        email: email,
      });

      return res.status(200).json({
        createStatus,
        token,
        message: "User created successfully",
      });
    } catch (error) {
      logger.error("Unexpected error during user creation:", {
        section: "createUserRoute",
        error: error.message,
      });
      return res.status(500).json({ error: "Unexpected error" });
    }
  }
);

/**
 * @swagger
 * /client/login:
 *   post:
 *     summary: Log in a user with email and password
 *     tags:
 *       - ClientUsers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for user authentication
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Validation failure message
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       location:
 *                         type: string
 *                         description: The location of the error
 *                       msg:
 *                         type: string
 *                         description: The error message
 *                       param:
 *                         type: string
 *                         description: The parameter that caused the error
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating authentication failure
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.post(
  "/login",
  body("email").isEmail(),
  body("password").isString().isLength({ min: 6 }), // Ensure password is at least 6 characters
  async (req: Request, res: Response) => {
    try {
      logger.info("Request received to log in a user", {
        section: "loginRoute",
        requestBody: req.body,
      });

      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error("Validation errors:", {
          section: "loginRoute",
          errors: errors.array(),
        });
        return res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
      }

      logger.info("Input validated successfully", {
        section: "loginRoute",
      });

      const { email, password } = req.body;

      // Retrieve user
      const loginResult = await getUserByEmail(email);

      if (!loginResult.success) {
        logger.warn("Login failed for user with email: %s", email);
        return res.status(401).json({ error: loginResult.message });
      }

      // Compare hashed password
      const user = loginResult.data;
      const isPasswordMatch = comparePassword(password, user.hash);

      if (!isPasswordMatch) {
        logger.warn("Password mismatch for user with email: %s", email);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = generateClientJWT(email);

      logger.info("JWT token generated successfully", {
        section: "loginRoute",
        email: email,
        token: token,
      });

      return res.status(200).json({
        token,
        message: "Login successful",
      });
    } catch (error) {
      logger.error("Unexpected error during login:", {
        section: "loginRoute",
        error: error.message,
      });
      return res.status(500).json({ error: "Unexpected error" });
    }
  }
);

export default router;
