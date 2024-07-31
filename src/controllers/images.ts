import dbContext from "./dbContext";
import logger from "../cors/logger";

export const createImage = async (userId: string, filename: string) => {
  try {
    if (!userId || !filename) {
      return {
        success: false,
        message: "User ID and Filename are required",
      };
    }

    const newImage = await dbContext.image.create({
      data: {
        filename,
        userId,
      },
    });

    return {
      success: true,
      data: newImage,
    };
  } catch (error) {
    logger.error(error, {
      section: "imagesDbServices.createImage",
      userId,
      filename,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message: "Something went wrong while creating an image",
    };
  }
};

export const removeImage = async (imageId: string) => {
  try {
    if (!imageId) {
      return {
        success: false,
        message: "Image ID is required",
      };
    }

    await dbContext.image.delete({
      where: {
        id: imageId,
      },
    });

    return {
      success: true,
      message: "Image deleted successfully",
    };
  } catch (error) {
    logger.error(error, {
      section: "imagesDbServices.removeImage",
      imageId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message: "Something went wrong while deleting the image",
    };
  }
};

export const getUserImages = async (userId: string) => {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
      };
    }

    const images = await dbContext.image.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        filename: true,
      },
    });

    return {
      success: true,
      data: images.map((image) => image.filename),
    };
  } catch (error) {
    logger.error(error, {
      section: "imagesDbServices.getUserImages",
      userId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      message: "Something went wrong while fetching user images",
    };
  }
};
