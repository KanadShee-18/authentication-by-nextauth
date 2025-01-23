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
