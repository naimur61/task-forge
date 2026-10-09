/** Runs on `git commit` for staged files only. */
const config = {
  '*.{ts,tsx,js,jsx,mjs,cjs}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.{css,json,md,yml,yaml}': ['prettier --write'],
};

export default config;
