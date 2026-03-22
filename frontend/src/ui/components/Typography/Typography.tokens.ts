export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'subtitle' | 'body' | 'small' | 'caption';

export const typographyTokenMap = {
  h1: '--type-scale-h1',
  h2: '--type-scale-h2',
  h3: '--type-scale-h3',
  h4: '--type-scale-h4',
  subtitle: '--type-scale-subtitle',
  body: '--type-scale-body',
  small: '--type-scale-caption',
  caption: '--type-scale-caption',
} as const;

export const textColorTokenMap = {
  main: '--text-main',
  bold: '--text-bold',
  dim: '--text-dim',
  faint: '--text-faint',
  primary: '--color-primary',
  secondary: '--color-secondary',
} as const;

export const fontTokenMap = {
  display: '--display-font',
  strong: '--strong-font',
  main: '--main-font',
  second: '--second-font',
  mono: '--mono-font',
} as const;
