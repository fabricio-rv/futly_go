import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Crown, Image as ImageIcon, Mic, Pencil, Pin, Share2, Star, UserPlus, Video } from 'lucide-react-native';

import { Text } from '@/src/components/ui';
import { useAppColorScheme } from '@/src/contexts/ThemeContext';
import { getChatTokens } from '@/src/lib/chatTokens';
import { useTranslation } from '@/src/i18n/hooks/useTranslation';
import {
  addConversationParticipant,
  fetchChatList,
  fetchConversationInfo,
  fetchConversationParticipants,
  getCurrentUserId,
  leaveConversation,
  removeConversationParticipant,
  searchChatProfiles,
  sendMessage,
  setConversationNotificationsEnabled,
  updateConversationParticipantRole,
  updateGroupInfo,
  uploadCustomGroupAvatar,
  type ConversationInfoData,
} from '@/src/features/chat/services/chatService';

type ShareTarget = { id: string; title: string; subtitle: string };
type Participant = {
  user_id: string;
  full_name: string;
  avatar_url?: string | null;
  role: 'host' | 'player' | 'system';
};

function StatItem({
  icon,
  label,
  value,
  onPress,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value?: number;
  onPress?: () => void;
  accent?: string;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={{ flex: 1, minHeight: 92, alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}
    >
      {icon}
      {value !== undefined ? (
        <Text variant="caption" className="font-bold" style={{ marginTop: 8, color: '#E5E7EB' }}>{value}</Text>
      ) : (
        <Text variant="micro" className="font-semibold" style={{ marginTop: 8, color: accent ?? '#E5E7EB' }}>{label}</Text>
      )}
      {value !== undefined ? (
        <Text variant="micro" style={{ marginTop: 4, color: '#9CA3AF' }}>{label}</Text>
      ) : null}
    </Pressable>
  );
}

export default function ConversationInfoScreen() {
  const { t } = useTranslation('chat');
  const theme = useAppColorScheme();
  const tk = getChatTokens(theme);
  const params = useLocalSearchParams<{ id?: string }>();
  const conversationId = params.id ?? '';

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<ConversationInfoData | null>(null);
  const [shareTargets, setShareTargets] = useState<ShareTarget[]>([]);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [participantQuery, setParticipantQuery] = useState('');
  const [participantResults, setParticipantResults] = useState<Array<{ id: string; full_name: string }>>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const isPrivate = info?.type === 'private';
  const isGroup = info?.type === 'group';
  const isAdmin = useMemo(
    () => Boolean(currentUserId && participants.some((p) => p.user_id === currentUserId && p.role === 'host')),
    [currentUserId, participants],
  );

  const load = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const [currentInfo, list, myId] = await Promise.all([
        fetchConversationInfo(conversationId),
        fetchChatList(),
        getCurrentUserId(),
      ]);
      setInfo(currentInfo);
      setCurrentUserId(myId);
      setNameDraft(currentInfo.title);
      setDescriptionDraft(currentInfo.description ?? '');
      setShareTargets(
        list
          .filter((row) => row.conversation_id !== conversationId)
          .map((row) => ({
            id: row.conversation_id,
            title: row.conversation_type === 'private'
              ? (row.private_partner_name ?? t('infoScreen.privateConversation', 'Private chat'))
              : (row.group_name ?? row.match_title ?? t('infoScreen.group', 'Group')),
            subtitle: row.conversation_type === 'private'
              ? t('infoScreen.user', 'User')
              : t('infoScreen.group', 'Group'),
          })),
      );

      if (currentInfo.type === 'group') {
        const groupParticipants = await fetchConversationParticipants(conversationId);
        setParticipants(groupParticipants as Participant[]);
      } else {
        setParticipants([]);
        setParticipantsModalVisible(false);
        setParticipantQuery('');
        setParticipantResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, [conversationId, t]);

  useEffect(() => {
    void load().catch((error) => {
      const message = error instanceof Error ? error.message : t('infoScreen.loadError', 'Failed to load info.');
      Alert.alert(t('common.error', 'Error'), message);
    });
  }, [load, t]);

  const initials = useMemo(() => String(info?.title ?? '?').slice(0, 1).toUpperCase(), [info?.title]);
  const green = tk.brand.green.primary;

  const confirmToggleNotifications = useCallback((nextValue: boolean) => {
    if (!info) return;
    const title = nextValue
      ? t('infoScreen.enableNotificationsTitle', 'Enable notifications')
      : t('infoScreen.disableNotificationsTitle', 'Disable notifications');
    const body = nextValue
      ? t('infoScreen.enableNotificationsBody', 'Do you want to enable notifications for this user?')
      : t('infoScreen.disableNotificationsBody', 'Do you want to disable notifications for this user?');
    Alert.alert(title, body, [
      { text: t('infoScreen.cancel', 'Cancel'), style: 'cancel' },
      {
        text: nextValue ? t('infoScreen.enable', 'Enable') : t('infoScreen.disable', 'Disable'),
        style: nextValue ? 'default' : 'destructive',
        onPress: () => {
          setInfo({ ...info, notificationsEnabled: nextValue });
          void setConversationNotificationsEnabled(conversationId, nextValue).catch((error) => {
            const message = error instanceof Error ? error.message : t('infoScreen.notificationsError', 'Failed to update notifications.');
            Alert.alert(t('common.error', 'Error'), message);
            setInfo({ ...info, notificationsEnabled: !nextValue });
          });
        },
      },
    ]);
  }, [conversationId, info, t]);

  const handleShareContact = useCallback((targetId: string) => {
    if (!info?.partnerId) return;
    void sendMessage(targetId, `${t('infoScreen.contactPrefix', 'Contact')}: ${info.title}`, {
      metadata: {
        contact_profile_id: info.partnerId,
        contact_full_name: info.title,
      },
    })
      .then(() => {
        setShareModalVisible(false);
        Alert.alert(t('infoScreen.success', 'Success'), t('infoScreen.contactShared', 'Contact shared.'));
      })
      .catch((error) => {
        Alert.alert(t('common.error', 'Error'), error instanceof Error ? error.message : t('infoScreen.shareError', 'Failed to share contact.'));
      });
  }, [info, t]);

  const saveGroupInfo = useCallback(() => {
    if (!info || info.type !== 'group') return;
    void updateGroupInfo({
      conversationId,
      name: nameDraft.trim() || info.title,
      description: descriptionDraft.trim() || null,
      avatarUrl: info.avatarUrl ?? null,
    })
      .then(() => {
        setEditingName(false);
        setEditingDescription(false);
        return load();
      })
      .catch((error) => {
        Alert.alert(t('common.error', 'Error'), error instanceof Error ? error.message : t('infoScreen.groupUpdateError', 'Failed to update group.'));
      });
  }, [conversationId, descriptionDraft, info, load, nameDraft, t]);

  const changeGroupPhoto = useCallback(() => {
    if (!info || info.type !== 'group' || !isAdmin) return;
    void (async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(t('infoScreen.permissionTitle', 'Permission required'), t('infoScreen.galleryPermission', 'Allow gallery access to change group photo.'));
        return;
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (picked.canceled || !picked.assets[0]?.uri) return;
      const fileUri = picked.assets[0].uri;
      const fileName = picked.assets[0].fileName ?? `group-${Date.now()}.jpg`;
      const mimeType = picked.assets[0].mimeType ?? 'image/jpeg';
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const publicUrl = await uploadCustomGroupAvatar({ fileName, mimeType, bytes: blob });
      await updateGroupInfo({
        conversationId,
        name: nameDraft.trim() || info.title,
        description: descriptionDraft.trim() || null,
        avatarUrl: publicUrl,
      });
      await load();
    })().catch((error) => {
      Alert.alert(t('common.error', 'Error'), error instanceof Error ? error.message : t('infoScreen.photoUpdateError', 'Failed to update photo.'));
    });
  }, [conversationId, descriptionDraft, info, isAdmin, load, nameDraft, t]);

  const openParticipantActions = useCallback((participant: Participant) => {
    if (!isAdmin || participant.user_id === currentUserId) return;
    const makeAdminLabel = participant.role === 'host'
      ? t('infoScreen.removeAdmin', 'Remove admin')
      : t('infoScreen.makeAdmin', 'Make admin');
    Alert.alert(
      participant.full_name,
      t('infoScreen.memberActions', 'Member actions'),
      [
        { text: t('infoScreen.cancel', 'Cancel'), style: 'cancel' },
        {
          text: makeAdminLabel,
          onPress: () => {
            void updateConversationParticipantRole(
              conversationId,
              participant.user_id,
              participant.role === 'host' ? 'player' : 'host',
            ).then(() => load());
          },
        },
        {
          text: t('infoScreen.removeMember', 'Remove from group'),
          style: 'destructive',
          onPress: () => {
            void removeConversationParticipant(conversationId, participant.user_id).then(() => load());
          },
        },
      ],
    );
  }, [conversationId, currentUserId, isAdmin, load, t]);

  const searchMembersToAdd = useCallback((value: string) => {
    setParticipantQuery(value);
    void (async () => {
      const q = value.trim();
      if (q.length < 2) {
        setParticipantResults([]);
        return;
      }
      const rows = await searchChatProfiles(q);
      const existingIds = new Set(participants.map((p) => p.user_id));
      setParticipantResults(rows
        .filter((row) => !existingIds.has(row.id))
        .map((row) => ({ id: row.id, full_name: row.full_name })));
    })();
  }, [participants]);

  const handleAddMember = useCallback((profileId: string) => {
    void addConversationParticipant(conversationId, profileId, 'player')
      .then(() => {
        setParticipantsModalVisible(false);
        setParticipantQuery('');
        setParticipantResults([]);
        return load();
      })
      .catch((error) => {
        Alert.alert(t('common.error', 'Error'), error instanceof Error ? error.message : t('infoScreen.addMemberError', 'Failed to add member.'));
      });
  }, [conversationId, load, t]);

  const handleLeaveGroup = useCallback(() => {
    Alert.alert(
      t('infoScreen.leaveGroupTitle', 'Leave group'),
      t('infoScreen.leaveGroupBody', 'Do you really want to leave this group?'),
      [
        { text: t('infoScreen.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('infoScreen.leaveGroup', 'Leave group'),
          style: 'destructive',
          onPress: () => {
            void leaveConversation(conversationId)
              .then(() => router.replace('/(app)/conversations'))
              .catch((error) => Alert.alert(t('common.error', 'Error'), error instanceof Error ? error.message : t('infoScreen.leaveGroupError', 'Failed to leave group.')));
          },
        },
      ],
    );
  }, [conversationId, t]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tk.surfaceScreen }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <ChevronLeft size={24} color={tk.icon.primary} />
        </Pressable>
        <Text variant="caption" className="font-bold" style={{ flex: 1, textAlign: 'center', color: tk.text.primary }}>
          {isPrivate ? t('infoScreen.contactInfo', 'Contact info') : t('infoScreen.groupInfo', 'Group info')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="caption" style={{ color: tk.text.muted }}>{t('common.loading', 'Loading...')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 24 }}>
          <View style={{ alignItems: 'center', marginTop: 8 }}>
            <Pressable
              disabled={!isGroup || !isAdmin}
              onPress={changeGroupPhoto}
              style={{
                width: 116,
                height: 116,
                borderRadius: 58,
                overflow: 'hidden',
                backgroundColor: tk.surfaceInput,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {info?.avatarUrl ? (
                <Image source={{ uri: info.avatarUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Text variant="title" className="font-bold" style={{ color: tk.text.muted }}>{initials}</Text>
              )}
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              {editingName && isGroup ? (
                <TextInput
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  style={{
                    minWidth: 180,
                    maxWidth: 280,
                    borderWidth: 1,
                    borderColor: tk.borderInput,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    color: tk.text.primary,
                    backgroundColor: tk.surfaceInput,
                    textAlign: 'center',
                  }}
                />
              ) : (
                <Text variant="title" className="font-bold" style={{ color: tk.text.primary }}>
                  {info?.title ?? ''}
                </Text>
              )}
              {isGroup && isAdmin ? (
                <Pressable onPress={() => setEditingName((v) => !v)} style={{ marginLeft: 8, padding: 4 }}>
                  <Pencil size={16} color={tk.icon.secondary} />
                </Pressable>
              ) : null}
            </View>

            {isGroup ? (
              <View style={{ width: '100%', alignItems: 'center', marginTop: 6 }}>
                {editingDescription && isAdmin ? (
                  <TextInput
                    value={descriptionDraft}
                    onChangeText={setDescriptionDraft}
                    placeholder={t('infoScreen.groupDescriptionPlaceholder', 'Add group description')}
                    multiline
                    style={{
                      width: '94%',
                      minHeight: 62,
                      borderWidth: 1,
                      borderColor: tk.borderInput,
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      color: tk.text.primary,
                      backgroundColor: tk.surfaceInput,
                      textAlignVertical: 'top',
                    }}
                  />
                ) : (
                  <Text variant="caption" style={{ color: tk.text.secondary, textAlign: 'center', width: '92%' }}>
                    {descriptionDraft || t('infoScreen.noGroupDescription', 'No description')}
                  </Text>
                )}
                {isAdmin ? (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                    <Pressable onPress={() => setEditingDescription((v) => !v)} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                      <Text variant="micro" style={{ color: green }}>{t('infoScreen.editDescription', 'Edit description')}</Text>
                    </Pressable>
                    {(editingName || editingDescription) ? (
                      <Pressable onPress={saveGroupInfo} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                        <Text variant="micro" style={{ color: green }}>{t('infoScreen.save', 'Save')}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          <View
            style={{
              marginTop: 14,
              borderRadius: 16,
              backgroundColor: tk.surfaceCard,
              borderWidth: 1,
              borderColor: tk.borderListRow,
              overflow: 'hidden',
            }}
          >
            <View style={{ flexDirection: 'row', paddingHorizontal: 8, paddingTop: 8 }}>
              <StatItem icon={<ImageIcon size={21} color={green} />} label={t('infoScreen.photos', 'Photos')} value={info?.mediaCount ?? 0} />
              <StatItem icon={<Video size={21} color={green} />} label={t('infoScreen.videos', 'Videos')} value={info?.videoCount ?? 0} />
              <StatItem icon={<Mic size={21} color={green} />} label={t('infoScreen.audios', 'Audios')} value={info?.audioCount ?? 0} />
            </View>
            <View style={{ height: 1, backgroundColor: tk.borderListRow, marginHorizontal: 12 }} />
            <View style={{ flexDirection: 'row', paddingHorizontal: 8, paddingBottom: 8 }}>
              <StatItem icon={<Star size={21} color={green} />} label={t('infoScreen.starred', 'Starred')} value={info?.starredCount ?? 0} />
              <StatItem icon={<Pin size={21} color={green} />} label={t('infoScreen.pinned', 'Pinned')} value={info?.pinnedCount ?? 0} />
              <StatItem
                icon={<Share2 size={21} color={green} />}
                label={t('infoScreen.shareContact', 'Share contact')}
                onPress={isPrivate ? () => setShareModalVisible(true) : undefined}
                accent={isPrivate ? green : tk.text.secondary}
              />
            </View>
          </View>

          <View
            style={{
              marginTop: 12,
              minHeight: 56,
              borderRadius: 14,
              backgroundColor: tk.surfaceCard,
              borderWidth: 1,
              borderColor: tk.borderListRow,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text variant="caption" className="font-semibold" style={{ color: tk.text.primary }}>
                {t('infoScreen.notifications', 'Notifications')}
              </Text>
              <Text variant="micro" style={{ color: tk.text.muted, marginTop: 2 }}>
                {isPrivate
                  ? t('infoScreen.notificationsPrivateHint', 'Enable or disable notifications for this user')
                  : t('infoScreen.notificationsGroupHint', 'Enable or disable notifications for this group')}
              </Text>
            </View>
            <View style={{ alignSelf: 'center', justifyContent: 'center' }}>
              <Switch value={info?.notificationsEnabled ?? true} onValueChange={confirmToggleNotifications} />
            </View>
          </View>

          {isGroup ? (
            <View
              style={{
                marginTop: 12,
                borderRadius: 14,
                backgroundColor: tk.surfaceCard,
                borderWidth: 1,
                borderColor: tk.borderListRow,
                overflow: 'hidden',
              }}
            >
              <Pressable
                disabled={!isAdmin}
                onPress={() => setParticipantsModalVisible(true)}
                style={{ minHeight: 56, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: tk.brand.green.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={18} color="#03120B" />
                </View>
                <Text variant="caption" className="font-semibold" style={{ color: isAdmin ? tk.text.primary : tk.text.muted }}>
                  {t('infoScreen.addMember', 'Add member')}
                </Text>
              </Pressable>
              <View style={{ height: 1, backgroundColor: tk.borderListRow }} />
              {participants.map((participant, index) => (
                <Pressable
                  key={participant.user_id}
                  onPress={() => openParticipantActions(participant)}
                  style={{
                    minHeight: 62,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: tk.borderListRow,
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden', backgroundColor: tk.surfaceInput, alignItems: 'center', justifyContent: 'center' }}>
                    {participant.avatar_url ? (
                      <Image source={{ uri: participant.avatar_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <Text variant="micro" className="font-bold" style={{ color: tk.text.muted }}>
                        {participant.full_name.slice(0, 1).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text variant="caption" style={{ color: tk.text.primary }}>{participant.full_name}</Text>
                    {participant.role === 'host' ? (
                      <View style={{ marginTop: 4, alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: 'rgba(34,183,108,0.2)' }}>
                        <Text variant="micro" style={{ color: '#86E5B4' }}>{t('infoScreen.groupAdmin', 'Group admin')}</Text>
                      </View>
                    ) : null}
                  </View>
                  {isAdmin && participant.user_id !== currentUserId ? (
                    <Crown size={16} color={participant.role === 'host' ? '#EAB308' : tk.icon.muted} />
                  ) : null}
                </Pressable>
              ))}
            </View>
          ) : null}

          {isGroup ? (
            <Pressable
              onPress={handleLeaveGroup}
              style={{
                marginTop: 12,
                borderRadius: 14,
                backgroundColor: tk.surfaceCard,
                borderWidth: 1,
                borderColor: tk.borderListRow,
                minHeight: 54,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="caption" className="font-semibold" style={{ color: '#D93025' }}>
                {t('infoScreen.leaveGroup', 'Leave group')}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      )}

      <Modal visible={shareModalVisible} transparent animationType="fade" onRequestClose={() => setShareModalVisible(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }} onPress={() => setShareModalVisible(false)}>
          <Pressable style={{ maxHeight: '72%', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18, backgroundColor: tk.surfaceSheet, borderTopWidth: 1, borderColor: tk.borderSheet }}>
            <Text variant="caption" className="font-bold" style={{ color: tk.text.primary, marginBottom: 8 }}>
              {t('infoScreen.shareContactTitle', 'Share contact')}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {shareTargets.map((target, index) => (
                <Pressable key={target.id} onPress={() => handleShareContact(target.id)} style={{ paddingVertical: 12, borderTopWidth: index === 0 ? 0 : 1, borderTopColor: tk.borderListRow }}>
                  <Text variant="caption" style={{ color: tk.text.primary }}>{target.title}</Text>
                  <Text variant="micro" style={{ color: tk.text.muted, marginTop: 2 }}>{target.subtitle}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {isGroup ? (
        <Modal visible={participantsModalVisible} transparent animationType="fade" onRequestClose={() => setParticipantsModalVisible(false)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 }} onPress={() => setParticipantsModalVisible(false)}>
            <Pressable style={{ width: '100%', maxWidth: 420, maxHeight: '70%', borderRadius: 16, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18, backgroundColor: tk.surfaceSheet, borderWidth: 1, borderColor: tk.borderSheet }}>
            <Text variant="caption" className="font-bold" style={{ color: tk.text.primary, marginBottom: 8 }}>
              {t('infoScreen.addMember', 'Add member')}
            </Text>
            <TextInput
              value={participantQuery}
              onChangeText={searchMembersToAdd}
              placeholder={t('infoScreen.searchUser', 'Search user')}
              placeholderTextColor={tk.text.muted}
              style={{ borderWidth: 1, borderColor: tk.borderInput, borderRadius: 10, backgroundColor: tk.surfaceInput, color: tk.text.primary, paddingHorizontal: 12, paddingVertical: 10 }}
            />
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 8 }}>
              {participantResults.map((row) => (
                <Pressable key={row.id} onPress={() => handleAddMember(row.id)} style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: tk.borderListRow }}>
                  <Text variant="caption" style={{ color: tk.text.primary }}>{row.full_name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={() => setParticipantsModalVisible(false)} style={{ marginTop: 10, alignItems: 'center' }}>
              <Text variant="caption" style={{ color: tk.text.secondary }}>{t('infoScreen.cancel', 'Cancel')}</Text>
            </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}
