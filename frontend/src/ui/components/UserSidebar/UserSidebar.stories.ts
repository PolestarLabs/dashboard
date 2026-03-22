import type { Meta, StoryObj } from '@storybook/vue3-vite';
import UserSidebar from './UserSidebar.vue';
import type { SidebarUser, SidebarProfile } from './UserSidebar.vue';
import './UserSidebar.scss';

const mockUser: SidebarUser = {
  id: '288072506784382977',
  username: 'CelestialMaid',
  avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
};

const mockProfile: SidebarProfile = {
  donator: 'Gold',
  profile: {
    bgID: 'default',
    tagline: 'Dreaming among the stars ✨',
  },
  currency: {
    RBN: 142580,
    JDE: 2915,
    SPH: 74,
  },
};

const meta: Meta<typeof UserSidebar> = {
  title: 'Pollux-Specific Components/User Sidebar',
  component: UserSidebar,
  tags: ['autodocs'],
  argTypes: {
    eventEnd: { control: 'text' },
  },
  decorators: [
    () => ({
      template: `
        <div style="display: flex; justify-content: flex-end; padding: 12px; min-height: 100vh; background: #181825;">
          <story />
        </div>
      `,
    }),
  ],
};

export default meta;

type Story = StoryObj<typeof UserSidebar>;

export const LoggedIn: Story = {
  args: {
    user: mockUser,
    profile: mockProfile,
  },
};

export const LoggedOut: Story = {
  args: {
    user: null,
    profile: null,
  },
};

export const NoDonatorBadge: Story = {
  args: {
    user: mockUser,
    profile: { ...mockProfile, donator: null },
  },
};

export const WithActiveEvent: Story = {
  args: {
    user: mockUser,
    profile: mockProfile,
    eventEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

export const ZeroCurrencies: Story = {
  args: {
    user: mockUser,
    profile: {
      ...mockProfile,
      currency: { RBN: 0, JDE: 0, SPH: 0 },
    },
  },
};
