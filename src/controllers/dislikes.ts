import dbContext from "./dbContext";
import logger from "../cors/logger";

export const createDislike = async (userId: string, dislikedById: string) => {
  try {
    if (!userId || !dislikedById) {
      return {
        success: false,
        message: "User ID and Disliked By ID are required",
      };
    }

    const existingDislike = await dbContext.dislike.findFirst({
      where: {
        userId,
        dislikedById,
      },
    });

    if (existingDislike) {
      return {
        success: false,
        message: "This user has already disliked the target user",
      };
    }

    const newDislike = await dbContext.dislike.create({
      data: {
        userId,
        dislikedById,
      },
    });

    return {
      success: true,
      data: newDislike,
    };
  } catch (error) {
    logger.error(error, {
      section: "dislikesDbServices.createDislike",
      userId,
      dislikedById,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message: "Something went wrong while creating a dislike",
    };
  }
};

export const deleteDislike = async (dislikeId: string) => {
  try {
    if (!dislikeId) {
      return {
        success: false,
        message: "Dislike ID is required",
      };
    }

    const dislike = await dbContext.dislike.findUnique({
      where: {
        id: dislikeId,
      },
    });

    if (!dislike) {
      return {
        success: false,
        message: "Dislike not found",
      };
    }

    await dbContext.dislike.delete({
      where: {
        id: dislikeId,
      },
    });

    return {
      success: true,
      message: "Dislike deleted successfully",
    };
  } catch (error) {
    logger.error(error, {
      section: "dislikesDbServices.deleteDislike",
      dislikeId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message: "Something went wrong while deleting a dislike",
    };
  }
};

export const getDislikes = async (take: number, skip: number) => {
  try {
    if (take < 0 || skip < 0) {
      return {
        success: false,
        message: "Invalid pagination parameters",
      };
    }

    const dislikes = await dbContext.dislike.findMany({
      take: take,
      skip: skip,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        userId: true,
        dislikedById: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: dislikes,
    };
  } catch (error) {
    logger.error(error, {
      section: "dislikesDbServices.getDislikes",
      take,
      skip,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message: "Something went wrong while fetching dislikes",
    };
  }
};
