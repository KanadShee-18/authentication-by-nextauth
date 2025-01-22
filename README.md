# Next-auth v5:

---

## Table Of Contents:

- [Prisma Setup](#set-up-prisma-with-db)
- [Auth.Js Configuration](#authjs-configuration)

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
