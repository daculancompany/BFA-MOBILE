import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import {
    TextInput,
    Button,
    Text,
    Snackbar,
    HelperText,
    RadioButton,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage"; // AsyncStorage for session handling
import apiClient from "../axiosInstance";

const logo = require("../assets/images/bfp.png"); // Adjust the path as needed

const LoginScreen = ({ navigation }) => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [snackVisible, setSnackVisible] = useState(false);
    const [role, setRole] = useState("Building Owner"); // Default role selection

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = await AsyncStorage.getItem("userToken");
            if (token) {
                navigation.navigate("Main"); // Redirect to Main screen if user is logged in
            }
        };

        checkLoggedIn();
    }, [navigation]); // Only run once when the component mounts

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setErrorMessage(""); // Reset error message
            setSuccessMessage(""); // Reset success message

            const response = await apiClient.post(
                "building-owner/login", // Adjust endpoint if needed
                { ...data, role } // Include role in the request
            );
            const { token, user } = response.data; // Adjust based on API response structure

            // Save token and user info in session storage
            await AsyncStorage.setItem("userToken", token);
            await AsyncStorage.setItem("userInfo", JSON.stringify(user));
            await AsyncStorage.setItem("role", role);
            
            setSuccessMessage("Login successful!");
            setSnackVisible(true);

            // Delay navigation for 2 seconds to show the message
            setTimeout(() => {
             navigation.navigate('Main', { key: Date.now().toString() });
            }, 2000);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setErrorMessage("Incorrect email, password, or role.");
            } else {
                setErrorMessage("An error occurred. Please try again.");
            }
            setSnackVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <Image source={logo} style={styles.image} />
            <Text variant="headlineMedium" style={styles.title}>
                Bureau of Fire Protection
            </Text>
            <Text variant="titleMedium" style={styles.subtitle}>
                Login
            </Text>

            {/* Role Selection */}
            <RadioButton.Group
                onValueChange={(newRole) => setRole(newRole)}
                value={role}
            >
                <View style={styles.radioGroup}>
                    <View style={styles.radioButtonContainer}>
                        <RadioButton value="Building Owner" />
                        <Text>Building Owner</Text>
                    </View>
                    <View style={styles.radioButtonContainer}>
                        <RadioButton value="Personel" />
                        <Text>Personnel</Text>
                    </View>
                </View>
            </RadioButton.Group>

            {/* Email Input */}
            <Controller
                control={control}
                name="email"
                rules={{ required: "Email is required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        label="Email"
                        mode="outlined"
                        placeholder="Enter your email"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="email-address"
                        error={!!errors.email}
                        style={styles.input}
                    />
                )}
            />
            {errors.email && (
                <HelperText type="error">{errors.email.message}</HelperText>
            )}

            {/* Password Input */}
            <Controller
                control={control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        label="Password"
                        mode="outlined"
                        placeholder="Enter your password"
                        secureTextEntry
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={!!errors.password}
                        style={styles.input}
                    />
                )}
            />
            {errors.password && (
                <HelperText type="error">{errors.password.message}</HelperText>
            )}

            <Button
                onPress={() => navigation.navigate("ForgotPassword")}
                uppercase={false}
                style={styles.forgotPasswordButton}
            >
                Forgot Password?
            </Button>

            {/* Snackbars for Success/Failure Messages */}
            {snackVisible && (
                <Snackbar
                    visible={snackVisible}
                    onDismiss={() => setSnackVisible(false)}
                    duration={Snackbar.DURATION_SHORT}
                    style={
                        errorMessage
                            ? styles.errorSnackbar
                            : styles.successSnackbar
                    }
                >
                    {errorMessage || successMessage}
                </Snackbar>
            )}

            {/* Login Button */}
            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                disabled={loading}
                style={styles.button}
            >
                {loading ? "Loading..." : "Login"}
            </Button>

            {/* Register Link */}
            <Button
                onPress={() => navigation.navigate("Register")}
                uppercase={false}
                style={styles.registerLink}
            >
                Don't have an account? Register
            </Button>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 16,
        backgroundColor: "#fff",
    },
    image: {
        width: 100,
        height: 100,
        alignSelf: "center",
        marginBottom: 20,
    },
    title: {
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        textAlign: "center",
        marginBottom: 24,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
    },
    forgotPasswordButton: {
        alignSelf: "flex-end",
        marginBottom: 16,
    },
    registerLink: {
        marginTop: 16,
        alignSelf: "center",
    },
    radioGroup: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 16,
    },
    radioButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    successSnackbar: {
        backgroundColor: "green",
    },
    errorSnackbar: {
        backgroundColor: "red",
    },
});

export default LoginScreen;