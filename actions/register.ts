"use server";

import * as z from "zod";
import { prisma } from "@/prisma/prisma";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/schemas";

export const register = async (data: z.infer<typeof RegisterSchema>) => {
  try {
    const validatedData = RegisterSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        error: "Invalid input data.",
      };
    }
    const { email, name, password, confirmPassword } = validatedData.data;

    if (password !== confirmPassword) {
      return {
        error: "Both of the passwords have to be matched.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userExistance = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (userExistance) {
      return {
        error: "User already exists or user email is currently in use!",
      };
    }

    const lowercaseEmail = email.toLowerCase();

    await prisma.user.create({
      data: {
        email: lowercaseEmail,
        name,
        password: hashedPassword,
      },
    });

    return {
      success: "User registration successfull.",
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Some error occurred while registering!",
    };
  }
};
