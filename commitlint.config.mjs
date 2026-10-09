/**
 * Conventional Commits: `type(scope): subject`, e.g. `feat(auth): add password reset`.
 * Types: feat fix docs style refactor perf test build ci chore revert
 */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 200],
  },
};

export default config;
