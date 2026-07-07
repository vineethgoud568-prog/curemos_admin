# Theme Setup Guide

This document provides a comprehensive guide to theme management in the Super Admin Dashboard.

## Table of Contents

- [Theme Configuration](#theme-configuration)
- [Theme Provider](#theme-provider)
- [Color Schemes](#color-schemes)
- [Customizing Components](#customizing-components)
- [Adding New Themes](#adding-new-themes)
- [Theme Variables](#theme-variables)
- [Dark Mode](#dark-mode)

## Theme Configuration

### Base Configuration

The theme configuration is primarily managed through the following files:

1. `src/components/theme-provider.tsx` - Main theme provider component
2. `src/app/globals.css` - Global styles and theme variables
3. `components.json` - Shadcn UI configuration

### Theme Provider Setup

```typescript
// src/components/theme-provider.tsx
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

## Color Schemes

### Color System

The project uses OKLCH color format for better color perception and consistency. Colors are defined
in `src/app/globals.css`:

```css
:root {
  /* Base Colors */
  --background: oklch(0.99 0 0);
  --foreground: oklch(0.2 0 0);

  /* Surfaces */
  --card: oklch(0.99 0 0);
  --card-foreground: oklch(0.2 0 0);
  --popover: oklch(0.99 0 0);
  --popover-foreground: oklch(0.44 0 0);

  /* Primary & Secondary Colors */
  --primary: oklch(0.83 0.13 160.91);
  --primary-foreground: oklch(0.26 0.01 166.46);

  --secondary: oklch(0.99 0 0);
  --secondary-foreground: oklch(0.2 0 0);

  /* Muted & Accent */
  --muted: oklch(0.95 0 0);
  --muted-foreground: oklch(0.24 0 0);

  --accent: oklch(0.95 0 0);
  --accent-foreground: oklch(0.24 0 0);

  /* Destructive */
  --destructive: oklch(0.55 0.19 32.73);
  --destructive-foreground: oklch(0.99 0 17.21);

  /* Border & Input */
  --border: oklch(0.9 0 0);
  --input: oklch(0.97 0 0);
  --ring: oklch(0.83 0.13 160.91);

  /* Chart Colors */
  --chart-1: oklch(0.83 0.13 160.91);
  --chart-2: oklch(0.62 0.19 259.81);
  --chart-3: oklch(0.61 0.22 292.72);
  --chart-4: oklch(0.77 0.16 70.08);
  --chart-5: oklch(0.7 0.15 162.48);

  /* Sidebar */
  --sidebar: oklch(0.99 0 0);
  --sidebar-foreground: oklch(0.55 0 0);
  --sidebar-primary: oklch(0.83 0.13 160.91);
  --sidebar-primary-foreground: oklch(0.26 0.01 166.46);
  --sidebar-accent: oklch(0.95 0 0);
  --sidebar-accent-foreground: oklch(0.24 0 0);
  --sidebar-border: oklch(0.9 0 0);
  --sidebar-ring: oklch(0.83 0.13 160.91);
}
```

### Dark Mode Colors

```css
.dark {
  --background: oklch(0.18 0 0);
  --foreground: oklch(0.93 0.01 255.51);
  --card: oklch(0.2 0 0);
  --card-foreground: oklch(0.93 0.01 255.51);
  /* ... other dark mode colors ... */
}
```

## Customizing Components

### Component Theme Customization

Each Shadcn UI component can be customized through its respective configuration file in
`src/components/ui/`. For example:

````typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

## Adding New Themes

### 1. Define Theme Variables

Add new theme variables in `src/app/globals.css`:

```css
/* src/app/globals.css */
@layer base {
  :root {
    /* Add your custom theme variables here using OKLCH format */
    --custom-color: oklch(0.83 0.13 160.91);
  }

  .dark {
    /* Add your dark theme variables here */
    --custom-color: oklch(0.44 0.1 156.76);
  }
}
````

### 2. Update Component Styles

Update component styles to use the new theme variables:

```typescript
// src/components/ui/your-component.tsx
const componentVariants = cva('base-styles', {
  variants: {
    variant: {
      custom: 'bg-custom-color text-custom-foreground',
    },
  },
});
```

## Theme Variables

### CSS Variables

The following CSS variables control the theme:

```css
/* Base Theme Variables */
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--destructive-foreground
--border
--input
--ring

/* Chart Colors */
--chart-1
--chart-2
--chart-3
--chart-4
--chart-5

/* Sidebar Colors */
--sidebar
--sidebar-foreground
--sidebar-primary
--sidebar-primary-foreground
--sidebar-accent
--sidebar-accent-foreground
--sidebar-border
--sidebar-ring
```

## Dark Mode

### Implementation

Dark mode is implemented using `next-themes` and can be toggled using the theme switcher component:

```typescript
// src/components/theme-switcher.tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-md p-2 hover:bg-accent"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
```

### Dark Mode Classes

Dark mode styles are applied using the `dark:` prefix in Tailwind classes:

```jsx
<div className="bg-background text-foreground dark:bg-background dark:text-foreground">
  {/* Content */}
</div>
```

## Best Practices

1. **Color Usage**
   - Use OKLCH color format for better color perception
   - Maintain consistent color hierarchy
   - Consider contrast ratios for accessibility
   - Use semantic color names

2. **Component Theming**
   - Use the `cva` utility for component variants
   - Keep component styles modular and reusable
   - Use CSS variables for dynamic theming

3. **Dark Mode**
   - Test all components in both light and dark modes
   - Use semantic color names
   - Consider reduced motion preferences

4. **Performance**
   - Minimize CSS variable usage
   - Use Tailwind's JIT compiler
   - Optimize theme switching performance

## Troubleshooting

### Common Issues

1. **Theme Not Applying**
   - Check if ThemeProvider is properly wrapped
   - Verify CSS variable definitions
   - Check for conflicting styles

2. **Dark Mode Not Working**
   - Verify next-themes configuration
   - Check for proper class application
   - Ensure proper color contrast

3. **Component Styling Issues**
   - Check component variant definitions
   - Verify Tailwind configuration
   - Check for style conflicts

## Additional Resources

- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [OKLCH Color Format](https://oklch.com)

## 🎨 Icon Setup Guide

### Icon Libraries

The project uses multiple icon libraries for different purposes:

1. **Lucide Icons** (Primary)
   - Default icon library configured in `components.json`
   - Used for most UI elements and navigation
   - Import directly from `lucide-react`

2. **Tabler Icons**
   - Used for additional icon variations
   - Import from `@tabler/icons-react`

3. **Iconify**
   - Used for dynamic icon loading
   - Import from `@iconify/react`

### Using Icons

#### Lucide Icons

```typescript
import { Home, Settings, User } from 'lucide-react'

// Basic usage
<Home className="h-4 w-4" />

// With variants
<Settings className="h-4 w-4 text-muted-foreground" />

// With animation
<User className="h-4 w-4 transition-transform hover:scale-110" />
```

#### Tabler Icons

```typescript
import { IconHome, IconSettings, IconUser } from '@tabler/icons-react'

// Basic usage
<IconHome size={16} />

// With variants
<IconSettings size={16} className="text-muted-foreground" />

// With animation
<IconUser size={16} className="transition-transform hover:scale-110" />
```

#### Iconify Icons

```typescript
import { Icon } from '@iconify/react'

// Basic usage
<Icon icon="mdi:home" width={16} height={16} />

// With variants
<Icon
  icon="mdi:settings"
  width={16}
  height={16}
  className="text-muted-foreground"
/>

// With animation
<Icon
  icon="mdi:user"
  width={16}
  height={16}
  className="transition-transform hover:scale-110"
/>
```

### Icon Sizes

The project follows a consistent icon sizing system:

```typescript
// Small icons (16px)
className = 'h-4 w-4'; // or size={16}

// Medium icons (20px)
className = 'h-5 w-5'; // or size={20}

// Large icons (24px)
className = 'h-6 w-6'; // or size={24}

// Extra large icons (32px)
className = 'h-8 w-8'; // or size={32}
```

### Icon Colors

Icons use the theme's color system:

```typescript
// Primary color
className = 'text-primary';

// Secondary color
className = 'text-secondary';

// Muted color
className = 'text-muted-foreground';

// Accent color
className = 'text-accent';

// Destructive color
className = 'text-destructive';
```

### Icon Animations

Common icon animations:

```typescript
// Hover scale
className = 'transition-transform hover:scale-110';

// Hover rotate
className = 'transition-transform hover:rotate-90';

// Spin animation
className = 'animate-spin';

// Pulse animation
className = 'animate-pulse';
```

### Custom Icon Components

For frequently used icon combinations, create custom components:

```typescript
// src/components/icons/icon-button.tsx
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IconButtonProps {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'muted' | 'primary'
  className?: string
  onClick?: () => void
}

export function IconButton({
  icon: Icon,
  size = 'md',
  variant = 'default',
  className,
  onClick,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-md p-2 transition-colors',
        {
          'h-8 w-8': size === 'sm',
          'h-10 w-10': size === 'md',
          'h-12 w-12': size === 'lg',
          'text-foreground hover:bg-accent': variant === 'default',
          'text-muted-foreground hover:bg-accent': variant === 'muted',
          'text-primary hover:bg-primary/10': variant === 'primary',
        },
        className
      )}
    >
      <Icon className={cn(
        'h-4 w-4',
        {
          'h-3 w-3': size === 'sm',
          'h-5 w-5': size === 'lg',
        }
      )} />
    </button>
  )
}
```

### Best Practices

1. **Consistency**
   - Use consistent icon sizes across similar UI elements
   - Maintain consistent spacing around icons
   - Use the same icon library for related elements

2. **Accessibility**
   - Always provide aria-labels for icon-only buttons
   - Use semantic icons that match their function
   - Ensure sufficient color contrast

3. **Performance**
   - Import icons directly rather than using dynamic imports
   - Use appropriate icon sizes to avoid scaling
   - Consider using sprite sheets for many icons

4. **Maintenance**
   - Keep icon imports organized
   - Document custom icon components
   - Use TypeScript for icon props

### Troubleshooting

1. **Icon Not Showing**
   - Check if the icon is properly imported
   - Verify the icon name is correct
   - Check for CSS conflicts

2. **Icon Size Issues**
   - Ensure proper className or size prop
   - Check for conflicting styles
   - Verify parent container constraints

3. **Icon Color Issues**
   - Check theme variable definitions
   - Verify className application
   - Check for CSS specificity conflicts

### Additional Resources

- [Lucide Icons Documentation](https://lucide.dev)
- [Tabler Icons Documentation](https://tabler-icons.io)
- [Iconify Documentation](https://iconify.design)
- [Icon Accessibility Guide](https://www.w3.org/WAI/tips/developing/#use-icon-fonts-with-care)
