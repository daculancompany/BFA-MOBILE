import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logo = require("../assets/images/bfp.png"); // Adjust the path as needed

const HomeScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const storedUserInfo = await AsyncStorage.getItem("userInfo");
                const role = await AsyncStorage.getItem("role");
                setRole(role);
                if (storedUserInfo) {
                    setUserInfo(JSON.parse(storedUserInfo));
                }
            } catch (error) {
                console.error("Failed to load user info:", error);
            }
        };

        loadUserInfo();
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear(); // Clear all session data
            navigation.replace("Login"); // Navigate to Login screen
        } catch (error) {
            console.error("Failed to clear session:", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Image source={logo} style={styles.image} />
                <Text style={styles.title}>Bureau of Fire Protection Opol</Text>
            </View>

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.welcomeMessage}>
                    Welcome {role}, {userInfo ? userInfo.name : ""}!
                </Text>
                <Text style={styles.quote}>
                    "Courage doesn't always roar. Sometimes courage is the quiet
                    voice at the end of the day saying, 'I will try again
                    tomorrow.'"
                </Text>
                <Text style={styles.quote}>
                    "Great things never come from comfort zones. Keep pushing
                    the boundaries!"
                </Text>
                <Text style={styles.quote}>
                    "Your dedication saves lives. Thank you for your service."
                </Text>
            </ScrollView>

            {/* Logout Button */}
            <View style={styles.logoutButton}>
                <Button title="Logout" onPress={handleLogout} color="#d9534f" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#001f3f",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#001f3f",
    },
    image: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    content: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    welcomeMessage: {
        fontSize: 22,
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    quote: {
        fontSize: 16,
        color: "#fff",
        fontStyle: "italic",
        textAlign: "center",
        marginBottom: 15,
    },
    logoutButton: {
        margin: 20,
    },
});

export default HomeScreen;
