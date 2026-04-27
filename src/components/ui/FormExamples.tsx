/**
 * Form Examples - Demonstra padrões de uso comum dos componentes Button e Input
 * Estes exemplos mostram como integrar os componentes com validação, estados e feedback
 */

import { useState, useRef } from 'react';
import { View, TextInput } from 'react-native';
import { Mail, Lock, Eye, EyeOff, Loader, Check } from 'lucide-react-native';
import { Button } from './Button';
import { Input } from './Input';
import { Text } from './Text';

/**
 * Exemplo 1: Form de Login
 * Demonstra: Input básico, validação, loading state, error handling
 */
export function LoginFormExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text && !emailRegex.test(text)) {
      setEmailError('Invalid email address');
    } else {
      setEmailError('');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setEmailError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Simula API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Login successful');
    } catch (error) {
      setEmailError('Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6 justify-center gap-4">
      <Text variant="heading" className="mb-4 text-center">
        Sign In
      </Text>

      <Input
        label="Email"
        placeholder="your@email.com"
        value={email}
        onChangeText={validateEmail}
        leftAdornment={<Mail size={18} strokeWidth={1.5} color="#A1A1AA" />}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
      />

      <Input
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        leftAdornment={<Lock size={18} strokeWidth={1.5} color="#A1A1AA" />}
        rightAdornment={
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={18} strokeWidth={1.5} color="#A1A1AA" />
            ) : (
              <Eye size={18} strokeWidth={1.5} color="#A1A1AA" />
            )}
          </Pressable>
        }
      />

      <Button
        label={loading ? 'Signing in...' : 'Sign In'}
        loading={loading}
        variant="primary"
        onPress={handleLogin}
      />

      <Button label="Forgot Password?" variant="ghost" />
    </View>
  );
}

/**
 * Exemplo 2: Form de Registro com Validação em Tempo Real
 * Demonstra: Múltiplos inputs, validação progressiva, clear button, feedback visual
 */
