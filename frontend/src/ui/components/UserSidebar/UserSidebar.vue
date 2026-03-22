<template lang="pug">
//- Navbar trigger button
button.user-sidebar-trigger(
  type="button"
  :aria-label="sidebarLabel"
  @click="open = true"
)
  div(v-if="user")
    Avatar.user-sidebar-trigger__avatar(
      :src="user.avatarUrl || ''"
      :alt="user.username"
      :size="40"
      shape="hexagon"
    )
    span.user-sidebar-trigger__name.truncate {{ user.username }}
  div(v-else)
    i.fas.fa-bars
  .user-sidebar-trigger__bg

//- Offcanvas panel
Offcanvas(
  v-model="open"
  mode="slide"
  :flip="true"
  :overlay="true"
  :show-close="true"
  aria-label="User sidebar"
)
  .user-sidebar
    template(v-if="user && profile")
      .user-sidebar__hero
        //- Background image
        img.user-sidebar__bg(
          :src="backdropUrl"
          alt=""
          aria-hidden="true"
        )
        //- Avatar (circular mugshot with accent border)
        .user-sidebar__mugshot
          img.user-sidebar__mugshot-img(
            :src="user.avatarUrl || ''"
            :alt="user.username"
          )
        //- Donator badge below avatar
        .user-sidebar__donor-badge(v-if="profile.donator")
          Badge(:value="profile.donator" variant="warning")

      //- Identity
      .user-sidebar__identity
        h3.user-sidebar__name {{ user.username }}
        i.user-sidebar__tagline(v-if="profile.profile?.tagline") {{ profile.profile.tagline }}

      //- Divider
      hr.user-sidebar__divider

      //- Quick action buttons (stacked)
      .user-sidebar__actions
        a.user-sidebar__action-link(:href="`/user/${user.id}`")
          i.fas.fa-id-card
          span PROFILE
        a.user-sidebar__action-link(href="/dashboard")
          i.fas.fa-cogs
          span DASHBOARD

      hr.user-sidebar__divider

      //- Logout
      .user-sidebar__logout
        Button.user-sidebar__logout-btn(
          theme="danger"
          variant="solid"
          label="LOGOUT"
          @click="$emit('logout')"
        )

      hr.user-sidebar__divider

      //- Currency display (horizontal, dark panel)
      .user-sidebar__subpom
        .user-sidebar__currencies
          .user-sidebar__currency
            Gem(v="RBN" :size="32")
            span.user-sidebar__currency-val {{ abbreviate(profile.currency?.RBN ?? 0) }}
          .user-sidebar__currency
            Gem(v="JDE" :size="32")
            span.user-sidebar__currency-val {{ abbreviate(profile.currency?.JDE ?? 0) }}
          .user-sidebar__currency
            Gem(v="SPH" :size="32")
            span.user-sidebar__currency-val {{ abbreviate(profile.currency?.SPH ?? 0) }}

    template(v-else)
      .user-sidebar__logged-out
        Button(
          theme="info"
          variant="solid"
          icon="fas fa-sign-in-alt"
          label="LOGIN"
          @click="$emit('login')"
        )

  hr.user-sidebar__divider

  //- Navigation menu
  nav.user-sidebar__nav
    a.user-sidebar__nav-item(href="/commands")
      i.fas.fa-cogs
      span Commands

    //- Rubine Market group
    .user-sidebar__nav-group
      button.user-sidebar__nav-item.user-sidebar__nav-group-toggle(
        type="button"
        :aria-expanded="String(marketOpen)"
        @click="marketOpen = !marketOpen"
      )
        i.fa.fa-shopping-basket
        span Rubine Market
        i.user-sidebar__chevron.fas.fa-chevron-down(:class="{ 'user-sidebar__chevron--open': marketOpen }")
      div.user-sidebar__nav-sub-transition
        .user-sidebar__nav-sub(v-if="marketOpen")
          a.user-sidebar__nav-sub-item(href="/shop")
            i.fas.fa-store-alt
            span Storefront
          a.user-sidebar__nav-sub-item(href="/shop/marketplace")
            i.fas.fa-store
            span User Marketplace
          a.user-sidebar__nav-sub-item(href="/shop/premium")
            i.fab.fa-cc-paypal
            span Cash Shop
          .user-sidebar__nav-sep
          a.user-sidebar__nav-sub-item(href="/stickers")
            i.fas.fa-splotch
            span Profile Stickers

    a.user-sidebar__nav-item(href="/leaderboards")
      i.fas.fa-trophy
      span Leaderboards

    //- Events group
    .user-sidebar__nav-group
      button.user-sidebar__nav-item.user-sidebar__nav-group-toggle(
        type="button"
        :aria-expanded="String(eventsOpen)"
        @click="eventsOpen = !eventsOpen"
      )
        i.fa.fa-star
        span Events
        i.user-sidebar__chevron.fas.fa-chevron-down(:class="{ 'user-sidebar__chevron--open': eventsOpen }")
      div.user-sidebar__nav-sub-transition
        .user-sidebar__nav-sub(v-if="eventsOpen")
          .user-sidebar__nav-sub-item--static
            .user-sidebar__nav-sub-label Ongoing
            p.user-sidebar__nav-sub-muted(v-if="!eventEnd") No events ongoing
          .user-sidebar__nav-sep
          a.user-sidebar__nav-sub-item(href="/events")
            i.fa.fa-calendar
            span See all events

    a.user-sidebar__nav-item(href="/fanart")
      i.fa.fa-paint-brush
      span Fanart

  hr.user-sidebar__divider

  //- FAQ link
  nav.user-sidebar__nav.user-sidebar__nav--secondary
    a.user-sidebar__nav-item(href="/faq")
      i.fa.fa-question
      span FAQ

  hr.user-sidebar__divider

  //- Theme selector
  Accordion.user-sidebar__themes(
    v-model="themeAccordion"
    :items="[{ key: 'themes', title: 'Site Theme:' }]"
    collapsible
  )
    p.user-sidebar__theme-hint Choose a flavor for the website based on one of our event mascots:
    .user-sidebar__theme-section
      small.user-sidebar__theme-label Dark themes
      .user-sidebar__theme-grid
        button.user-sidebar__theme-btn(
          v-for="t in darkThemes"
          :key="t.id"
          :class="`theme-${t.id}`"
          :title="t.id"
          @click="$emit('theme', t.id)"
        )
          img(:src="t.icon" :alt="t.id")
    .user-sidebar__theme-section
      small.user-sidebar__theme-label Light themes
      .user-sidebar__theme-grid
        button.user-sidebar__theme-btn(
          v-for="t in lightThemes"
          :key="t.id"
          :class="`theme-${t.id}`"
          :title="t.id"
          @click="$emit('theme', t.id)"
        )
          img(:src="t.icon" :alt="t.id")

  br

  //- Social links
  .user-sidebar__socials
    a.user-sidebar__social(href="/support" target="_blank" rel="noopener" aria-label="Discord")
      i.fab.fa-discord
    a.user-sidebar__social(href="https://steamcommunity.com/groups/PolluxMansion" target="_blank" rel="noopener" aria-label="Steam")
      i.fab.fa-steam
    a.user-sidebar__social(href="https://reddit.com/r/pollux" target="_blank" rel="noopener" aria-label="Reddit")
      i.fab.fa-reddit
    a.user-sidebar__social(href="https://twitter.com/maidpollux" target="_blank" rel="noopener" aria-label="Twitter")
      i.fab.fa-twitter
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Offcanvas from '@/ui/stardust-ui/Offcanvas/Offcanvas.vue';
import Avatar from '@/ui/stardust-ui/Avatar/Avatar.vue';
import Badge from '@/ui/stardust-ui/Badge/Badge.vue';
import Button from '@/ui/stardust-ui/Button/Button.vue';
import Accordion from '@/ui/stardust-ui/Accordion/Accordion.vue';
import Gem from '@/ui/components/Gem/Gem.vue';
import './UserSidebar.scss';

