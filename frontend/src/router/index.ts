import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  // Home / auth
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
  { path: '/callback', name: 'auth-callback', component: () => import('@/views/misc/CallbackView.vue') },

  // Commands
  { path: '/commands', name: 'commands', component: () => import('@/views/misc/CommandsView.vue') },

  // Public profile & user subpages
  {
    path: '/user/:id',
    name: 'public-profile',
    component: () => import('@/views/profile/PublicProfileView.vue'),
  },
  {
    path: '/profile/:id',
    name: 'legacy-profile',
    component: () => import('@/views/profile/PublicProfileView.vue'),
  },
  {
    path: '/user/:id/commends',
    name: 'user-commends',
    component: () => import('@/views/profile/UserCommendsView.vue'),
  },
  {
    path: '/user/:id/commends/:direction',
    name: 'user-commends-rank',
    component: () => import('@/views/profile/UserCommendsRankView.vue'),
  },
  {
    path: '/user/:id/fanart',
    name: 'user-fanart',
    component: () => import('@/views/profile/UserFanartGalleryView.vue'),
  },

  // Dashboard shell + profile settings
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard/booru',
    name: 'dashboard-booru',
    component: () => import('@/views/dashboard/DashboardBooruView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard/profile',
    name: 'dashboard-profile-settings',
    component: () => import('@/views/dashboard/ProfileSettingsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile/edit/medals',
    name: 'profile-edit-medals',
    component: () => import('@/views/dashboard/ProfileEditMedalsView.vue'),
    meta: { requiresAuth: true },
  },

  // Shop / cosmetics
  {
    path: '/shop',
    name: 'shop-storefront',
    component: () => import('@/views/shop/ShopStorefrontView.vue'),
  },
  {
    path: '/shop/backgrounds',
    name: 'shop-backgrounds',
    component: () => import('@/views/shop/ShopBackgroundsView.vue'),
  },
  {
    path: '/shop/premium',
    name: 'shop-premium',
    component: () => import('@/views/shop/ShopPremiumView.vue'),
  },
  {
    path: '/shop/marketplace',
    name: 'shop-marketplace',
    component: () => import('@/views/shop/ShopMarketplaceView.vue'),
  },
  {
    path: '/shop/marketplace/entry/:id',
    name: 'shop-marketplace-entry',
    component: () => import('@/views/shop/ShopMarketplaceEntryView.vue'),
  },

  // Existing simple routes (stickers/market listing)
  {
    path: '/stickers',
    name: 'stickers',
    component: () => import('@/views/StickersView.vue'),
  },
  {
    path: '/market',
    name: 'market',
    component: () => import('@/views/MarketView.vue'),
  },

  // Leaderboards
  {
    path: '/leaderboards',
    name: 'leaderboards',
    component: () => import('@/views/leaderboards/LeaderboardsView.vue'),
  },
  {
    path: '/leaderboards/:type',
    name: 'leaderboards-type',
    component: () => import('@/views/leaderboards/LeaderboardsView.vue'),
  },

  // Setup / admin
  {
    path: '/setup/:serverId',
    name: 'setup-server',
    component: () => import('@/views/admin/SetupServerView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin-home',
    component: () => import('@/views/admin/AdminHomeView.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();
  if (!auth.initialized) {
    try {
      await auth.fetchMe();
    } catch {
      // ignore
    }
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }
  return next();
});

export default router;

