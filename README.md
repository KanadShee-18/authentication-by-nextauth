# Next-auth v5:

---

## Table Of Contents:

- [Prisma Setup](#set-up-prisma-with-db)
- [Auth.Js Configuration](#authjs-configuration)

---

- [OAuth Providers](#oauth-providers)
  1. [Google Provider](#google-provider)
  2. [Github Provider](#github-provider)

---

- [Shadcn Initialization](#shadcn-initialization)
- [Custom Register Page](#custom-register-page)
- [Custom Login Page](#custom-login-page)
  1. [Credentials function in auth.ts](#credentials-function-for-signin)
  2. [Custom Google Login Button](#google-login-action)
  3. [Custom Github Login Button](#github-login-action)

---

- [Callbacks](#callbacks)
  1. [jwt and session callback](#jwt-and-session-callback)
  2. [signIn callback](#signin-callback)

---

- [Middleware](#middlewares)

---

## Initialize an empty next-js project

```
npx create-next-app@latest
```

---

## Set-up Prisma with DB

- First install **prisma** by running

```
npm install prisma --save-dev
```

- Then initialize prisma in project:

```
npx prisma init
```

- Now it will create a prisma folder and will add an .env file in our project directory.

- Add DB url in .env

```
DATABASE_URL="postgresql://..........................."
```

- Add two models User and Account in **schema.prisma** file.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  accounts      Account[]
  password      String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

```

- > Note: Here make sure to make the password optional as for Google or Github there will be no password.

- Now, run the command to push schemas to db:

```
npx prisma db push
```

- After succesfully doing all the steps, run

```
npx prisma studio
```

- We can see out created models in our localhost:5555

- Now, install prisma client so that we can access all models throughout our project

```
npm install @prisma/client
```

- Now, we can use PrismaClient in our project like

```typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
```

- > Note: This is not the right way to do this as it will create a bunch of connection or a connection pool for each time request. So, rather than doing this, we'll do something else.

- Create a new file named **prisma.ts** inside the prisma folder and add the following code.

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- So, now this will allow us to use the prisma variable throughout our application with one pool connection automatically.

### So, the ORM setup is done successfully.

---

## Auth.Js Configuration:

- First we have to install the latest version of next-auth

```
npm install next-auth@beta
```

- Now, we have to install one more additional thing **Prisma Adaptor** from Auth.Js so that it can work with prisma.

```
npm install @auth/prisma-adapter
```

- Next, we have to make two files:

  1. auth.ts
  2. auth.config.ts

- The auth.config.ts is created as in auth we can't use prisma as it it is not edge compatible.

```typescript
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [Google({}), Credentials({})],
} satisfies NextAuthConfig;
```

and we will accquire this to **auth.ts** file

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma/prisma";
import authConfig from "@/auth.config";

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});
```

- Now, we have to make a route which will handle all requests inside app > api > auth > [...nextauth] > route.ts and add a simple line of code here.

```typescript
export { GET, POST } from "@/auth";
```

- And also add one more secret in **.env** as AUTH_SECRET:

```
AUTH_SECRET=asyourwishvalue
```

---

## OAuth Providers:

## Google Provider:

### Lets complete the Google Provider

- > Go to console.cloud.google.com and get the OAuth client id and client secret and add them in **.env** file

```ts
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({}),
    Credentials({}),
  ],
} satisfies NextAuthConfig;
```

- In similar way we can add GitHub also:

## GitHub Provider:

```ts
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({}),
  ],
} satisfies NextAuthConfig;
```

- > NOTE: Make sure to add **Homepage URL** and **Callback URL** in getting the secrets for both the providers.

```
Homepage URL: http://localhost:3000
Callback URL: http://localhost:3000/api/auth/callback/<provider-name>
```

- > NOTE: Make sure to change the domain name after deployment

---

## Shadcn initialization:

- First we will create a custom sign up page.

- Let's initialize shadcn for our project.

```
npx shadcn@latest init
```

- Now, we will add some components from shadcn: button, form, card, label etc.

---

## Custom Register Page:

- First, in the app folder create a route for register: app > auth > register > page.tsx

```ts
import RegisterForm from "@/components/auth/register-form";
import React from "react";

const RegisterPage = () => {
  return (
    <>
      <RegisterForm />
    </>
  );
};

export default RegisterPage;
```

- We'll make a client component RegisterForm as we're going to use hooks states etc.

- Inside components dir, create another folder **auth** and make a component called register-form.tsx

```ts
"use client";

import React from "react";

const RegisterForm = () => {
  return <div>register-form</div>;
};

export default RegisterForm;
```

- Now, make a schemas folders where we'll write zod validation and make a file named index.ts where we'll add our register schema.

```ts
import * as z from "zod";

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  password: z.string().min(6, {
    message: "Passwords must be at least 6 characters long.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Passwords must be at least 6 characters long.",
  }),
});
```

- Now, we will create some reusable components which we can use in both signin and register form.
  For ex:
  Inside @/components/auth,

  1. auth-header.tsx
  2. back-button.tsx
  3. form-error.tsx
  4. form-success.tsx
  5. card-wrapper.tsx
  6. forget-password.tsx

- These custom compoenent now will be used in register-form or any other component as it needed.

- Create a server action.
- For that create a new dir as actions in root dir and create a file named register.ts

```ts
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
        error: "User already exists or user email currently in use!",
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
```

- Now, we can use this server action in our register component.

- Our final register component will be:

```ts
"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CardWrapper from "@/components/auth/card-wrapper";
import FormSuccess from "@/components/auth/form-success";
import FormError from "@/components/auth/form-error";
import * as z from "zod";
import { register } from "@/actions/register";

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleOnSubmit = async (data: z.infer<typeof RegisterSchema>) => {
    setLoading(true);
    register(data).then((res) => {
      if (res.error) {
        setLoading(false);
        setError(res.error);
        setSuccess("");
      }
      if (res.success) {
        setLoading(false);
        setError("");
        setSuccess(res.success);
      }
      setLoading(false);
    });
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      title="Register Yourself"
      backButtonLabel="Already have an account"
      backButtonHref="/auth/login"
      fgtPasswordHref="/"
      fgtPasswordText="Forget Password"
      showSocials
    >
      <Form {...form}>
        <form
          action=""
          onSubmit={form.handleSubmit(handleOnSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      type="email"
                      placeholder="Enter email address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      type="text"
                      placeholder="Enter your name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      type="password"
                      placeholder="Enter a strong password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      type="password"
                      placeholder="Confirm your password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {success && <FormSuccess successMessage={success} />}
          {error && <FormError errorMessage={error} />}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting" : "SIGN UP"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;
```

- > Here in place of loading we also can use useTransition hook of react also.

---

## Custom Login Page:

- First, we've to make login schema.

```ts
export const LoginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(1, {
    message: "Please enter a valid password.",
  }),
});
```

- Now we have to make server action called login.ts

```ts
"use server";

import * as z from "zod";
import { prisma } from "@/prisma/prisma";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const login = async (
  data: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null
) => {
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

  console.log("After user check ......");

  try {
    await signIn("credentials", {
      email: userExistance.email,
      password: password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
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
```

- Now, we have to complete the credentials login functionality in **auth.ts** file.

## Credentials function for signIn:

```ts
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { LoginSchema } from "@/schemas";
import { prisma } from "./prisma/prisma";
import bcrypt from "bcryptjs";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedData = LoginSchema.safeParse(credentials);
        if (!validatedData.success) return null;
        const { email, password } = validatedData.data;
        const user = await prisma.user.findFirst({
          where: {
            email: email,
          },
        });
        if (!user || !user.password || !user.email) {
          return null;
        }
        const passwordMached = await bcrypt.compare(password, user.password);
        if (passwordMached) {
          return user;
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
```

- This way with google and github we have added credentials configuration also.

- Lets build custom buttons for Google and Github login.

- For that first make the actions for those buttons

- ### Google Login Action:

```ts
// actions > google-login.ts
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function GoogleAuthentication() {
  try {
    await signIn("google");
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Google Login Failed!" };
    }
    throw error;
  }
}
```

- ### Github Login Action:

```ts
// actions > github-login.ts
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function GithubAuthentication() {
  try {
    await signIn("github");
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Github Authentication failed!",
      };
    }
    throw error;
  }
}
```

- Lets create a component with two buttons Google and Github.

- First we have made a custom Goggle-login button.

```ts
"use client";

import React from "react";
import { GoogleAuthentication } from "@/actions/google-login";
import { useActionState } from "react";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";

const GoogleLogin = () => {
  const [errorMessageGoogle, dispatchGoogleAction] = useActionState(
    GoogleAuthentication,
    undefined
  );
  return (
    <form action={dispatchGoogleAction} className="w-full">
      <Button className="w-full" variant={"outline"}>
        <FcGoogle />
      </Button>
      <p className="text-rose-400 text-sm mt-5">{errorMessageGoogle}</p>
    </form>
  );
};

export default GoogleLogin;
```

- and similar way Github-login compoent:

```ts
"use client";

import React from "react";
import { GithubAuthentication } from "@/actions/github-login";
import { useActionState } from "react";
import { BsGithub } from "react-icons/bs";

import { Button } from "@/components/ui/button";

const GithubLogin = () => {
  const [errorMessageGithub, dispatchGithubAction] = useActionState(
    GithubAuthentication,
    undefined
  );
  return (
    <form action={dispatchGithubAction} className="w-full">
      <Button className="w-full" variant={"outline"}>
        <BsGithub />
      </Button>
      <p>{errorMessageGithub}</p>
    </form>
  );
};

export default GithubLogin;
```

- Now, a component named Socials has been made:

```ts
"use client";

import React from "react";
import GoogleLogin from "@/components/auth/google-login";
import GithubLogin from "@/components/auth/github-login";

const Socials = () => {
  return (
    <div className="w-full">
      <hr />
      <p className="w-full my-6 text-center text-sm text-slate-300">
        Or, Sign in with
      </p>

      <div className="w-full flex gap-x-2">
        <div className="w-1/2">
          <GoogleLogin />
        </div>
        <div className="w-1/2">
          <GithubLogin />
        </div>
      </div>
    </div>
  );
};

export default Socials;
```

### So, we have to done with the credentials and providers authentication.

---

## Callbacks:

### Callbacks are asynchronous function which help us control what happens when any action is performed.

- First of all, as we are using strategy as "jwt", so we are going to use jwt callback

- So, now we'll make two utility function which will be called inside this jwt callback

```ts
// data/account.ts
import { prisma } from "@/prisma/prisma";

export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
      },
    });
    return account;
  } catch (error) {
    console.log(error);
    return null;
  }
};
```

and

```ts
// data/user.ts
import { prisma } from "@/prisma/prisma";

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};
```

- Now, we have to configure our callback and session in **auth.ts** file:

### **"jwt"** and **"session"** callback:

```ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma/prisma";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getAccountByUserId } from "./data/account";

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    async jwt({ token }) {
      if (!token.sub) {
        return token;
      }

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOauth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.image = existingUser.image;

      return token;
    },
    async session({ token, session }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          isOauth: token.isOauth,
        },
      };
    },
  },
});
```

- > NOTE: We do this stuff, as session is accessible in client side but jwt not so we can use user id or image to show their dp or any other stuffs as session is accessible to the client side.

- Now, one more callback is there called **signIn** callback.

  > Use this signIn() callback to control if a user is allowed to sign in.

- So, after adding **signIn** callback our auth.ts file will be:

### **SignIn** callback:

```ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma/prisma";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getAccountByUserId } from "./data/account";

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        return true;
      }
      const existingUser = await getUserById(user.id ?? "");
      if (!existingUser?.emailVerified) {
        return false;
      }
      return true;
    },
    async jwt({ token }) {
      if (!token.sub) {
        return token;
      }

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOauth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.image = existingUser.image;

      return token;
    },
    async session({ token, session }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          isOauth: token.isOauth,
        },
      };
    },
  },
});
```

---

## Middlewares:

- For setting up middleware, first we have to make a file named as **middleware.ts** file.

- Now, we will make another file named **routes.ts** where we can specify our all private, public and auth routes like this:

```ts
export const privateRoutes = ["/dashboard"];

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export const AUTH_LOGIN = "/auth/login";
```

- Now, in our **middleware.ts** file we can use these routes.

```ts
import authConfig from "./auth.config";
import NextAuth from "next-auth";
import { AUTH_LOGIN, DEFAULT_LOGIN_REDIRECT, privateRoutes } from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  //   console.log("Middleware called", req.nextUrl.pathname);
  //   console.log("Logged in or not: ", req.auth);
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isPrivateRoutes = privateRoutes.includes(nextUrl.pathname);
  const isAuthRoute = nextUrl.pathname.includes("/auth");
  const isApiRoute = nextUrl.pathname.includes("/api");

  if (isApiRoute) {
    return;
  }
  if (isLoggedIn && isAuthRoute) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }
  if (isAuthRoute && !isLoggedIn) {
    return;
  }
  if (!isLoggedIn && isPrivateRoutes) {
    return Response.redirect(new URL(AUTH_LOGIN, nextUrl));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

- Here the middleware run in all routes matching with the matcher config.

### This way we can setup middleware for our nextauth project.

---

## Email Verification:

### Now we have to verify the email for the user. Otherwise the user will register with any invalid email address.

- First we have to add a new model as VerificationToken

```prisma
model VerificationToken {
  id String @id @default(cuid())
  email String
  token String @unique
  expires DateTime

  @@unique([email, token])
}
```

- Now, run two prisma command for this model

```
npx prisma generate
```

```
npx prisma db push
```
- First, we have to search that is there any token present, if present check if not create one. So first make this function



- Now, we have to make a function to generate verification token for us.



```ts
// lib/tokens.ts

```