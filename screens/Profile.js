import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar } from 'react-native-paper';

const Profile = () => {
  // Sample data for the profile
  const userData = {
    name: "John Doe",
    email: "johndoe@example.com",
    address: "123 Main Street, Opol, Misamis Oriental, Philippines",
    profileImage: "https://placeimg.com/200/200/people" // Sample image URL
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        {/* Profile Image */}
        <Card.Content style={styles.cardContent}>
          <Avatar.Image 
            size={100} 
            source={{ uri: userData.profileImage }} 
            style={styles.avatar}
          />
          <Title style={styles.name}>{userData.name}</Title>
          <Paragraph style={styles.email}>{userData.email}</Paragraph>
        </Card.Content>

        {/* Address */}
        <Card.Content>
          <Title style={styles.addressTitle}>Address:</Title>
          <Paragraph style={styles.address}>{userData.address}</Paragraph>
        </Card.Content>

        {/* Action Button */}
        <Card.Actions style={styles.cardActions}>
          <Button onPress={() => console.log('Edit Profile')}>Edit Profile</Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 16,
    padding: 16,
  },
  cardContent: {
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: '#555',
  },
  cardActions: {
    justifyContent: 'center',
  },
});

export default Profile;
