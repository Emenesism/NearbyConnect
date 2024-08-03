import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import {
  createUser,
  getUserByEmail,
  updateUser,
} from "../../controllers/users";
import { comparePassword, hashPassword } from "../../cors/password";
import logger from "../../cors/logger";
import { generateClientJWT } from "../../cors/jwt";
import { protectedRequest } from "../../interface/protectedRequest";
import { protectClient } from "../../cors/middlewares";
const router = Router();
/**
 * @swagger
 * /client/auth/register:
 *   post:
 *     summary: Register a new user with email and password
 *     tags:
 *       - ClientUsers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password for the user account, must be at least 6 characters
 *               lat:
 *                 type: number
 *                 format: float
 *                 description: Latitude of the user's location
 *               lon:
 *                 type: number
 *                 format: float
 *                 description: Longitude of the user's location
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
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       description: Indicates if user creation was successful
 *                     data:
 *                       type: object
 *                       description: User data including id
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: The ID of the newly created user
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
 *                         description: The location of the error (body, query, etc.)
 *                       msg:
 *                         type: string
 *                         description: The error message
 *                       param:
 *                         type: string
 *                         description: The parameter that caused the error
 *                       value:
 *                         type: string
 *                         description: The value that failed validation
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating an internal server error
 */

router.post(
  "/register",
  body("name").isString(),
  body("email").isEmail(),
  body("lat").isNumeric(),
  body("lon").isNumeric(),
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

      const { name, email, password, lat, lon } = req.body;

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
        lat,
        lon
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
 * /client/auth/login:
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
      logger.info(`Request received to log in a user`, {
        section: "loginRoute",
        requestBody: req.body,
      });

      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error(`Validation errors: ${JSON.stringify(errors.array())}`, {
          section: "loginRoute",
          errors: errors.array(),
        });
        return res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
      }

      logger.info(`Input validated successfully`, {
        section: "loginRoute",
      });

      const { email, password } = req.body;

      // Retrieve user
      const loginResult = await getUserByEmail(email);

      if (!loginResult.success) {
        logger.warn(`Login failed for user with email: ${email}`, {
          section: "loginRoute",
        });
        return res.status(401).json({ error: loginResult.message });
      }

      // Compare hashed password
      const user = loginResult.data;
      const isPasswordMatch = comparePassword(password, user.hash);

      if (!isPasswordMatch) {
        logger.warn(`Password mismatch for user with email: ${email}`, {
          section: "loginRoute",
        });
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = generateClientJWT(email);

      logger.info(`JWT token generated successfully`, {
        section: "loginRoute",
        email: email,
        token: token,
      });

      return res.status(200).json({
        token,
        message: "Login successful",
      });
    } catch (error) {
      logger.error(`Unexpected error during login: ${error.message}`, {
        section: "loginRoute",
        error: error.message,
      });
      return res.status(500).json({ error: "Unexpected error" });
    }
  }
);

/**
 * @swagger
 * /client/auth/update:
 *   put:
 *     summary: Update an existing user by email
 *     tags:
 *       - ClientUsers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password for the user account, must be at least 6 characters
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updateStatus:
 *                   type: object
 *                   description: Status of user update in the database
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       description: Indicates if user update was successful
 *                     data:
 *                       type: object
 *                       description: Updated user data including id
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: The ID of the updated user
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
 *                         description: The location of the error (body, query, etc.)
 *                       msg:
 *                         type: string
 *                         description: The error message
 *                       param:
 *                         type: string
 *                         description: The parameter that caused the error
 *                       value:
 *                         type: string
 *                         description: The value that failed validation
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating an internal server error
 */

router.put(
  "/update",
  protectClient,
  body("name").optional().isString(),
  body("password").optional().isString().isLength({ min: 6 }), // Ensure password is at least 6 characters
  async (req: protectedRequest, res: Response) => {
    try {
      logger.info("Request received to update a user", {
        section: "updateUserRoute",
        requestBody: req.body,
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.error("Validation errors:", {
          section: "updateUserRoute",
          errors: errors.array(),
        });
        return res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
      }

      logger.info("Input validated successfully", {
        section: "updateUserRoute",
      });

      const { name, password, lat, lon } = req.body;

      let hashedPassword: string | undefined = undefined;
      if (password) {
        hashedPassword = hashPassword(password);
        logger.info("Password hashed successfully", {
          section: "updateUserRoute",
        });
      }

      const updateStatus = await updateUser(
        req.user.email,
        name,
        hashedPassword,
        lat,
        lon
      );

      if (!updateStatus.success) {
        logger.error("Failed to update user in database", {
          section: "updateUserRoute",
          error: updateStatus.error,
        });
        return res.status(500).json(updateStatus);
      }

      logger.info("User updated successfully in database", {
        section: "updateUserRoute",
        userId: updateStatus.data.id,
      });

      return res.status(200).json({
        updateStatus,
        message: "User updated successfully",
      });
    } catch (error) {
      logger.error("Unexpected error during user update:", {
        section: "updateUserRoute",
        error: error.message,
      });
      return res.status(500).json({ error: "Unexpected error" });
    }
  }
);

/**
 * @swagger
 * /client/auth/user:
 *   get:
 *     summary: Retrieve a user by email
 *     tags:
 *       - ClientUsers
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user to retrieve
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if user retrieval was successful
 *                 data:
 *                   type: object
 *                   description: User data
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The ID of the user
 *                     name:
 *                       type: string
 *                       description: The name of the user
 *                     email:
 *                       type: string
 *                       description: The email of the user
 *                     lat:
 *                       type: number
 *                       format: float
 *                       description: Latitude of the user's location
 *                     lon:
 *                       type: number
 *                       format: float
 *                       description: Longitude of the user's location
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: Array of user images
 *                     likes:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: Array of user likes
 *                     likedBy:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: Array of users who liked this user
 *                     dislikes:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: Array of user dislikes
 *                     dislikedBy:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: Array of users who disliked this user
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
 *                         description: The location of the error (query, body, etc.)
 *                       msg:
 *                         type: string
 *                         description: The error message
 *                       param:
 *                         type: string
 *                         description: The parameter that caused the error
 *                       value:
 *                         type: string
 *                         description: The value that failed validation
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates that the user was not found
 *                 message:
 *                   type: string
 *                   description: User not found message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating an internal server error
 */

router.get(
  "/user",
  protectClient,
  async (req: protectedRequest, res: Response) => {
    try {
      logger.info("Request received to retrieve a user", {
        section: "getUserByEmailRoute",
      });
      const email = req.user.email;
      const retrieveStatus = await getUserByEmail(email as string);
      console.log(retrieveStatus);
      if (!retrieveStatus.success) {
        logger.warn("User not found", {
          section: "getUserByEmailRoute",
          email: email,
        });
        return res.status(404).json(retrieveStatus);
      }

      logger.info("User retrieved successfully", {
        section: "getUserByEmailRoute",
        email: email,
        userId: retrieveStatus.data.id,
      });

      return res.status(200).json(retrieveStatus);
    } catch (error) {
      logger.error("Unexpected error during user retrieval:", {
        section: "getUserByEmailRoute",
        error: error.message,
      });
      return res.status(500).json({ error: "Unexpected error" });
    }
  }
);

export default router;