export function SignupFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);

  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value) error = 'Name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        break;

      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email';
        break;

      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        break;

      case 'confirmPassword':
        if (!value) error = 'Confirm password';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSignup = async () => {
    // Validate all fields
    Object.entries(formData).forEach(([key, value]) => {
      validateField(key, value);
    });

    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) return;

    setLoading(true);
    try {
      // Simula API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Signup successful', formData);
    } catch (error) {
      setErrors((prev) => ({ ...prev, email: 'This email is already registered' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6 justify-center gap-4">
      <Text variant="heading" className="mb-4 text-center">
        Create Account
      </Text>

      <Input
        label="Full Name"
        placeholder="John Doe"
        value={formData.name}
        onChangeText={(value) => handleFieldChange('name', value)}
        error={errors.name}
        showClearButton={!!formData.name}
        onClear={() => handleFieldChange('name', '')}
      />

      <Input
        label="Email"
        placeholder="john@example.com"
        value={formData.email}
        onChangeText={(value) => handleFieldChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        showClearButton={!!formData.email}
        onClear={() => handleFieldChange('email', '')}
      />

      <Input
        label="Password"
        placeholder="••••••••"
        value={formData.password}
        onChangeText={(value) => handleFieldChange('password', value)}
        secureTextEntry
        error={errors.password}
        hint="At least 8 characters"
      />

      <Input
        label="Confirm Password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChangeText={(value) => handleFieldChange('confirmPassword', value)}
        secureTextEntry
        error={errors.confirmPassword}
      />

      <Button
        label={loading ? 'Creating...' : 'Create Account'}
        loading={loading}
        variant="primary"
        onPress={handleSignup}
      />

      <Button label="Already have an account? Sign In" variant="ghost" />
    </View>
  );
}

/**
 * Exemplo 3: Search Form com Clear Button e Variantes de Botão
 * Demonstra: Clear button, botões com variantes diferentes, ícones
 */
export function SearchFormExample() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <View className="flex-1 p-6 gap-4">
      <Input
        label="Search Players"
        placeholder="Search by name, position..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        showClearButton={!!searchQuery}
        onClear={handleClear}
        hint="Enter at least 2 characters to search"
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            label="Search"
            variant="primary"
            onPress={handleSearch}
            disabled={searchQuery.length < 2}
          />
        </View>

        <View className="flex-1">
          <Button label="Filters" variant="secondary" />
        </View>

        <View className="flex-1">
          <Button label="Advanced" variant="ghost" />
        </View>
      </View>
    </View>
  );
}

/**
 * Exemplo 4: Form de Perfil com Edição
 * Demonstra: Input desabilitado, edição condicional, múltiplos botões
 */
export function ProfileFormExample() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Football enthusiast and player',
    position: 'Forward',
  });

  const handleSave = () => {
    console.log('Profile saved:', profileData);
    setIsEditing(false);
  };

  return (
    <View className="flex-1 p-6 gap-4">
      <Text variant="heading" className="mb-2">
        My Profile
      </Text>

      <Input
        label="Name"
        value={profileData.name}
        onChangeText={(value) => setProfileData((prev) => ({ ...prev, name: value }))}
        editable={isEditing}
        showClearButton={isEditing && !!profileData.name}
        onClear={() => setProfileData((prev) => ({ ...prev, name: '' }))}
      />

      <Input
        label="Email"
        value={profileData.email}
        editable={false}
        hint="Contact support to change email"
      />

      <Input
        label="Position"
        value={profileData.position}
        onChangeText={(value) => setProfileData((prev) => ({ ...prev, position: value }))}
        editable={isEditing}
      />

      <Input
        label="Bio"
        value={profileData.bio}
        onChangeText={(value) => setProfileData((prev) => ({ ...prev, bio: value }))}
        editable={isEditing}
        multiline
        numberOfLines={3}
      />

      {isEditing ? (
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button label="Save" variant="primary" onPress={handleSave} />
          </View>
          <View className="flex-1">
            <Button label="Cancel" variant="secondary" onPress={() => setIsEditing(false)} />
          </View>
        </View>
      ) : (
        <Button label="Edit Profile" variant="primary" onPress={() => setIsEditing(true)} />
      )}

      <Button label="Delete Account" variant="destructive" />
    </View>
  );
}

/**
 * Exemplo 5: Form de Pagamento
 * Demonstra: Input com máscara de números, validação de cartão, feedback visual
 */
export function PaymentFormExample() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setExpiryDate(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4));
    } else {
      setExpiryDate(cleaned);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Reset form
        setCardNumber('');
        setExpiryDate('');
        setCvv('');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6 gap-4">
      <Text variant="heading" className="mb-4">
        Payment Details
      </Text>

      <Input
        label="Card Number"
        placeholder="1234 5678 9012 3456"
        value={cardNumber}
        onChangeText={formatCardNumber}
        keyboardType="numeric"
        maxLength={19}
        hint="Visa, Mastercard, or Amex"
      />

      <View className="flex-row gap-4">
        <View className="flex-1">
          <Input
            label="Expiry Date"
            placeholder="MM/YY"
            value={expiryDate}
            onChangeText={formatExpiryDate}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>

        <View className="flex-1">
          <Input
            label="CVV"
            placeholder="123"
            value={cvv}
            onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 3))}
            keyboardType="numeric"
            maxLength={3}
            secureTextEntry
          />
        </View>
      </View>

      <Button
        label={
          success
            ? 'Payment Successful'
            : loading
              ? 'Processing...'
              : 'Complete Payment'
        }
        loading={loading}
        variant={success ? 'primary' : 'primary'}
        onPress={handlePayment}
        disabled={cardNumber.length < 19 || expiryDate.length < 5 || cvv.length < 3}
        rightAdornment={
          success ? (
            <Check size={18} color="white" />
          ) : loading ? (
            <Loader size={18} color="white" className="animate-spin" />
          ) : null
        }
      />
    </View>
  );
}
