import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, Clock3, MessageCircle, Plus, Search, UserPlus, Users, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import {
  ConversationListItem,
  HubTopNav,
} from '@/src/components/features/store';
import { Button, Input, Pill, SkeletonList, Text } from '@/src/components/ui';
import { useChatList } from '@/src/features/chat/hooks/useChatList';
import {
  createCustomGroupConversation,
  createPrivateConversation,
  searchChatProfiles,
  uploadCustomGroupAvatar,
  type ChatProfileSearchResult,
} from '@/src/features/chat/services/chatService';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';

type CreateMode = 'private' | 'group';

async function readUriAsBlob(uri: string): Promise<Blob> {
  try {
    const response = await fetch(uri);
    return await response.blob();
  } catch {
    return await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onerror = () => reject(new Error('Nao foi possivel ler a imagem selecionada.'));
      xhr.onload = () => resolve(xhr.response as Blob);
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }
}

export default function ConversationsListScreen() {
  const { t } = useTranslation('chat');
  const { filter, setFilter, loading, error, summary, visibleActive, visibleArchived, refresh } = useChatList();
  const theme = useAppColorScheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [createMenuVisible, setCreateMenuVisible] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChatProfileSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [autoArchive, setAutoArchive] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<ChatProfileSearchResult[]>([]);
  const [groupAvatar, setGroupAvatar] = useState<{ uri: string; fileName: string; mimeType: string } | null>(null);

  const isLight = theme === 'light';
  const selectedIds = useMemo(() => new Set(selectedMembers.map((member) => member.id)), [selectedMembers]);

  const filterItems = (items: typeof visibleActive) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) =>
      item.title.toLowerCase().includes(q)
      || item.message.toLowerCase().includes(q)
      || (item.author ?? '').toLowerCase().includes(q)
    );
  };

  const data = useMemo(() => {
    const filteredActive = filterItems(visibleActive);
    const filteredArchived = filterItems(visibleArchived);

    if (filter === 'todas' && filteredArchived.length > 0) {
      return [
        ...filteredActive.map((item) => ({ type: 'conversation' as const, id: item.id, item })),
        { type: 'archivedHeader' as const, id: 'archived-header' },
        ...filteredArchived.map((item) => ({ type: 'conversation' as const, id: item.id, item })),
      ];
    }

    return [...filteredActive, ...filterItems(visibleArchived)].map((item) => ({ type: 'conversation' as const, id: item.id, item }));
  }, [filter, visibleActive, visibleArchived, searchQuery]);

  const resetCreateForm = () => {
    setQuery('');
    setResults([]);
    setLoadingSearch(false);
    setSubmitting(false);
    setGroupName('');
    setGroupDescription('');
    setAutoArchive(false);
    setSelectedMembers([]);
    setGroupAvatar(null);
  };

  const openCreateModal = (mode: CreateMode) => {
    resetCreateForm();
    setCreateMenuVisible(false);
    setCreateMode(mode);
  };

  const closeCreateModal = () => {
    if (submitting) return;
    setCreateMode(null);
    resetCreateForm();
  };

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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nao foi possivel buscar usuarios.';
      Alert.alert('Falha na busca', message);
    } finally {
      setLoadingSearch(false);
    }
  };

  const openPrivate = async (profileId: string) => {
    setSubmitting(true);
    try {
      const conversationId = await createPrivateConversation(profileId);
      setCreateMode(null);
      resetCreateForm();
      void refresh();
      router.push(`/(app)/conversations/${conversationId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nao foi possivel abrir conversa.';
      Alert.alert('Falha ao criar conversa', message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMember = (member: ChatProfileSearchResult) => {
    setSelectedMembers((previous) => (
      previous.some((item) => item.id === member.id)
        ? previous.filter((item) => item.id !== member.id)
        : [...previous, member]
    ));
  };

  const pickGroupAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82,
      mediaTypes: ['images'],
    });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setGroupAvatar({
      uri: asset.uri,
      fileName: asset.fileName ?? `grupo-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
    });
  };

  const createGroup = async () => {
    if (!groupName.trim() || submitting) return;
    setSubmitting(true);
    try {
      let avatarUrl: string | null = null;
      if (groupAvatar) {
        const blob = await readUriAsBlob(groupAvatar.uri);
        avatarUrl = await uploadCustomGroupAvatar({
          fileName: groupAvatar.fileName,
          mimeType: groupAvatar.mimeType,
          bytes: blob,
        });
      }

      const conversationId = await createCustomGroupConversation({
        name: groupName.trim(),
        description: groupDescription.trim() || null,
        avatarUrl,
        memberIds: selectedMembers.map((member) => member.id),
        autoArchiveEnabled: autoArchive,
      });
      setCreateMode(null);
      resetCreateForm();
      void refresh();
      router.push(`/(app)/conversations/${conversationId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nao foi possivel criar grupo.';
      Alert.alert('Falha ao criar grupo', message);
    } finally {
      setSubmitting(false);
    }
  };

  const createModalTitle = createMode === 'group' ? 'Novo grupo' : 'Nova conversa';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isLight ? '#EEF3FA' : '#060B17' }}>
      <FlashList
        data={data}
        keyExtractor={(item) => item.id}
        bounces
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
        ListHeaderComponent={(
          <>
            <HubTopNav
              title=""
              plainBack
              centerNode={(
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 2, marginLeft: -10 }}>
                  <Pill
                    label={`${t('filters.all', 'Todas')} ${summary.allCount}`}
                    tone={filter === 'todas' ? 'active' : 'default'}
                    size="sm"
                    onPress={() => setFilter('todas')}
                  />
                  <Pill size="sm" label={`${t('filters.active', 'Ativas')} ${summary.activeCount}`} tone={filter === 'ativas' ? 'active' : 'default'} onPress={() => setFilter('ativas')} />
                  <Pill size="sm" label={`${t('filters.asHost', 'Como Host')} ${summary.hostCount}`} tone={filter === 'host' ? 'active' : 'default'} onPress={() => setFilter('host')} />
                  <Pill size="sm" label={`${t('filters.asPlayer', 'Como Jogador')} ${summary.playerCount}`} tone={filter === 'jogador' ? 'active' : 'default'} onPress={() => setFilter('jogador')} />
                  <Pill size="sm" label={`${t('filters.archived', 'Arquivadas')} ${summary.archivedCount}`} tone={filter === 'arquivadas' ? 'active' : 'default'} onPress={() => setFilter('arquivadas')} />
                </View>
              )}
              rightNode={(
                <Pressable
                  onPress={() => setCreateMenuVisible(true)}
                  hitSlop={12}
                  className="w-10 h-10 items-end justify-center"
                >
                  <Plus size={20} color={isLight ? '#3B4A5E' : '#FFFFFF'} strokeWidth={2.4} />
                </Pressable>
              )}
            />

            <View style={{ marginHorizontal: 18, marginTop: 0, marginBottom: 12 }}>
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                onClear={() => setSearchQuery('')}
                showClearButton
                placeholder="Buscar conversa ou usuário..."
                leftIcon={<Search size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />}
                size="sm"
                containerClassName="border-line2 bg-[#0C111E]"
                inputClassName="text-fg1"
              />
            </View>

            <View
              className="mx-[18px] mt-1 mb-2 px-3 py-[10px] border rounded-2xl flex-row items-center gap-2"
              style={{
                borderColor: isLight ? '#CFE1D4' : 'rgba(34,183,108,0.30)',
                backgroundColor: isLight ? '#E8F6EE' : '#113126',
              }}
            >
              <Clock3 size={12} color={isLight ? '#1A8F57' : '#86E5B4'} strokeWidth={2.2} />
              <Text variant="micro" className="text-[#1F2937] dark:text-fg2">
                {t('list.linkedToMatchHint', 'Cada conversa e vinculada a uma ')}
                <Text variant="micro" className="text-[#1A8F57] dark:text-[#86E5B4] font-bold">{t('list.scheduledMatch', 'partida marcada')}</Text>
                {t('list.autoArchiveHint', '. Auto-arquiva 7 dias apos o jogo.')}
              </Text>
            </View>

            {error ? (
              <View className="px-[18px] py-3 border-b border-[rgba(0,0,0,0.08)] dark:border-line">
                <Text variant="micro" className="text-[#D66658] dark:text-[#FF9A9A]">
                  {error}
                </Text>
              </View>
            ) : null}

            {loading ? (
              <View className="px-[18px] py-3">
                <SkeletonList rows={3} />
              </View>
            ) : null}
          </>
        )}
        ListEmptyComponent={!loading ? (
          <View className="px-[18px] py-6">
            <Text variant="micro" className="text-[#4B5563] dark:text-fg3">
              {searchQuery.trim()
                ? 'Nenhum resultado encontrado.'
                : t('list.empty', 'Nenhuma conversa encontrada.')}
            </Text>
          </View>
        ) : null}
        renderItem={({ item }) => {
          if (item.type === 'archivedHeader') {
            return (
              <View className="px-[18px] pt-[16px] pb-1">
                <Text variant="micro" className="uppercase tracking-[2.4px] font-extrabold text-[#111827] dark:text-white">
                  {t('filters.archived', 'Arquivadas')} <Text className="text-gold-700 dark:text-goldA">{visibleArchived.length}</Text>
                </Text>
              </View>
            );
          }

          return (
            <ConversationListItem
              item={item.item}
              onPress={() => router.push(`/(app)/conversations/${item.item.id}`)}
            />
          );
        }}
      />

      <Modal visible={createMenuVisible} transparent animationType="fade" onRequestClose={() => setCreateMenuVisible(false)}>
        <Pressable className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }} onPress={() => setCreateMenuVisible(false)}>
          <Pressable
            className="absolute right-4 top-14 rounded-2xl border py-2 overflow-hidden"
            style={{
              width: 220,
              backgroundColor: isLight ? '#FFFFFF' : '#1F1F1F',
              borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.10)',
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 14,
              elevation: 14,
            }}
          >
            <Pressable className="px-4 py-3 flex-row items-center gap-3" onPress={() => openCreateModal('private')}>
              <MessageCircle size={18} color={isLight ? '#334155' : '#E5E7EB'} />
              <Text variant="caption" className="font-semibold text-fg1">Nova conversa</Text>
            </Pressable>
            <Pressable className="px-4 py-3 flex-row items-center gap-3" onPress={() => openCreateModal('group')}>
              <Users size={18} color={isLight ? '#334155' : '#E5E7EB'} />
              <Text variant="caption" className="font-semibold text-fg1">Novo grupo</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!createMode} transparent animationType="fade" onRequestClose={closeCreateModal}>
        <Pressable className="flex-1 items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.58)' }} onPress={closeCreateModal}>
          <Pressable
            className="w-full max-w-[560px] rounded-3xl border p-4"
            style={{
              maxHeight: '86%',
              backgroundColor: isLight ? '#FFFFFF' : '#111827',
              borderColor: isLight ? '#D7DFEA' : 'rgba(255,255,255,0.10)',
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text variant="heading" className="text-fg1 font-bold">{createModalTitle}</Text>
              <Pressable className="h-9 w-9 rounded-full items-center justify-center" style={{ backgroundColor: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.06)' }} onPress={closeCreateModal}>
                <X size={18} color={isLight ? '#475569' : '#A5B4C8'} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
              {createMode === 'group' ? (
                <View style={{ gap: 10, marginBottom: 12 }}>
                  <Pressable className="self-center items-center" onPress={pickGroupAvatar}>
                    <View
                      className="h-24 w-24 rounded-full items-center justify-center border overflow-hidden"
                      style={{ borderColor: 'rgba(34,183,108,0.45)', backgroundColor: isLight ? '#E8F6EE' : '#0A2A1B' }}
                    >
                      {groupAvatar ? (
                        <Image source={{ uri: groupAvatar.uri }} style={{ width: 96, height: 96 }} resizeMode="cover" />
                      ) : (
                        <Camera size={28} color={isLight ? '#168A55' : '#86E5B4'} />
                      )}
                    </View>
                    <Text variant="micro" className="mt-2 text-[#86E5B4] font-semibold">Adicionar foto do grupo</Text>
                  </Pressable>

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
                      Arquivar automaticamente 7 dias após o jogo?
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
                onChangeText={(value) => void handleSearch(value)}
                onClear={() => {
                  setQuery('');
                  setResults([]);
                }}
                showClearButton
                placeholder={createMode === 'private' ? 'Buscar usuário...' : 'Adicionar membros...'}
                size="md"
                containerClassName="border-line2 bg-[#0C111E]"
                inputClassName="text-fg1"
                leftIcon={<Search size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />}
              />

              {createMode === 'group' && selectedMembers.length > 0 ? (
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
                    onPress={() => (createMode === 'private' ? void openPrivate(profile.id) : toggleMember(profile))}
                    disabled={submitting}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View className="h-9 w-9 rounded-full items-center justify-center overflow-hidden" style={{ backgroundColor: isLight ? '#E2E8F0' : '#1F2937' }}>
                        {profile.avatar_url ? (
                          <Image source={{ uri: profile.avatar_url }} style={{ width: 36, height: 36 }} resizeMode="cover" />
                        ) : (
                          <Text variant="micro" className="text-fg2 font-bold">{profile.full_name.slice(0, 1).toUpperCase()}</Text>
                        )}
                      </View>
                      <Text variant="caption" className="text-fg1 font-semibold" numberOfLines={1}>{profile.full_name}</Text>
                    </View>
                    {createMode === 'group' ? (
                      <Text variant="micro" className={selectedIds.has(profile.id) ? 'text-[#86E5B4]' : 'text-fg3'}>
                        {selectedIds.has(profile.id) ? 'Selecionado' : 'Adicionar'}
                      </Text>
                    ) : (
                      <UserPlus size={16} color={isLight ? '#475569' : '#A5B4C8'} />
                    )}
                  </Pressable>
                ))}
              </View>

              {createMode === 'group' ? (
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
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
