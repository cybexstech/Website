import type { NextConfig } from "next";

// `output: "standalone"` is ONLY for the sandbox / self-hosted runtime
// (`.next/standalone/server.js`). On Vercel it changes the build output and is
// a known cause of whole-deployment 404 NOT_FOUND errors, so it must be
// disabled whenever building inside Vercel (`VERCEL=1` is set automatically).
const isVercelBuild = process.env.VERCEL === "1";

// Prisma picks its query-engine binary at RUNTIME based on the host platform,
// so the file tracer cannot see it statically. Without this, a bundle built
// outside Vercel would deploy without the matching engine and every database
// call would fail in production. Applied to every route that can touch the DB.
const prismaEngineTracing = [
  "./node_modules/.prisma/client/**",
  "./node_modules/@prisma/engines/**",
];

const nextConfig: NextConfig = {
  ...(isVercelBuild ? {} : { output: "standalone" }),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  outputFileTracingIncludes: {
    "/": prismaEngineTracing,
    "/insights": prismaEngineTracing,
    "/insights/**": prismaEngineTracing,
    "/sitemap.xml": prismaEngineTracing,
    "/admin/**": prismaEngineTracing,
    "/api/**": prismaEngineTracing,
  },
};

export default nextConfig;
