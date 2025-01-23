"use server";

import * as z from "zod";
import { prisma } from "@/prisma/prisma";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { generateVerificationToken } from "@/lib/tokens";

export const login = async (data: z.infer<typeof LoginSchema>) => {
  const validatedData = LoginSchema.parse(data);
  if (!validatedData) {
    return {
      error: "Invalid input data.",
    };
  }
  const { email, password } = validatedData;

  const userExistance = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!userExistance || !userExistance.password || !userExistance.email) {
    return {
      error: "User not found. Register yourself first!",
    };
  }

  if (!userExistance.emailVerified){
    const verificationToken = await generateVerificationToken(email);

    return {
      success: "Confirmation email sent successfully!"
    }
  }

  try {
    await signIn("credentials", {
      email: userExistance.email,
      password: password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid Credentials!" };
        default:
          return { error: "Please confirm your email address and password" };
      }
    }
    throw error;
  }

  return {
    success: "User logged in successfully",
  };
};
