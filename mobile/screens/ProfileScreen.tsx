import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Avatar, Card, Text, Button, List, Divider, Switch } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { user, logout } = useAuth();
  const { sendNotification } = useNotifications();
  const [pushEnabled, setPushEnabled] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const togglePushNotifications = () => {
    const newState = !pushEnabled;
    setPushEnabled(newState);
    
    sendNotification(
      'Notifications ' + (newState ? 'Enabled' : 'Disabled'),
      'You have ' + (newState ? 'enabled' : 'disabled') + ' push notifications'
    );
  };

  const confirmAccountDelete = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call an API to delete the account
            Alert.alert('Account deletion initiated', 'Your account has been scheduled for deletion.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Avatar.Text 
            size={80} 
            label={user?.username?.substring(0, 2).toUpperCase() || 'U'} 
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.username || 'User'}</Text>
            <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
            <Text style={styles.plan}>
              {user?.subscription ? `${user.subscription} Plan` : 'Free Plan'}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Title title="Account Settings" />
        <Card.Content>
          <List.Item
            title="Email"
            description={user?.email || 'user@example.com'}
            left={props => <List.Icon {...props} icon="email" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Change Password"
            left={props => <List.Icon {...props} icon="lock" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Subscription Plan"
            description={user?.subscription ? `${user.subscription} Plan` : 'Free Plan'}
            left={props => <List.Icon {...props} icon="star" />}
            right={props => <Button mode="outlined">Upgrade</Button>}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Title title="Notifications" />
        <Card.Content>
          <List.Item
            title="Push Notifications"
            description="Receive updates about your workflows"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={pushEnabled}
                onValueChange={togglePushNotifications}
              />
            )}
          />
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Log Out
        </Button>
        
        <Button 
          mode="outlined" 
          textColor="#F44336"
          style={styles.deleteButton}
          onPress={confirmAccountDelete}
        >
          Delete Account
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    padding: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
    backgroundColor: '#6200ee',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  plan: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  sectionCard: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 8,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  logoutButton: {
    marginBottom: 16,
  },
  deleteButton: {
    borderColor: '#F44336',
  },
});