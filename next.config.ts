import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Docker build sets STANDALONE_BUILD=1 for a self-contained server in
  // .next/standalone that traces only the node_modules it needs. Off by
  // default: `next start` doesn't support standalone output.
  output: process.env.STANDALONE_BUILD === "1" ? "standalone" : undefined,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        // Leave CSS Modules to Next.js; renaming them `as: "*.css"` would load
        // them as global CSS and their class-name imports would be empty.
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
