# iOS Pro UI Components Guide

## Button Component

Componente Button refatorado seguindo os padrões visuais do iOS Pro com animações suaves, haptic feedback e acessibilidade integrada.

### Variantes

#### Primary (Padrão)
Botão de ação principal com cor de destaque (emerald-500) e sombra sutil.

```tsx
<Button 
  label="Continue" 
  variant="primary"
  onPress={() => console.log('pressed')}
/>
```

#### Secondary
Botão com borda fina (outline) para ações secundárias.

```tsx
<Button 
  label="Cancel" 
  variant="secondary"
  onPress={() => console.log('pressed')}
/>
```

#### Ghost
Botão com fundo translúcido para ações menos importantes.

```tsx
<Button 
  label="Learn More" 
  variant="ghost"
  onPress={() => console.log('pressed')}
/>
```

#### Destructive
Botão de ação destrutiva com cor vermelha.

```tsx
<Button 
  label="Delete" 
  variant="destructive"
  onPress={() => console.log('pressed')}
/>
```

### Tamanhos

- `sm`: h-10, px-4 (altura compacta)
- `md`: h-12, px-6 (tamanho padrão)
- `lg`: h-[52px], px-7 (grande)
- `xl`: h-14, px-8 (extra grande)

```tsx
<Button label="Small" size="sm" />
<Button label="Medium" size="md" />
<Button label="Large" size="lg" />
<Button label="Extra Large" size="xl" />
```

### Com Adornments

```tsx
import { Heart } from 'lucide-react-native';

<Button 
  label="Like"
  leftAdornment={<Heart size={18} color="white" />}
  variant="primary"
/>

<Button 
  label="Send"
  rightAdornment={<ArrowRight size={18} color="white" />}
  variant="primary"
/>
```

### Loading State

```tsx
<Button 
  label="Loading..." 
  loading={true}
  variant="primary"
/>
```

### Disabled State

```tsx
<Button 
  label="Disabled" 
  disabled={true}
  variant="primary"
/>
```

### Full Width / Not Full Width

```tsx
<Button label="Full Width (default)" />

<Button label="Not Full Width" fullWidth={false} />
```

### Acessibilidade

- Labels automáticos baseados no prop `label`
- Custom labels com `accessibilityLabel`
- Estados de desabilidade reportados
- Haptic feedback integrado

```tsx
<Button 
  label="Delete Account"
  variant="destructive"
  accessibilityLabel="Delete your account permanently"
  accessibilityHint="This action cannot be undone"
/>
```

---

## Input Component

Componente Input refatorado com foco dinâmico, ícones alinhados e design limpo estilo iOS.

### Uso Básico

```tsx
<Input 
  label="Email"
  placeholder="Enter your email"
  keyboardType="email-address"
/>
```

### Com Ícones (Left Adornment)

```tsx
import { Mail } from 'lucide-react-native';

<Input 
  label="Email"
  placeholder="Enter your email"
  leftAdornment={<Mail size={18} color="#A1A1AA" />}
/>
```

### Com Ícone Direito (Right Adornment)

```tsx
import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';

export function PasswordInput() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input 
      label="Password"
      placeholder="Enter your password"
      secureTextEntry={!showPassword}
      rightAdornment={
        <Pressable onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <EyeOff size={18} color="#A1A1AA" />
          ) : (
            <Eye size={18} color="#A1A1AA" />
          )}
        </Pressable>
      }
    />
  );
}
```

### Com Botão Clear

```tsx
const [text, setText] = useState('');

<Input 
  label="Search"
  placeholder="Search..."
  value={text}
  onChangeText={setText}
  showClearButton={!!text}
  onClear={() => setText('')}
/>
```

### Com Label e Hint

```tsx
<Input 
  label="Phone Number"
  placeholder="(11) 99999-9999"
  hint="We'll use this to send you updates"
  keyboardType="phone-pad"
/>
```

### Com Erro

```tsx
<Input 
  label="Email"
  placeholder="Enter your email"
  error="Invalid email address"
  value="invalid@"
/>
```

### Multiline (Textarea)

```tsx
<Input 
  label="Message"
  placeholder="Type your message here..."
  multiline={true}
  numberOfLines={4}
/>
```

### Disabled State

```tsx
<Input 
  label="Disabled Field"
  placeholder="Cannot edit this"
  editable={false}
/>
```

### Custom Styling

```tsx
<Input 
  label="Custom"
  containerClassName="bg-emerald-50 dark:bg-emerald-950"
  inputClassName="text-emerald-900"
/>
```

### Acessibilidade

```tsx
<Input 
  label="Credit Card"
  placeholder="1234 5678 9012 3456"
  accessibilityLabel="Credit card number input"
  accessibilityHint="Enter your 16-digit credit card number"
/>
```

---

## Design System Tokens

### Cores
- **Primary**: emerald-500 (#10B981) / emerald-400 (#34D399)
- **Secondary**: zinc-400 (#A1A1AA)
- **Background Light**: zinc-100 (#F4F4F5)
- **Background Dark**: zinc-900 (#18181B)
- **Error**: red-500 (#EF4444)

### Tipografia
- **Body Large**: font-semibold, tracking-wide (0.3px)
- **System Font**: font-system, text-base (16px)

### Border Radius
- **Squircle iOS**: 12px (rounded-[12px])

### Sombras
- **Subtle**: shadow-sm (Light: 0 1px 2px rgba(0,0,0,0.05), Dark: adjusted)
- **Medium**: shadow-md (Light: 0 4px 6px rgba(0,0,0,0.1), Dark: adjusted)

### Animações
- **Press Animation**: 100ms scale-down to 0.96, 150ms scale-back
- **Focus Animation**: 200ms border-color/shadow transition
- **Opacity Change**: Press feedback with opacity adjustment

---

## Temas Claro e Escuro

Ambos os componentes suportam automaticamente light/dark mode através do `useAppColorScheme()`.

### Light Mode
- Backgrounds: white/zinc-100
- Text: zinc-900
- Borders: zinc-200
- Focus color: emerald-500

### Dark Mode
- Backgrounds: zinc-800/zinc-900
- Text: zinc-50
- Borders: zinc-700
- Focus color: emerald-400

---

## Performance Notes

- ✅ React Native Reanimated para animações otimizadas
- ✅ Haptic feedback integrado (expo-haptics)
- ✅ Pressable para melhor controle de estado
- ✅ Animated views apenas para transformações necessárias
- ✅ Acessibilidade nativa do React Native

---

## Próximos Passos

Para usar estes componentes em suas telas:

1. Importe do índice de componentes:
```tsx
import { Button, Input } from '@/src/components/ui';
```

2. Use em seu formulário ou tela:
```tsx
import { Button, Input } from '@/src/components/ui';
import { useState, useRef } from 'react';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const inputRef = useRef(null);

  return (
    <View className="flex-1 p-6 justify-center">
      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        label="Sign In"
        variant="primary"
        onPress={() => console.log('signing in')}
      />
    </View>
  );
}
```
