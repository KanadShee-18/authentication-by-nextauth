"use server";

import * as z from "zod";
import { SettingsSchema } from "@/schemas";
import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/prisma/prisma";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser();

  if (!user) {
    return {
      error: "Unauthorized!",
    };
  }
  if (user && user.id) {
    const dbUser = await getUserById(user?.id);

    if (!dbUser) {
      return {
        error: "Unauthorized!",
      };
    }

    await prisma.user.update({
      where: {
        id: dbUser.id,
      },
      data: {
        ...values,
      },
    });
  }
  return {
    success: "Settings updated!",
  };
};
