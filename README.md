# Next-auth v5:

---

## Table Of Contents:

- [Prisma Setup](#set-up-prisma-with-db)
- [Auth.Js Configuration](#authjs-configuration)
- [OAuth Providers](#oauth-providers)
  1. [Google Provider](#google-provider)
  2. [Github Provider](#github-provider)
- [Shadcn Initialization](#shadcn-initialization)
- [Custom Register Page](#custom-register-page)

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

- First, in the app folder create a route for register: app > register > page.tsx

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

- These custom compoenent now will be used in register-form.
