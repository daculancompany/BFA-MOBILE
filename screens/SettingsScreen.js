// screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const SettingsScreen = () => {
  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logged out!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text>Adjust your preferences here.</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
