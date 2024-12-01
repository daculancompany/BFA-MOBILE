import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import {
    Provider as PaperProvider,
    Card,
    Button,
    Modal,
    Portal,
} from "react-native-paper";
import apiClient from "../axiosInstance";

const BuildingInfoScreen = ({ navigation }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [modalInspect, setModalInspect] = useState(false);
    const [inspectionData, setInspectionData] = useState(null);

    const fetchBookings = async () => {
        try {
            const response = await apiClient.get("/bookings");
            setBookings(response.data);
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

    const renderBookingItem = ({ item }) => (
        <Card
            style={styles.bookingCard}
            onPress={() => {
                setSelectedBooking(item);
                setModalVisible(true);
            }}
        >
            <Card.Title title="Bookings" subtitle={`Status: ${item.status}`} />
            <Card.Content>
                <Text style={styles.bookingInfo}>
                    📅 Date & Time: {item.formatted_date}
                </Text>
                <Text style={styles.bookingInfo}>
                    🏢 Building: {item.building_info}
                </Text>
                <Text style={styles.bookingInfo}>
                    🧑‍💼 Personnel:{" "}
                    {item.personnel ? item.personnel.name : "Not assigned"}
                </Text>
                {item.buildingInfo?.remarks && (
                    <>
                        <Text style={styles.bookingInfo}>
                            ✅ Remarks: {item.buildingInfo?.remarks}
                        </Text>
                    </>
                )}
            </Card.Content>
            <Card.Actions>
                <Button
                    mode="outlined"
                    onPress={() => {
                        setSelectedBooking(item);
                        setModalVisible(true);
                    }}
                >
                    View Details
                </Button>
                {item.status === "completed" && (
                    <Button
                        mode="outlined"
                        onPress={() => {
                            setModalInspect(true);
                            setInspectionData(item?.buildingInfo);
                        }}
                    >
                        View Inspection
                    </Button>
                )}
            </Card.Actions>
        </Card>
    );

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                color="#4CAF50"
                style={styles.loader}
            />
        );
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
                    data={bookings}
                    renderItem={renderBookingItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                />

                <Portal>
                    <Modal
                        visible={modalVisible}
                        onDismiss={() => setModalVisible(false)}
                        contentContainerStyle={styles.modalContainer}
                    >
                        {selectedBooking ? (
                            <View>
                                <Text style={styles.modalTitle}>
                                    Booking Details
                                </Text>
                                <Text style={styles.modalText}>
                                    📅 Date & Time:{" "}
                                    {selectedBooking.formatted_date}
                                </Text>
                                <Text style={styles.modalText}>
                                    🏢 Building: {selectedBooking.building_info}
                                </Text>
                                <Text style={styles.modalText}>
                                    🧑‍💼 Personnel:{" "}
                                    {selectedBooking.personnel
                                        ? selectedBooking.personnel.name
                                        : "Not assigned"}
                                </Text>
                                <Text style={styles.modalText}>
                                    📝 Additional Info: Static information for
                                    demo purposes.
                                </Text>
                                <Button
                                    mode="contained"
                                    onPress={() => setModalVisible(false)}
                                    style={styles.closeButton}
                                >
                                    Close
                                </Button>
                            </View>
                        ) : (
                            <Text style={styles.modalText}>
                                No details available.
                            </Text>
                        )}
                    </Modal>
                    <Modal
                        visible={modalInspect}
                        onDismiss={() => setModalInspect(false)}
                        contentContainerStyle={styles.modalContainer}
                    >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>
                                Inspection Details
                            </Text>

                            <Text style={styles.modalLabel}>
                                Inspection Order No:
                            </Text>
                            <Text style={styles.modalValue}>
                                {inspectionData?.inspection_order_no}
                            </Text>

                            <Text style={styles.modalLabel}>Date Issued:</Text>
                            <Text style={styles.modalValue}>
                                {inspectionData?.date_issued}
                            </Text>

                            <Text style={styles.modalLabel}>
                                Date Inspected:
                            </Text>
                            <Text style={styles.modalValue}>
                                {inspectionData?.date_inspected}
                            </Text>

                            <Text style={styles.modalLabel}>
                                Business Name:
                            </Text>
                            <Text style={styles.modalValue}>
                                {inspectionData?.business_name}
                            </Text>

                            <Text style={styles.modalLabel}>
                                Nature of Business:
                            </Text>
                            <Text style={styles.modalValue}>
                                {inspectionData?.nature_of_business}
                            </Text>

                            <Text style={styles.modalLabel}>Owner Name:</Text>
                            <Text style={styles.modalValue}>
                                {inspectionData?.owner_name}
                            </Text>

                            <Text style={styles.modalLabel}>Address:</Text>
                            <Text style={styles.modalValue}>
                                {inspectionData?.address}
                            </Text>

                            <Text style={styles.modalLabel}>Status:</Text>
                            <Text style={styles.modalValue}>
                                {inspectionData?.status}
                            </Text>

                            {/* Example of conditionally rendering booleans */}
                            <Text style={styles.modalLabel}>
                                FSIC Occupancy:
                            </Text>
                            <Text style={styles.modalValue}>
                                {inspectionData?.fsic_occupancy ? "Yes" : "No"}
                            </Text>
                        </ScrollView>

                        {/* Close Button */}
                        <Button
                            mode="contained"
                            onPress={() => setModalInspect(false)}
                        >
                            Close
                        </Button>
                    </Modal>
                </Portal>
            </View>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f7f9fc",
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
    modalLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 10,
    },
    modalValue: {
        fontSize: 16,
        color: "#555",
        marginBottom: 5,
    },
});

export default BuildingInfoScreen;
