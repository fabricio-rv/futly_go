// Componente para mudar idioma em tempo real
// Use em Settings ou no header para permitir mudança de idioma

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPPORTED_LANGUAGES, type Locale } from '@/src/i18n';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import { Card, Button } from '@/src/components/ui';
import { Check } from 'lucide-react-native';

interface LanguageSwitcherProps {
  /**
   * Callback quando o idioma muda
   * Você pode usar isso para recarregar dados ou notificar o app
   */
  onLanguageChange?: (language: Locale) => void;
  /**
   * Se true, abre como modal, senão como view simples
   */
  modal?: boolean;
  /**
   * Callback para fechar modal
   */
  onClose?: () => void;
  /**
   * Mostrar visualização simples (dropdown) ou expandida (lista completa)
   */
  compact?: boolean;
}

/**
 * Componente LanguageSwitcher com suporte a mudança de idioma em tempo real
 * Salva preferência em AsyncStorage
 * Integra com contexto de tema para notificar app sobre mudança
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  onLanguageChange,
  modal = false,
  onClose,
  compact = false,
}) => {
  const { currentLanguage, changeLanguage } = useTranslation('common');
  const [isChanging, setIsChanging] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Locale>(currentLanguage);

  const handleLanguageSelect = useCallback(
    async (language: Locale) => {
      try {
        setIsChanging(true);
        setSelectedLanguage(language);

        // Salvar preferência no AsyncStorage
        await AsyncStorage.setItem('futly_go_language', language);

        // Chamar callback
        await changeLanguage(language);
        onLanguageChange?.(language);

        // Mostrar feedback ao usuário
        Alert.alert('Sucesso', `Idioma alterado para ${getLanguageName(language)}`);

        // Fechar modal se aplicável
        if (modal && onClose) {
          setTimeout(onClose, 500);
        }
      } catch (error) {
        console.error('Erro ao mudar idioma:', error);
        Alert.alert('Erro', 'Não foi possível mudar o idioma. Tente novamente.');
        setSelectedLanguage(currentLanguage); // Reverter seleção
      } finally {
        setIsChanging(false);
      }
    },
    [currentLanguage, changeLanguage, onLanguageChange, modal, onClose]
  );

  const getLanguageName = (code: Locale): string => {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    return lang?.name || code;
  };

  // Visualização compacta (dropdown)
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.label}>
          {currentLanguage === 'pt-BR'
            ? 'Idioma'
            : currentLanguage === 'en-US'
              ? 'Language'
              : 'Idioma'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => handleLanguageSelect(lang.code)}
              style={[
                styles.compactButton,
                selectedLanguage === lang.code && styles.compactButtonActive,
              ]}
              disabled={isChanging}
            >
              <Text
                style={[
                  styles.compactButtonText,
                  selectedLanguage === lang.code && styles.compactButtonTextActive,
                ]}
              >
                {lang.flag} {lang.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Conteúdo expandido
  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {currentLanguage === 'pt-BR'
            ? 'Selecionar Idioma'
            : currentLanguage === 'en-US'
              ? 'Select Language'
              : 'Seleccionar Idioma'}
        </Text>
        <Text style={styles.subtitle}>
          {currentLanguage === 'pt-BR'
            ? 'Escolha seu idioma preferido'
            : currentLanguage === 'en-US'
              ? 'Choose your preferred language'
              : 'Elige tu idioma preferido'}
        </Text>
      </View>

      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              onPress={() => handleLanguageSelect(lang.code)}
              disabled={isChanging}
            >
              <Card style={[styles.languageCard, isSelected && styles.languageCardActive]}>
                <View style={styles.languageCardContent}>
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>{lang.name}</Text>
                    <Text style={styles.languageCode}>{lang.code}</Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Check size={24} color="#10B981" />
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {currentLanguage === 'pt-BR'
            ? '🌍 Seu idioma foi salvo e será usado em futuras visitas'
            : currentLanguage === 'en-US'
              ? '🌍 Your language has been saved and will be used on future visits'
              : '🌍 Tu idioma ha sido guardado y se usará en futuras visitas'}
        </Text>
      </View>
    </View>
  );

  if (modal) {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={true}
        onRequestClose={onClose}
      >
        {content}
        {onClose && (
          <Button
            style={styles.closeButton}
            onPress={onClose}
            label={
              currentLanguage === 'pt-BR'
                ? 'Fechar'
                : currentLanguage === 'en-US'
                  ? 'Close'
                  : 'Cerrar'
            }
          />
        )}
      </Modal>
    );
  }

  return content;
};

// Exemplo de uso em uma tela de Settings
export const LanguageSwitcherExample: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { currentLanguage, t } = useTranslation('common');

  return (
    <View style={styles.exampleContainer}>
      <Card>
        <View style={styles.exampleHeader}>
          <Text style={styles.exampleTitle}>
            {t('languages', 'Idiomas')}
          </Text>
          <Text style={styles.exampleCurrentLanguage}>
            {SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.flag}
            {' '}
            {currentLanguage}
          </Text>
        </View>

        <Button
          label={t('changeLanguage', 'Mudar Idioma')}
          onPress={() => setShowModal(true)}
        />
      </Card>

      {showModal && (
        <LanguageSwitcher
          modal
          onClose={() => setShowModal(false)}
          onLanguageChange={(lang) => {
            console.log('Idioma alterado para:', lang);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Container geral
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // List
  listContainer: {
    flex: 1,
    marginBottom: 16,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  languageCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  languageCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  languageCode: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  checkmark: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },

  // Compact mode
  compactContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  compactButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  compactButtonActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  compactButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  compactButtonTextActive: {
    color: '#10B981',
  },

  // Close button
  closeButton: {
    margin: 16,
    marginTop: 0,
  },

  // Example
  exampleContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  exampleCurrentLanguage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
  },
});
