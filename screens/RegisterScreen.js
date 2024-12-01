import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Image, 
  SafeAreaView, 
  Alert 
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import apiClient from '../axiosInstance';

// Import the image
const logo = require('../assets/images/bfp.png'); // Adjust the path as needed

const RegisterScreen = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors } } = useForm(); 
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setPasswordMatchError('Passwords do not match');
      return;
    } else {
      setPasswordMatchError('');
    }
  
    try {
      const response = await apiClient.post('/building-owner/register', data);
      console.log('Registration successful:', response.data.message);
      setSuccessMessage('Registration successful!'); // Show success message
      // Optionally store the token or user data in AsyncStorage here
      
      // Navigate to Login screen after successful registration
      navigation.navigate('Login');
    } catch (error) {
      console.error('Registration error:', error.message);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        Alert.alert('Registration Error', error.response.data.message || 'An error occurred, please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.inner} behavior="padding">
        <Image source={logo} style={styles.image} />
        <Text style={styles.title}>Bureau of Fire Protection</Text>
        <Text style={styles.subtitle}>Building Owner</Text>
        <Text style={styles.subtitle}>Register</Text>
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        {/* Name Field */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                placeholder="Name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
                placeholderTextColor="#888"
              />
              {errors.name && <Text style={styles.errorText}>Name is required</Text>}
            </>
          )}
          name="name"
          rules={{ required: true }}
        />

        {/* Address Field */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                placeholder="Address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
                placeholderTextColor="#888"
              />
              {errors.address && <Text style={styles.errorText}>Address is required</Text>}
            </>
          )}
          name="address"
          rules={{ required: true }}
        />

        {/* Email Field */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                placeholder="Email"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
                keyboardType="email-address"
                placeholderTextColor="#888"
              />
              {errors.email && <Text style={styles.errorText}>Valid email is required</Text>}
            </>
          )}
          name="email"
          rules={{ required: true, pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' } }}
        />

        {/* Password Field */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                placeholder="Password"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
                placeholderTextColor="#888"
              />
              {errors.password && <Text style={styles.errorText}>Password is required (min 8 characters)</Text>}
            </>
          )}
          name="password"
          rules={{ required: true, minLength: { value: 8, message: 'Password must be at least 8 characters long' } }}
        />

        {/* Confirm Password Field */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
                placeholderTextColor="#888"
              />
              {errors.confirmPassword && <Text style={styles.errorText}>Confirmation password is required</Text>}
              {passwordMatchError && <Text style={styles.errorText}>{passwordMatchError}</Text>}
            </>
          )}
          name="confirmPassword"
          rules={{ required: true }}
        />

        {/* Register Button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        {/* Navigate to Login */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001f3f',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#fff',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#6200EE',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#6200EE',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    fontSize: 12,
  },
  successText: {
    color: 'green',
    marginBottom: 16,
    fontSize: 14,
  },
});

export default RegisterScreen;
