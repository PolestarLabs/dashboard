<template lang="pug">
DropdownSelect(
  v-model="modelValue"
  :options="dropdownOptions"
  :placeholder="placeholder || 'Choose language...'"
  :label="label"
  :size="size"
  :light-background="lightBackground"
  :disabled="disabled"
  :list-max-height="listMaxHeight"
  trigger-aria-label="Select language"
)
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DropdownSelect from '../../Select/DropdownSelect.vue';
import type { DropdownSelectOption } from '../../Select/DropdownSelect.vue';

defineOptions({ inheritAttrs: false });

export interface LanguageOption {
  /** ISO code (e.g. "en", "pt-br") */
  value: string;
  /** Display name (e.g. "English", "Português") */
  label: string;
  /** Optional description (e.g. "ENGLISH") */
  description?: string;
  /** Full URL for flag image. Or use flag + flagBaseUrl to build it. */
  flagImageUrl?: string;
  /** Filename for flag in CDN (e.g. "united-states"), or full URL if value starts with http(s) – used with flagBaseUrl when flagImageUrl not set */
  flag?: string;
}

/** Built-in whitelist: CDN flags at build/guessing/guessflags/{flag}.png */
const DEFAULT_LANGUAGES: LanguageOption[] = [
  { value: 'en', label: 'English', description: 'ENGLISH', flag: 'united-states' },
  { value: 'de', label: 'Deutsch', description: 'GERMAN', flag: 'germany' },
  { value: 'fr', label: 'Français', description: 'FRENCH', flag: 'france' },
  { value: 'es', label: 'Español', description: 'SPANISH', flag: 'spain' },
  { value: 'pt-br', label: 'Português (BR)', description: 'PORTUGUESE', flag: 'brazil' },
  { value: 'ja', label: '日本語', description: 'JAPANESE', flag: 'japan' },
  { value: 'ko', label: '한국어', description: 'KOREAN', flag: 'south-korea' },
  { value: 'zh', label: '中文', description: 'CHINESE', flag: 'china' },
  { value: 'it', label: 'Italiano', description: 'ITALIAN', flag: 'italy' },
  { value: 'ru', label: 'Русский', description: 'RUSSIAN', flag: 'russia' },
  { value: 'nl', label: 'Nederlands', description: 'DUTCH', flag: 'netherlands' },
  { value: 'pl', label: 'Polski', description: 'POLISH', flag: 'poland' },
  { value: 'tr', label: 'Türkçe', description: 'TURKISH', flag: 'turkey' },
  { value: 'id', label: 'Bahasa Indonesia', description: 'INDONESIAN', flag: 'indonesia' },
  { value: 'th', label: 'ไทย', description: 'THAI', flag: 'thailand' },
  { value: 'vi', label: 'Tiếng Việt', description: 'VIETNAMESE', flag: 'vietnam' },
  { value: 'cs', label: 'Čeština', description: 'CZECH', flag: 'czech-republic' },
  { value: 'hu', label: 'Magyar', description: 'HUNGARIAN', flag: 'hungary' },
  { value: 'ro', label: 'Română', description: 'ROMANIAN', flag: 'romania' },
  { value: 'uk', label: 'Українська', description: 'UKRAINIAN', flag: 'ukraine' },
  { value: 'el', label: 'Ελληνικά', description: 'GREEK', flag: 'greece' },
  { value: 'sv', label: 'Svenska', description: 'SWEDISH', flag: 'sweden' },
  { value: 'da', label: 'Dansk', description: 'DANISH', flag: 'denmark' },
  { value: 'no', label: 'Norsk', description: 'NORWEGIAN', flag: 'norway' },
  { value: 'fi', label: 'Suomi', description: 'FINNISH', flag: 'finland' },
];

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    /** Optional override: full list of languages. When not provided, built-in whitelist is used. */
    languages?: LanguageOption[];
    placeholder?: string;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    lightBackground?: boolean;
    /** Base URL for flag images when using flag (e.g. "/build/guessing/guessflags/") */
    flagBaseUrl?: string;
    disabled?: boolean;
    listMaxHeight?: string;
  }>(),
  { size: 'md', flagBaseUrl: 'https://cdn.pollux.gg/build/guessing/guessflags/', listMaxHeight: '40vh' }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const modelValue = computed({
  get: () => props.modelValue ?? '',
  set: (v: string | number) => emit('update:modelValue', String(v)),
});

/** Use prop as override when provided and non-empty; otherwise built-in whitelist */
const effectiveLanguages = computed<LanguageOption[]>(() =>
  props.languages && props.languages.length > 0 ? props.languages : DEFAULT_LANGUAGES
);

/** Resolve image URL: flagImageUrl, or flag if it starts with http(s), else flagBaseUrl + flag + .png */
const normalizedLanguages = computed<LanguageOption[]>(() =>
  effectiveLanguages.value.map((opt) => {
    let url: string | undefined;
    if (opt.flagImageUrl) {
      url = opt.flagImageUrl;
    } else if (opt.flag) {
      const f = opt.flag;
      url = f.startsWith('http') ? f : `${props.flagBaseUrl}${f}.png`;
    }
    return { ...opt, flagImageUrl: url };
  })
);

/** Options in the format expected by DropdownSelect */
const dropdownOptions = computed<DropdownSelectOption[]>(() =>
  normalizedLanguages.value.map((opt) => ({
    value: opt.value,
    label: opt.label,
    description: opt.description,
    imageUrl: opt.flagImageUrl,
  }))
);
</script>
