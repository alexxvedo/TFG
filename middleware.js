import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/sesiones(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next|/collections).*)", // Excluye directamente las rutas bajo /collections
    "/",
    "/(api|trpc)(.*)",
  ],
};
