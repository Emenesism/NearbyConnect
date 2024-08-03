import { getTokenSourceMapRange } from "typescript";
import { calculateDistance } from "../cors/locationHelper";
import logger from "../cors/logger";
import dbContext from "./dbContext";

export const createUser = async (
  name: string,
  email: string,
  hash: string,
  lat: number,
  lon: number
) => {
  try {
    logger.info(`Attempting to create a user: ${email}`);

    const newUser = await dbContext.user.create({
      data: {
        name,
        email,
        hash,
        lat,
        lon,
      },
    });

    logger.info(`User created successfully: ${newUser.email}`);

    return {
      success: true,
      message: "User created successfully",
      data: newUser,
    };
  } catch (error) {
    logger.error(`Error creating user: ${email}, Error: ${error.message}`);

    return {
      success: false,
      message: "Something went wrong while creating the user",
      error: error.message,
    };
  }
};

export const getAllUsers = async () => {
  try {
    logger.info("Attempting to retrieve all users");

    const users = await dbContext.user.findMany();

    if (!users || users.length === 0) {
      logger.warn("No users found");

      return {
        success: false,
        message: "No users found",
      };
    }

    logger.info("Successfully retrieved all users");

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    logger.error(`Error retrieving all users: ${error.message}`);

    return {
      success: false,
      message: "Something went wrong while retrieving users",
      error: error.message,
    };
  }
};

export const getUserById = async (id: string) => {
  try {
    logger.info(`Attempting to retrieve user with ID: ${id}`);

    const user = await dbContext.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      logger.warn(`User not found with ID: ${id}`);

      return {
        success: false,
        message: "User not found",
      };
    }

    logger.info(`Successfully retrieved user with ID: ${id}`);

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    logger.error(
      `Error retrieving user with ID: ${id}, Error: ${error.message}`
    );

    return {
      success: false,
      message: "Something went wrong while retrieving the user",
      error: error.message,
    };
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    logger.info(`Attempting to retrieve user with email: ${email}`);

    const user = await dbContext.user.findUnique({
      where: { email: email },
      select : {
        images : true,
        name : true,
        email : true,
        lat : true,
        lon : true,
        hash : true,
        id : true
      }
    });

    if (!user) {
      logger.warn(`User not found with email: ${email}`);

      return {
        success: false,
        message: "User not found",
      };
    }

    logger.info(`Successfully retrieved user with email: ${email}`);

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    logger.error(
      `Error retrieving user with email: ${email}, Error: ${error.message}`
    );

    return {
      success: false,
      message: "Something went wrong while retrieving the user",
      error: error.message,
    };
  }
};

export const findNearbyUsers = async (userId: string): Promise<any> => {
  try {
    logger.info(`Attempting to find nearby users for user ID: ${userId}`);

    const currentUser = await dbContext.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      logger.warn(`User not found with ID: ${userId}`);

      return {
        success: false,
        message: "User not found",
      };
    }

    logger.info(`Successfully retrieved user with ID: ${userId}`);

    const { lat: userLat, lon: userLon } = currentUser;

    const users = await dbContext.user.findMany({
      where: {
        id: {
          not: userId, // Exclude the current user
        },
      },
      select: {
        id : true,
        name: true, // Select only the name field
        email: true, // Select only the email field
        lat: true,
        lon: true,
        images: true, // Include related images
      },
    });

    logger.info(`Retrieved ${users.length} users from the database`);

    const nearbyUsers = users.filter((user) => {
      const distance = calculateDistance(userLat, userLon, user.lat, user.lon);
      return distance < 10;
    });

    logger.info(
      `Found ${nearbyUsers.length} nearby users within 10 kilometers of user ID: ${userId}`
    );

    return {
      success: true,
      data: nearbyUsers,
    };
  } catch (error) {
    logger.error(
      `Error finding nearby users for user ID: ${userId}, Error: ${error.message}`
    );

    return {
      success: false,
      message: "Something went wrong while finding nearby users",
      error: error.message,
    };
  }
};

export const updateUser = async (
  email: string,
  name?: string,
  hash?: string,
  lat?: number,
  lon?: number
) => {
  try {
    logger.info(`Attempting to update user with email: ${email}`);

    const existingUser = await dbContext.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      logger.warn(`User with email ${email} not found`);

      return {
        success: false,
        message: `User with email ${email} not found`,
      };
    }

    const updatedUser = await dbContext.user.update({
      where: { email },
      data: {
        name: name ?? existingUser.name,
        hash: hash ?? existingUser.hash,
        lat: lat ?? existingUser.lat,
        lon: lon ?? existingUser.lon,
      },
    });

    logger.info(`User updated successfully: ${updatedUser.email}`);

    return {
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    };
  } catch (error) {
    logger.error(`Error updating user: ${email}, Error: ${error.message}`);

    return {
      success: false,
      message: "Something went wrong while updating the user",
      error: error.message,
    };
  }
};
