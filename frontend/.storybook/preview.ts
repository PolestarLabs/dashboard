import type { Preview } from '@storybook/vue3-vite';
import { themes } from '@storybook/theming';

import { withThemeByClassName } from '@storybook/addon-themes';
import '../src/assets/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './preview.css';

const withThemeBackground = (storyFn, context) => {
  const theme = context.globals?.theme ?? 'pollux';
  return {
    template: `
      <div class="theme-preview-wrapper" style="background: var(--bg-main); margin: 0px; padding: 100px;">
        <story />
      </div>
    `,
    components: { story: storyFn },
  };
};

const preview: Preview = {
  decorators: [
    
    withThemeByClassName({
      themes: {
        pollux: 'theme-pollux',
        noctix: 'theme-noctix',
        cecily: 'theme-cecily',
        australis: 'theme-australis',
        arsenika: 'theme-arsenika',
        borealis: 'theme-borealis',
        lunanuli: 'theme-lunanuli',
        nikoliny: 'theme-nikoliny',
        selenedi: 'theme-selenedi',
      },
      defaultTheme: 'pollux',
      parentSelector: 'html',
    }),
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;