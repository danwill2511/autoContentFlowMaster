
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Text } from 'react-native-paper';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <List.Section>
        <List.Subheader>Recent Notifications</List.Subheader>
        <List.Item
          title="Workflow Completed"
          description="Your content generation workflow completed successfully"
          left={props => <List.Icon {...props} icon="check-circle" />}
        />
        <List.Item
          title="New Posts Generated"
          description="5 new posts were generated and scheduled"
          left={props => <List.Icon {...props} icon="file-document" />}
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
