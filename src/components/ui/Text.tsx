import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

type Variant =
  | 'hero'
  | 'display'
  | 'heading'
  | 'title'
  | 'bodyLg'
  | 'body'
  | 'label'
  | 'caption'
  | 'micro'
  | 'eyebrow'
  | 'number';
type Tone =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'neon'
  | 'danger'
  | 'inverse'
  | 'gold'
  | 'success'
  | 'info';

const variantClass: Record<Variant, string> = {
  hero: 'font-display text-5xl',
  display: 'font-display text-[32px]',
  heading: 'font-display text-2xl',
  title: 'font-display text-xl',
  bodyLg: 'font-sans text-[17px]',
  body: 'font-sans text-[15px]',
  label: 'font-sans text-[13px]',
  caption: 'font-sans text-xs',
  micro: 'font-sans text-[10px]',
  eyebrow: 'font-sans text-[11px] uppercase tracking-[2px] font-semibold',
  number: 'font-number text-[32px] leading-none',
};

const toneClass: Record<Tone, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  muted: 'text-text-muted',
  neon: 'text-emerald-300',
  danger: 'text-danger',
  inverse: 'text-text-inverse',
  gold: 'text-gold-500',
  success: 'text-emerald-400',
  info: 'text-info',
};

type TextProps = RNTextProps & {
  variant?: Variant;
  tone?: Tone;
  className?: string;
};

export function Text({
  variant = 'body',
  tone = 'primary',
  className,
  ...rest
}: TextProps) {
  return (
    <RNText
      className={`${variantClass[variant]} ${toneClass[tone]} ${className ?? ''}`.trim()}
      {...rest}
    />
  );
}
