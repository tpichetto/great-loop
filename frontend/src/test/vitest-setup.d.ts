import '@testing-library/jest-dom/vitest';

// Extend Vitest's expect with jest-dom matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    interface JestAssertion<T = any> extends Expect {
      toBeInTheDocument(): T;
      toHaveTextContent(text: string): T;
      // Add other jest-dom matchers as needed
    }
  }
}
