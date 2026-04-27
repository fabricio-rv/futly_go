import { useEffect, useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthFeedbackModal } from '@/src/components/features/auth';
import { MatchBottomNav } from '@/src/components/features/matches';
import { HubTopNav } from '@/src/components/features/store';
import { Button, Input, SelectField, Text } from '@/src/components/ui';
import { sendSupportMessage, fetchMySupportMessages } from '@/src/features/support/services/supportService';
import type { SupportMessage } from '@/src/features/support/services/supportService';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

type Status = 'pending' | 'in_progress' | 'resolved';

const statusColors: Record<Status, string> = {
  pending: '#F5A524',
  in_progress: '#5AB1FF',
  resolved: '#22B76C',
};

export default function SupportChatScreen() {
  const { t } = useTranslation('support');

  const subjectOptions = [
    { value: 'bug', label: t('categories.problem', 'Relatar um problema') },
    { value: 'feature', label: t('categories.feature', 'Sugerir uma funcionalidade') },
    { value: 'payment', label: t('categories.payment', 'Duvida sobre pagamento') },
    { value: 'account', label: t('categories.account', 'Problema com conta') },
    { value: 'other', label: t('categories.other', 'Outro') },
  ];

  const statusLabels: Record<Status, string> = {
    pending: t('status.pending', 'Pendente'),
    in_progress: t('status.inProgress', 'Em andamento'),
    resolved: t('status.resolved', 'Resolvido'),
  };
  const theme = useAppColorScheme();
  const bgColor = theme === 'light' ? '#FFFFFF' : '#05070B';
  const [subject, setSubject] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    void loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await fetchMySupportMessages();
      setMessages(data);
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleSendMessage() {
    if (!subject || !message.trim()) {
      Alert.alert(t('validation.requiredTitle', 'Campo obrigatório'), t('validation.requiredMessage', 'Preencha o assunto e a mensagem'));
      return;
    }

    setLoading(true);
    try {
      const newMessage = await sendSupportMessage(subject, message);
      setSubject(null);
      setMessage('');
      setMessages([newMessage, ...messages]);
      setModalData({
        title: t('send.successTitle', 'Mensagem enviada'),
        message: t('send.successMessage', 'Obrigado por entrar em contato! Responderemos em breve.'),
      });
      setModalVisible(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('send.errorMessage', 'Erro ao enviar mensagem');
      Alert.alert(t('common.error', 'Erro'), errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <HubTopNav title={t('title', 'Falar com Suporte')} subtitle={t('subtitle', 'CENTRAL DE SUPORTE')} />

        <View className="mx-[18px] mt-6 rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[18px] mb-6">
          <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-4">
            {t('send.title', 'Enviar mensagem')}
          </Text>

          <View className="mb-4">
            <SelectField
              label={t('send.subject', 'Assunto')}
              value={subject}
              options={subjectOptions}
              placeholder={t('send.subjectPlaceholder', 'Selecione um assunto')}
              onChange={setSubject}
            />
          </View>

          <View className="mb-4">
            <Input
              label={t('send.messageLabel', 'Sua mensagem')}
              value={message}
              onChangeText={setMessage}
              placeholder={t('send.messagePlaceholder', 'Descreva seu problema ou sugestão...')}
              multiline
              numberOfLines={6}
            />
          </View>

          <Text variant="caption" className="text-[#4B5563] dark:text-fg3 mb-4">
            {t('send.replyHint', 'Responderemos o mais breve possível. Você recebera a resposta por e-mail.')}
          </Text>

          <Button
            label={t('actions.send', 'Enviar mensagem')}
            loading={loading}
            disabled={loading || !subject || !message.trim()}
            onPress={() => void handleSendMessage()}
          />
        </View>

        {!loadingHistory && messages.length > 0 && (
          <View className="mx-[18px] mb-4">
            <Text variant="label" className="font-bold text-[#111827] dark:text-white mb-3">
              {t('history.title', 'Histórico de mensagens')}
            </Text>

            <View className="rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] overflow-hidden">
              {messages.map((msg, index) => (
                <View
                  key={msg.id}
                  className={`px-[14px] py-[14px] ${index < messages.length - 1 ? 'border-b border-gray-100 dark:border-line' : ''}`}
                >
                  <View className="flex-row items-start justify-between gap-3 mb-2">
                    <View className="flex-1">
                      <Text variant="label" className="font-semibold text-[#111827] dark:text-white">
                        {msg.subject}
                      </Text>
                      <Text variant="caption" className="text-[#4B5563] dark:text-fg3 mt-0.5">
                        {new Date(msg.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: statusColors[msg.status as Status] + '24' }}
                    >
                      <Text
                        variant="caption"
                        className="font-semibold"
                        style={{ color: statusColors[msg.status as Status] }}
                      >
                        {statusLabels[msg.status as Status]}
                      </Text>
                    </View>
                  </View>

                  <Text variant="body" className="text-[#1F2937] dark:text-text-primary">
                    {msg.message}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {!loadingHistory && messages.length === 0 && (
          <View className="mx-[18px] rounded-[18px] border border-[rgba(0,0,0,0.08)] dark:border-line2 bg-[#FAFBFC] dark:bg-[#0C111E] p-[18px]">
            <Text variant="body" className="text-center text-[#4B5563] dark:text-fg3">
              {t('history.empty', 'Você ainda não enviou nenhuma mensagem de suporte.')}
            </Text>
          </View>
        )}
      </ScrollView>

      <MatchBottomNav active="none" />

      <AuthFeedbackModal
        visible={modalVisible}
        tone="success"
        title={modalData?.title ?? ''}
        message={modalData?.message ?? ''}
        primaryLabel={t('common.close', 'Fechar')}
        onPrimaryPress={() => setModalVisible(false)}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
