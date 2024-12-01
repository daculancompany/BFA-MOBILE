import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Linking,
} from "react-native";
import { Provider as PaperProvider, Card, Button, Modal, Portal } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons"; // For icons
import apiClient from "../axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyBuilding = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = async () => {
        try {
            const storedUserInfo = await AsyncStorage.getItem("userInfo");
            let user_id = 0;
            if (storedUserInfo) {
                let info = (JSON.parse(storedUserInfo));
                user_id = info?.id;
            }
            const response = await apiClient.get("/buildings", { params: { user_id: user_id } });
            setBookings(response.data?.buildings || []);
        } catch (err) {
            setError("Failed to fetch bookings. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const openMap = (lat, lng) => {
        if (lat && lng) {
            const url = `https://www.google.com/maps?q=${lat},${lng}`;
            Linking.openURL(url).catch((err) =>
                console.error("Failed to open map URL", err)
            );
        } else {
            alert("Location details are not available for this building.");
        }
    };

    const renderBookingItem = ({ item }) => (
        <Card
            style={styles.bookingCard}
            onPress={() => {
                setSelectedBooking(item);
                setModalVisible(true);
            }}
        >
            <Card.Title title={item.name} subtitle={`Type: ${item.building_type}`} />
            <Card.Content>
                <Text style={styles.bookingInfo}>📅 Construction Date: {item.construction_date}</Text>
                <Text style={styles.bookingInfo}>📍 Address: {item.address}</Text>
                <Text style={styles.bookingInfo}>🏢 Floors: {item.floors}</Text>
                <Text style={styles.bookingInfo}>🏢 Units: {item.units}</Text>
            </Card.Content>
            <Card.Actions>
                <Button
                    mode="outlined"
                    icon={() => <MaterialIcons name="location-on" size={20} color="#4CAF50" />}
                    onPress={() => openMap(item.lat, item.lng)} 
                >
                    Location
                </Button>
                {/* <Button
                    mode="outlined"
                    onPress={() => {
                        setSelectedBooking(item);
                        setModalVisible(true);
                    }}
                >
                    View Details
                </Button> */}
            </Card.Actions>
        </Card>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />;
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Button mode="contained" onPress={fetchBookings}>
                    Retry
                </Button>
            </View>
        );
    }
    
    return (
        <PaperProvider>
            <View style={styles.container}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={bookings}
                    renderItem={renderBookingItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ItemSeparatorComponent={() => <View style={{height: 10}} />}
                />

                <Portal>
                    <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
                        {selectedBooking ? (
                            <View>
                                <Text style={styles.modalTitle}>Building Details</Text>
                                <Text style={styles.modalText}>📅 Date & Time: {selectedBooking.formatted_date}</Text>
                                <Text style={styles.modalText}>🏢 Address: {selectedBooking.address}</Text>
                                <Text style={styles.modalText}>🧑‍💼 Personnel: {selectedBooking.personnel ? selectedBooking.personnel.name : "Not assigned"}</Text>
                                <Text style={styles.modalText}>📝 Additional Info: Static information for demo purposes.</Text>
                                <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                    Close
                                </Button>
                            </View>
                        ) : (
                            <Text style={styles.modalText}>No details available.</Text>
                        )}
                    </Modal>
                </Portal>
            </View>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f9fc",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#34495e",
        textAlign: "center",
    },
    bookingCard: {
        marginVertical: 10,
        borderRadius: 8,
        elevation: 4,
    },
    bookingInfo: {
        fontSize: 16,
        marginVertical: 4,
        color: "#7f8c8d",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 18,
        color: "#E74C3C",
        textAlign: "center",
        marginBottom: 10,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        paddingBottom: 20,
    },
    modalContainer: {
        backgroundColor: "white",
        padding: 20,
        margin: 20,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    modalText: {
        fontSize: 16,
        marginVertical: 5,
    },
    closeButton: {
        marginTop: 20,
    },
});

export default MyBuilding;
