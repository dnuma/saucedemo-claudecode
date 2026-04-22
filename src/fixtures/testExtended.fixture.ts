import { test as base } from "@playwright/test";

type Fixtures = {
  password: string;
  standardUser: string;
  lockedOutUser: string;
  problemUser: string;
  performanceGlitchUser: string;
  errorUser: string;
  visualUser: string;
};

export const test = base.extend<Fixtures>({
  password: async ({}, use) => {
    await use(process.env.PASSWORD!);
  },
  standardUser: async ({}, use) => {
    await use(process.env.STANDARD_USER!);
  },
  lockedOutUser: async ({}, use) => {
    await use(process.env.LOCKED_OUT_USER!);
  },
  problemUser: async ({}, use) => {
    await use(process.env.PROBLEM_USER!);
  },
  performanceGlitchUser: async ({}, use) => {
    await use(process.env.PERFORMANCE_GLITCH_USER!);
  },
  errorUser: async ({}, use) => {
    await use(process.env.ERROR_USER!);
  },
  visualUser: async ({}, use) => {
    await use(process.env.VISUAL_USER!);
  },
});

export { expect, Page } from "@playwright/test";
