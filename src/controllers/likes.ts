import dbContext from "./dbContext";
import logger from "../cors/logger";

export const createLike = async (userId: string, likedById: string) => {
  try {
    if (!userId || !likedById) {
      return {
        success: false,
        message: "User ID and Liked By ID are required",
      };
    }

    // Create a new like entry in the database
    const newLike = await dbContext.like.create({
      data: {
        userId,
        likedById,
      },
    });

    return {
      success: true,
      data: newLike,
    };
  } catch (error) {
    logger.error(error, {
      section: "likesDbServices.createLike",
      userId,
      likedById,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message: "Something went wrong while creating a like",
    };
  }
};

export const deleteLike = async (likeId: string) => {
  try {
    if (!likeId) {
      return {
        success: false,
        message: "Like ID is required",
      };
    }

    await dbContext.like.delete({
      where: {
        id: likeId,
      },
    });

    return {
      success: true,
      message: "Like deleted successfully",
    };
  } catch (error) {
    // Log error details
    logger.error(error, {
      section: "likesDbServices.deleteLike",
      likeId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message: "Something went wrong while deleting a like",
    };
  }
};
