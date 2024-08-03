import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import logger from "../../cors/logger";
import { protectClient } from "../../cors/middlewares";
import { protectedRequest } from "../../interface/protectedRequest";
import { findNearbyUsers, getUserByEmail } from "../../controllers/users";
import { createLike, deleteLike } from "../../controllers/likes";
import { get } from "http";
import { createDislike, deleteDislike } from "../../controllers/dislikes";

const router = Router();

/**
 * @swagger
 * /client/interact/likes/{userId}:
 *   post:
 *     summary: Create a new like
 *     description: Creates a new like for a user, given the user ID and the ID of the user who liked them.
 *     tags:
 *       - Likes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user being liked.
 *     responses:
 *       200:
 *         description: Successfully created a like.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: The created like object.
 *                   properties:
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     likedById:
 *                       type: string
 *       400:
 *         description: Bad request. Missing userId or likedById.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: User ID and Liked By ID are required
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Something went wrong while creating a like
 */

router.post(
  "/likes/:userId",
  protectClient,
  async (req: protectedRequest, res: Response) => {
    const userId = req.params.userId;
    const email = req.user.email;
    try {
      let getStatus = await getUserByEmail(email);

      if (!getStatus.success) {
        logger.warn(`Cant find user with the the email ${req.user.email}`);
        return res.status(401).json(getStatus);
      }

      const result = await createLike(userId, getStatus.data.id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json({
          success: false,
          message: "Something went wrong while creating a like",
        });
      }
    } catch (error) {
      logger.error("Error creating like:", error);

      res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }
);

/**
 * @swagger
 * /client/interact/likes/{likeId}:
 *   delete:
 *     summary: Delete a like
 *     description: Deletes an existing like by its ID.
 *     tags:
 *       - Likes
 *     parameters:
 *       - in: path
 *         name: likeId
 *         required: true
 *         description: ID of the like to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted a like.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Like deleted successfully
 *       400:
 *         description: Bad request. Missing likeId.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Like ID is required
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Something went wrong while deleting a like
 */

router.delete(
  "/likes/:likeId",
  protectClient,
  async (req: protectedRequest, res: Response) => {
    const { likeId } = req.params;

    try {
      if (!likeId) {
        return res.status(400).json({
          success: false,
          message: "Like ID is required",
        });
      }

      const result = await deleteLike(likeId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json({
          success: false,
          message: "Something went wrong while deleting a like",
        });
      }
    } catch (error) {
      logger.error("Error deleting like:", error);

      res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }
);

/**
 * @swagger
 * /client/interact/nearby:
 *   get:
 *     summary: Find nearby users
 *     description: Retrieves a list of users located within a 10-kilometer radius of the authenticated user's location.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved nearby users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: User ID
 *                         example: "12345"
 *                       name:
 *                         type: string
 *                         description: User's name
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         description: User's email
 *                         example: "john.doe@example.com"
 *                       lat:
 *                         type: number
 *                         description: Latitude of the user's location
 *                         example: 37.7749
 *                       lon:
 *                         type: number
 *                         description: Longitude of the user's location
 *                         example: -122.4194
 *       400:
 *         description: Bad request due to missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User ID is required"
 *       401:
 *         description: Unauthorized access due to invalid token or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access. Token is missing."
 *       404:
 *         description: No nearby users found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No nearby users found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred while finding nearby users"
 *                 error:
 *                   type: string
 *                   example: "Internal server error details"
 */

router.get(
  "/nearby",
  protectClient,
  async (req: protectedRequest, res: Response) => {
    try {
      logger.info(`Received request to find nearby users`, {
        section: "nearbyRoute",
        userEmail: req.user.email,
      });

      const getStatus = await getUserByEmail(req.user.email);

      if (!getStatus.success) {
        logger.warn(`Can't find user with the email ${req.user.email}`, {
          section: "nearbyRoute",
        });
        return res.status(401).json(getStatus);
      }

      const result = await findNearbyUsers(getStatus.data.id);

      if (result.success) {
        logger.info(`Successfully found nearby users`, {
          section: "nearbyRoute",
          nearbyUserCount: result.data.length,
        });

        res.status(200).json(result);
      } else {
        logger.warn(`No nearby users found for user ID: ${getStatus.data.id}`, {
          section: "nearbyRoute",
        });

        res.status(404).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error(
        `Error processing request for nearby users: ${error.message}`,
        {
          section: "nearbyRoute",
          error: error.message,
        }
      );

      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while finding nearby users",
        error: error.message,
      });
    }
  }
);

/**
 * @swagger
 * /client/interact/dislikes/{userId}:
 *   post:
 *     summary: Create a new dislike
 *     description: Dislike a user by providing the disliked user's ID and the ID of the user who dislikes them.
 *     tags:
 *       - Dislikes
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user being disliked.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dislikedById:
 *                 type: string
 *                 description: ID of the user who dislikes.
 *     responses:
 *       200:
 *         description: Successfully created a dislike.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: The created dislike object.
 *                   properties:
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     dislikedById:
 *                       type: string
 *       400:
 *         description: Bad request. Missing userId or dislikedById.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: User ID and Disliked By ID are required.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Something went wrong while creating a dislike.
 */

router.post(
  "/dislikes/:userId",
  protectClient,
  async (req: protectedRequest, res: Response) => {
    const userId = req.params.userId; // ID of the user being disliked
    const email = req.user.email; // Email of the user who is disliking

    try {
      // Retrieve the user details from the email
      const getStatus = await getUserByEmail(email);

      if (!getStatus.success) {
        logger.warn(`Can't find user with the email ${req.user.email}`);
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Unable to find user",
        });
      }

      // Create the dislike
      const result = await createDislike(userId, getStatus.data.id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json({
          success: false,
          message: result.message || "Failed to create dislike",
        });
      }
    } catch (error) {
      logger.error("Error creating dislike:", {
        error,
        section: "dislikeRoutes.createDislike",
        userId,
        email,
        timestamp: new Date().toISOString(),
      });

      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while creating a dislike",
      });
    }
  }
);

/**
 * @swagger
 * /client/interact/dislikes/{dislikeId}:
 *   delete:
 *     summary: Delete an existing dislike
 *     description: Remove a dislike by providing the dislike ID.
 *     tags:
 *       - Dislikes
 *     parameters:
 *       - in: path
 *         name: dislikeId
 *         required: true
 *         description: ID of the dislike to be removed.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted a dislike.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Dislike deleted successfully.
 *       404:
 *         description: Dislike not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Dislike not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Something went wrong while deleting a dislike.
 */

router.delete(
  "/dislikes/:dislikeId",
  protectClient,
  async (req: protectedRequest, res: Response) => {
    const dislikeId = req.params.dislikeId; // ID of the dislike to be deleted

    try {
      // Delete the dislike
      const result = await deleteDislike(dislikeId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json({
          success: false,
          message: result.message || "Dislike not found",
        });
      }
    } catch (error) {
      logger.error("Error deleting dislike:", {
        error,
        section: "dislikeRoutes.deleteDislike",
        dislikeId,
        timestamp: new Date().toISOString(),
      });

      res.status(500).json({
        success: false,
        message: "An unexpected error occurred while deleting a dislike",
      });
    }
  }
);

export default router;
