import logger from "../cors/logger";
import dbContext from "./dbContext";

export const createUser = async (
  name: string,
  email: string,
  hash: string,
  location?: string
) => {
  try {
    logger.info("Attempting to create a user: %s", email);

    const newUser = await dbContext.user.create({
      data: {
        name,
        email,
        hash,
        location,
      },
    });

    logger.info("User created successfully: %s", newUser.email);

    return {
      success: true,
      message: "User created successfully",
      data: newUser,
    };
  } catch (error) {
    logger.error("Error creating user: %s, Error: %s", email, error.message);

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
    logger.error("Error retrieving all users: %s", error.message);

    return {
      success: false,
      message: "Something went wrong while retrieving users",
      error: error.message,
    };
  }
};

export const getUserById = async (id: string) => {
  try {
    logger.info("Attempting to retrieve user with ID: %s", id);

    const user = await dbContext.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      logger.warn("User not found with ID: %s", id);

      return {
        success: false,
        message: "User not found",
      };
    }

    logger.info("Successfully retrieved user with ID: %s", id);

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    logger.error(
      "Error retrieving user with ID: %s, Error: %s",
      id,
      error.message
    );

    return {
      success: false,
      message: "Something went wrong while retrieving the user",
      error: error.message,
    };
  }
};

export const getUserByEmail = async (email) => {
  try {
    logger.info("Attempting to retrieve user with email: %s", email);

    const user = await dbContext.user.findUnique({
      where: { email: email},
    });

    if (!user) {
      logger.warn("User not found with email: %s", email);

      return {
        success: false,
        message: "User not found",
      };
    }

    logger.info("Successfully retrieved user with email: %s", email);

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    logger.error(
      "Error retrieving user with email: %s, Error: %s",
      email,
      error.message
    );

    return {
      success: false,
      message: "Something went wrong while retrieving the user",
      error: error.message,
    };
  }
};
