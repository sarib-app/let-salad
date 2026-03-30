import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';
import { getMockNotifications } from '../../utils/mockNotificationData';

const ICON_MAP = {
  delivery_update: '🚚',
  order_confirmation: '✅',
  promotion: '🎉',
  meal_reminder: '🍽️',
};

const ICON_BG_MAP = {
  delivery_update: '#E8F5E9',
  order_confirmation: '#E3F2FD',
  promotion: '#FFF3E0',
  meal_reminder: '#FCE4EC',
};

const NotificationsScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await getNotifications();
      // setNotifications(response.notifications);
      const mock = getMockNotifications();
      setNotifications(mock.notifications);
    } catch (error) {
      const mock = getMockNotifications();
      setNotifications(mock.notifications);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m`;
    }
    if (diffHours < 24) {
      return `${diffHours}h`;
    }
    if (diffDays === 1) {
      return isAr ? 'أمس' : 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays}d`;
    }
    const month = date.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
    return month;
  };

  const getDateGroup = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (itemDate.getTime() === today.getTime()) return t('notifications.today');
    if (itemDate.getTime() === yesterday.getTime()) return t('notifications.yesterday');
    return t('notifications.earlier');
  };

  const groupedNotifications = () => {
    const groups = [];
    let currentGroup = null;

    notifications.forEach(n => {
      const group = getDateGroup(n.created_at);
      if (group !== currentGroup) {
        groups.push({ type: 'header', title: group, key: `header-${group}` });
        currentGroup = group;
      }
      groups.push({ type: 'item', ...n, key: `item-${n.id}` });
    });

    return groups;
  };

  const hasUnread = notifications.some(n => !n.is_read);

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{item.title}</Text>
        </View>
      );
    }

    const notifType = item.type;
    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.is_read && styles.notifCardUnread]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: ICON_BG_MAP[notifType] || '#F5F5F5' }]}>
          <Text style={styles.iconText}>{ICON_MAP[notifType] || '📌'}</Text>
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifTopRow}>
            <Text style={[styles.notifTitle, !item.is_read && styles.notifTitleUnread]} numberOfLines={1}>
              {isAr ? item.title_ar : item.title}
            </Text>
            <Text style={styles.notifTime}>{formatTimeAgo(item.created_at)}</Text>
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>
            {isAr ? item.message_ar : item.message}
          </Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {hasUnread && (
        <TouchableOpacity style={styles.markAllButton} onPress={markAllRead}>
          <Text style={styles.markAllText}>{t('notifications.markAllRead')}</Text>
        </TouchableOpacity>
      )}

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>{t('notifications.noNotifications')}</Text>
          <Text style={styles.emptyDesc}>{t('notifications.noNotificationsDesc')}</Text>
        </View>
      ) : (
        <FlatList
          data={groupedNotifications()}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  markAllButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  markAllText: {
    ...Fonts.medium,
    fontSize: 14,
    color: Colors.primary,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    marginTop: Spacing.sm,
  },
  sectionHeaderText: {
    ...Fonts.semiBold,
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifCardUnread: {
    backgroundColor: '#F0FFF4',
    borderColor: Colors.primary + '30',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconText: {
    fontSize: 20,
  },
  notifContent: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    ...Fonts.medium,
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  notifTitleUnread: {
    ...Fonts.bold,
  },
  notifTime: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textLight,
  },
  notifMessage: {
    ...Fonts.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;
