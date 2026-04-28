import { router } from 'expo-router';
import { Search, UserPlus, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HubTopNav } from '@/src/components/features/store';
import { Button, Input, Pill, Text } from '@/src/components/ui';
import {
  createCustomGroupConversation,
  createPrivateConversation,
  searchChatProfiles,
  type ChatProfileSearchResult,
} from '@/src/features/chat/services/chatService';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';

type Mode = 'private' | 'group';

export default function NewConversationScreen() {
  const theme = useAppColorScheme();
  const isLight = theme === 'light';
  const [mode, setMode] = useState<Mode>('private');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChatProfileSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [autoArchive, setAutoArchive] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<ChatProfileSearchResult[]>([]);

  const selectedIds = useMemo(() => new Set(selectedMembers.map((m) => m.id)), [selectedMembers]);

  const handleSearch = async (value: string) => {
    setQuery(value);
    const q = value.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const rows = await searchChatProfiles(q);
      setResults(rows);
    } finally {
      setLoadingSearch(false);
    }
  };

  const openPrivate = async (profileId: string) => {
    setSubmitting(true);
    try {
      const conversationId = await createPrivateConversation(profileId);
      router.replace(`/(app)/conversations/${conversationId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMember = (member: ChatProfileSearchResult) => {
    setSelectedMembers((prev) => (
      prev.some((m) => m.id === member.id)
        ? prev.filter((m) => m.id !== member.id)
        : [...prev, member]
    ));
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;
    setSubmitting(true);
    try {
      const conversationId = await createCustomGroupConversation({
        name: groupName.trim(),
        description: groupDescription.trim() || null,
        memberIds: selectedMembers.map((m) => m.id),
        autoArchiveEnabled: autoArchive,
      });
      router.replace(`/(app)/conversations/${conversationId}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isLight ? '#EEF3FA' : '#060B17' }}>
      <HubTopNav title="Nova conversa" plainBack titleClassName="text-[18px]" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <Pill label="Privada" tone={mode === 'private' ? 'active' : 'default'} onPress={() => setMode('private')} />
          <Pill label="Grupo" tone={mode === 'group' ? 'active' : 'default'} onPress={() => setMode('group')} />
        </View>

        {mode === 'group' ? (
          <View style={{ gap: 10, marginBottom: 12 }}>
            <Input
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Nome do grupo"
              size="md"
              containerClassName="border-line2 bg-[#0C111E]"
              inputClassName="text-fg1"
              leftIcon={<Users size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />}
            />
            <Input
              value={groupDescription}
              onChangeText={setGroupDescription}
              placeholder="Descrição (opcional)"
              size="md"
              containerClassName="border-line2 bg-[#0C111E]"
              inputClassName="text-fg1"
            />

            <View>
              <Text variant="micro" className="mb-2 text-fg3 font-semibold">
                Cada conversa é arquivada automaticamente 7 dias após o jogo?
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pill label="Sim" tone={autoArchive ? 'active' : 'default'} onPress={() => setAutoArchive(true)} />
                <Pill label="Não" tone={!autoArchive ? 'active' : 'default'} onPress={() => setAutoArchive(false)} />
              </View>
            </View>
          </View>
        ) : null}

        <Input
          value={query}
          onChangeText={(v) => void handleSearch(v)}
          onClear={() => {
            setQuery('');
            setResults([]);
          }}
          showClearButton
          placeholder={mode === 'private' ? 'Buscar usuário...' : 'Adicionar membros...'}
          size="md"
          containerClassName="border-line2 bg-[#0C111E]"
          inputClassName="text-fg1"
          leftIcon={<Search size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />}
        />

        {mode === 'group' && selectedMembers.length > 0 ? (
          <View style={{ marginTop: 10, marginBottom: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {selectedMembers.map((member) => (
              <Pressable
                key={member.id}
                onPress={() => toggleMember(member)}
                style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(34,183,108,0.18)', borderWidth: 1, borderColor: 'rgba(34,183,108,0.40)' }}
              >
                <Text variant="micro" className="text-[#86E5B4] font-semibold">{member.full_name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={{ marginTop: 10, gap: 8 }}>
          {loadingSearch ? (
            <Text variant="micro" className="text-fg3">Buscando...</Text>
          ) : results.map((profile) => (
            <Pressable
              key={profile.id}
              onPress={() => (mode === 'private' ? void openPrivate(profile.id) : toggleMember(profile))}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isLight ? '#D1DCEB' : 'rgba(255,255,255,0.10)',
                backgroundColor: isLight ? '#FFFFFF' : '#0C111E',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text variant="caption" className="text-fg1 font-semibold">{profile.full_name}</Text>
              {mode === 'group' ? (
                <Text variant="micro" className={selectedIds.has(profile.id) ? 'text-[#86E5B4]' : 'text-fg3'}>
                  {selectedIds.has(profile.id) ? 'Selecionado' : 'Adicionar'}
                </Text>
              ) : (
                <UserPlus size={16} color={isLight ? '#475569' : '#A5B4C8'} />
              )}
            </Pressable>
          ))}
        </View>

        {mode === 'group' ? (
          <View style={{ marginTop: 16 }}>
            <Button
              label="Criar grupo"
              onPress={() => void createGroup()}
              disabled={submitting || !groupName.trim()}
              loading={submitting}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