export interface SidebarUser {
  id: string;
  username: string;
  avatarUrl?: string | null;
}

export interface SidebarProfile {
  donator?: string | null;
  profile?: {
    bgID?: string | null;
    tagline?: string | null;
  };
  currency?: {
    RBN: number;
    JDE: number;
    SPH: number;
  };
}

const props = defineProps<{
  user?: SidebarUser | null;
  profile?: SidebarProfile | null;
  /** ISO date string for active event end, if any */
  eventEnd?: string | null;
}>();

defineEmits<{
  (e: 'logout'): void;
  (e: 'login'): void;
  (e: 'theme', id: string): void;
}>();

// ── Panel open/close state ───────────────────────────────────────
const open = ref(false);

// ── Expand/collapse state ────────────────────────────────────────
const marketOpen = ref(false);
const eventsOpen = ref(false);
const themeAccordion = ref<string | null>(null);

// ── Derived ──────────────────────────────────────────────────────
const backdropUrl = computed(() => {
  const bgID = props.profile?.profile?.bgID;
  return bgID ? `/backdrops/${bgID}.png` : '';
});

const sidebarLabel = computed(() => {
  if (props.user && props.user.username) {
    return `Open sidebar – ${props.user.username}`;
  }
  return 'Open sidebar';
});

// ── Helpers ──────────────────────────────────────────────────────
function abbreviate(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}Bi`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}Mi`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
}

// ── Theme data ───────────────────────────────────────────────────
const CDN = 'https://cdn.pollux.gg/images/themeicons';

const darkThemes = [
  { id: 'pollux', icon: `${CDN}/plx.png` },
  { id: 'noctix', icon: `${CDN}/nox.png` },
  { id: 'cecily', icon: `${CDN}/ccy.png` },
  { id: 'australis', icon: `${CDN}/aus.png` },
  { id: 'lunanuli', icon: `${CDN}/lun.png` },
  { id: 'arsenika', icon: `${CDN}/ank.png` },
];

const lightThemes = [
  { id: 'nikoliny', icon: `${CDN}/nik.png` },
  { id: 'borealis', icon: `${CDN}/bor.png` },
  { id: 'selenedi', icon: `${CDN}/sel.png` },
];
</script>
