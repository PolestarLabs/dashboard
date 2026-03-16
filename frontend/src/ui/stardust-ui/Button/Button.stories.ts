import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Button from './Button.vue';

const meta: Meta<typeof Button> = {
  title: 'Stardust UI/Basic Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: { 
    theme: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'success', 'warning', 'info'],
    },
    variant: {
      control: { type: 'radio' },
      options: ['solid', 'ghost', 'fancy'],
    },
    size: {
      control: { type: 'radio' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    icon: {
      control: { type: 'text' },
      description: 'Font Awesome icon class(es), e.g. fas fa-check',
    },
    iconposition: {
      control: { type: 'select' },
      options: ['left', 'right'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const SolidWithIcon: Story = {
  args: {
    theme: 'primary',
    variant: 'solid',
    size: 'md',
    iconposition: 'left',
    icon: 'fab fa-dribbble',
    label: 'Continue',
  },
};



export const Ghost: Story = {
  args: {
    theme: 'primary',
    variant: 'ghost',
    iconposition: 'left',
    icon: 'fas fa-ghost',
    label: 'Ghost',
  },
};

export const WithIconOnRight: Story = {
  args: {
    theme: 'primary',
    variant: 'solid',
    size: 'md',
    iconposition: 'right',
    icon: 'fas fa-arrow-right',
    label: 'Next',
  },
};

export const Fancy: Story = {
  args: {
    theme: 'primary',
    variant: 'fancy',
    size: 'md',
    icon: 'fas fa-wand-magic-sparkles',
    label: 'Fancy',
  },
};


export const ThemeVariants: Story = {
  render: (args) => ({
    components: { Button },
    setup() {
      const iconFor = (theme) => {
        if (theme === 'success') return 'fas fa-check';
        if (theme === 'warning') return 'fas fa-exclamation-triangle';
        if (theme === 'danger') return 'fas fa-times';
        if (theme === 'info') return 'fas fa-info-circle';
        if (theme === 'secondary') return 'fas fa-cog';
        return 'fas fa-star';
      };

      return { args, iconFor };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <div style="font-weight: 700; margin-bottom: 0.5rem;">Solid (with icons)</div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-start;">
            <!-- first row: primary + secondary -->
            <div style="display: flex; gap: 0.75rem;">
              <Button
                v-for="theme in ['primary', 'secondary']"
                :key="theme + '-solid'"
                v-bind="args"
                variant="solid"
                :theme="theme"
                :icon="iconFor(theme)"
                iconposition="left"
                :label="theme"
              />
            </div>
            <!-- second row: remaining themes -->
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <Button
                v-for="theme in ['danger', 'success', 'warning', 'info']"
                :key="theme + '-solid'"
                v-bind="args"
                variant="solid"
                :theme="theme"
                :icon="iconFor(theme)"
                iconposition="left"
                :label="theme"
              />
            </div>
          </div>
        </div>

        <div style="width: 100%; height: 0;"></div>

        <div>
          <div style="font-weight: 700; margin-bottom: 0.5rem;">Ghost</div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-start;">
            <!-- first row: primary + secondary -->
            <div style="display: flex; gap: 0.75rem;">
              <Button
                v-for="theme in ['primary', 'secondary']"
                :key="theme + '-ghost'"
                v-bind="args"
                variant="ghost"
                :theme="theme"
                :icon="
                  theme === 'success' ? 'fas fa-check' :
                  theme === 'warning' ? 'fas fa-exclamation-triangle' :
                  theme === 'danger' ? 'fas fa-times' :
                  theme === 'info' ? 'fas fa-info-circle' :
                  theme === 'secondary' ? 'fas fa-cog' :
                  'fas fa-star'
                "
                iconposition="left"
                :label="theme"
              />
            </div>
            <!-- second row: remaining themes -->
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <Button
                v-for="theme in ['danger', 'success', 'warning', 'info']"
                :key="theme + '-ghost'"
                v-bind="args"
                variant="ghost"
                :theme="theme"
                :icon="iconFor(theme)"
                iconposition="left"
                :label="theme"
              />
            </div>
          </div>
        </div>

        <div>
          <div style="font-weight: 700; margin-bottom: 0.5rem;">Small</div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-start;">
            <!-- first row: primary + secondary -->
            <div style="display: flex; gap: 0.75rem;">
              <Button
                v-for="theme in ['primary', 'secondary']"
                :key="theme + '-sm'"
                v-bind="args"
                size="sm"
                :theme="theme"
                :icon="iconFor(theme)"
                iconposition="left"
                :label="theme"
              />
            </div>
            <!-- second row: remaining themes -->
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <Button
                v-for="theme in ['danger', 'success', 'warning', 'info']"
                :key="theme + '-sm'"
                v-bind="args"
                size="sm"
                :theme="theme"
                :icon="iconFor(theme)"
                iconposition="left"
                :label="theme"
              />
            </div>
          </div>
        </div>

        <div>
          <div style="font-weight: 700; margin-bottom: 0.5rem;">Fancy</div>
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-start;">
            <!-- first row: primary + secondary -->
            <div style="display: flex; gap: 0.75rem;">
              <Button
                v-for="theme in ['primary', 'secondary']"
                :key="theme + '-fancy'"
                v-bind="args"
                variant="fancy"
                :theme="theme"
                :icon="iconFor(theme)"
                iconposition="left"
                :label="theme"
              />
            </div>
            <!-- second row: remaining themes -->
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <Button
                v-for="theme in ['danger', 'success', 'warning', 'info']"
                :key="theme + '-fancy'"
                v-bind="args"
                variant="fancy"
                :theme="theme"
                :icon="iconFor(theme)"
                iconposition="left"
                :label="theme"
              />
            </div>
          </div>
        </div>
      </div>
    `,
  }),
  args: {
    variant: 'solid',
    size: 'md',
  },
};
