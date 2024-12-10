const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');
const talisoftTailwindPreset = require("../../libs/shared/ui/styles/src/themes/tailwind.preset")

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    talisoftTailwindPreset
  ],
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
