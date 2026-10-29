// Stand-ins for Next.js request APIs in route and action tests. Mock with:
//   vi.mock("next/navigation", () => import("@tests/helpers/next").then((m) => m.navigation));
//   vi.mock("next/server", () => import("@tests/helpers/next").then((m) => m.server));
// redirect() and notFound() throw, as the real ones do, with a message tests
// can match: "NEXT_REDIRECT [type] <url>" and "NEXT_NOT_FOUND".

export const navigation = {
  RedirectType: { replace: "replace", push: "push" },
  redirect: (url: string, type?: string): never => {
    throw new Error(["NEXT_REDIRECT", type, url].filter(Boolean).join(" "));
  },
  notFound: (): never => {
    throw new Error("NEXT_NOT_FOUND");
  },
};

export const server = { connection: async () => {} };
