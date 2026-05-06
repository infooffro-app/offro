// screens/app/SettingsScreen.js - Settings Page
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AXIS_COLORS = {
  primary: '#003DA5',
  secondary: '#4A90E2',
  lightBg: '#E8F1F8',
  text: '#1A1A1A',
  white: '#FFFFFF',
  border: '#D0E0F0',
};

export default function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          navigation.navigate('Login');
        },
        style: 'destructive',
      },
    ]);
  };

  const SettingItem = ({ icon, title, subtitle, action, isToggle = false, value = false, onToggle }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTexts}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {isToggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: AXIS_COLORS.border, true: AXIS_COLORS.lightBg }}
          thumbColor={value ? AXIS_COLORS.primary : '#999'}
        />
      ) : (
        <TouchableOpacity onPress={action}>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="👤"
              title="Profile"
              subtitle="Manage your profile"
              action={() => navigation.navigate('Profile')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="🔐"
              title="Change Password"
              subtitle="Update your password"
              action={() => navigation.navigate('ChangePassword')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="📧"
              title="Email"
              subtitle="Verify or change email"
              action={() => Alert.alert('Email', 'Email management')}
            />
          </View>
        </View>

        {/* Business Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="🏪"
              title="Shop Details"
              subtitle="Manage your shop info"
              action={() => navigation.navigate('ShopDetails')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="📋"
              title="My Offers"
              subtitle="View and manage offers"
              action={() => navigation.navigate('OfferList')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="📊"
              title="Analytics"
              subtitle="Offer performance & clicks"
              action={() => navigation.navigate('OfferAnalytics')}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="🔔"
              title="Push Notifications"
              subtitle="Offers and updates"
              isToggle={true}
              value={notificationsEnabled}
              onToggle={setNotificationsEnabled}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="📧"
              title="Email Notifications"
              subtitle="Promotional emails"
              isToggle={true}
              value={emailNotifications}
              onToggle={setEmailNotifications}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="🌙"
              title="Dark Mode"
              subtitle="Coming soon"
              isToggle={true}
              value={darkMode}
              onToggle={setDarkMode}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="🌐"
              title="Language"
              subtitle="English"
              action={() => Alert.alert('Language', 'Select language')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="❓"
              title="Help & FAQ"
              subtitle="Get answers"
              action={() => Alert.alert('Help', 'FAQ section')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="📞"
              title="Contact Us"
              subtitle="Get in touch"
              action={() => Alert.alert('Contact', 'support@localoffers.com')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="ℹ️"
              title="About"
              subtitle="Version 1.0.0"
              action={() => Alert.alert('About', 'LocalOffers v1.0.0')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="📋"
              title="Terms & Privacy"
              subtitle="Legal documents"
              action={() => Alert.alert('Terms', 'Terms of Service')}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleLogout}
            >
              <Text style={styles.dangerIcon}>🚪</Text>
              <Text style={styles.dangerText}>Logout</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() =>
                Alert.alert('Delete Account', 'This action cannot be undone', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive' },
                ])
              }
            >
              <Text style={styles.dangerIcon}>🗑️</Text>
              <Text style={styles.dangerText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>LocalOffers © 2024</Text>
          <Text style={styles.footerSubtext}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AXIS_COLORS.lightBg,
  },
  header: {
    backgroundColor: AXIS_COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: AXIS_COLORS.white,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: AXIS_COLORS.white,
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: AXIS_COLORS.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsGroup: {
    backgroundColor: AXIS_COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 14,
    width: 28,
  },
  settingTexts: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AXIS_COLORS.text,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 16,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: AXIS_COLORS.border,
    marginLeft: 56,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dangerIcon: {
    fontSize: 24,
    marginRight: 14,
    width: 28,
  },
  dangerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E74C3C',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    color: AXIS_COLORS.text,
    fontWeight: '700',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
});