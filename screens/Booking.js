import React, { useLayoutEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Linking,
    FlatList,
    ScrollView,
    Image,
} from "react-native";
import {
    Provider as PaperProvider,
    Card,
    Button,
    Modal,
    Portal,
    IconButton
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { TabView, SceneMap } from "react-native-tab-view";
import apiClient from "../axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import ImageView from "react-native-image-viewing"; // Import image viewing library

const Booking = () => {
    const navigation = useNavigation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [images, setImages] = useState([]); // Image state
    const [imageViewerVisible, setImageViewerVisible] = useState(false); // Image viewer modal state

    // Tabs state
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: "pending", title: "Pending Bookings" },
        { key: "history", title: "Booking History" },
    ]);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [historyBookings, setHistoryBookings] = useState([]);
    const [modalInspect, setModalInspect] = useState(false);
    const [inspectionData, setInspectionData] = useState(null);

    const fetchBookings = async () => {
        try {
            const storedUserInfo = await AsyncStorage.getItem("userInfo");
            let user_id = 0;
            if (storedUserInfo) {
                let info = JSON.parse(storedUserInfo);
                user_id = info?.id;
            }
            const response = await apiClient.get("/my-booking", {
                params: { user_id: user_id },
            });
            const bookingsData = response.data?.bookings || [];
            setBookings(bookingsData);
            // Separate bookings into pending and history
            setPendingBookings(
                bookingsData.filter((b) => b.status === "deployed")
            );
            setHistoryBookings(
                bookingsData.filter((b) => b.status === "completed")
            );
        } catch (err) {
            setError("Failed to fetch bookings. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            onRefresh();
        }, [])
    );

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

    const openImageViewer = (images) => {
        const formattedImages = images.map((img) => ({
            uri: `https://0833-120-28-218-135.ngrok-free.app/uploads/${img.image}`, // Replace with actual image
        }));
        console.log({formattedImages})
        setImages(formattedImages);
        setImageViewerVisible(true);
    };

    const renderBookingItem = ({ item }) => (
        <Card
            style={styles.bookingCard}
            onPress={() => {
                setSelectedBooking(item);
                setModalVisible(true);
            }}
        >
            <Card.Title
                title={item.building.name}
                subtitle={`Owner: ${item.building.owner.name}`}
            />
            <Card.Content>
                <Text style={styles.bookingInfo}>
                    📍 Address: {item.building.address}
                </Text>
                <Text style={styles.bookingInfo}>
                    🏢 Floors: {item.building.floors}
                </Text>
                <Text style={styles.bookingInfo}>
                    🏢 Units: {item.building.units}
                </Text>
                {item.buildingInfo?.remarks && (
                    <>
                        <Text style={styles.bookingInfo}>
                             {item.buildingInfo?.remarks === 'fail' ? '❌'  :  '✅' } Remarks: {item.buildingInfo?.remarks}
                        </Text>
                        item.buildingInfo?.remarks === 'fail' &&(
                            <Text style={styles.bookingInfo}>Reason: <Text style={{ color:'red'}} >{ item.buildingInfo?.reasons}</Text></Text>
                        )
                    </>
                )}
            </Card.Content>
            <Card.Actions>
                {item?.buildingInfo?.images && item?.buildingInfo?.images.length > 0 && (
                    <IconButton
                        icon="image"
                        size={24}
                        color="#4CAF50"
                        onPress={() => openImageViewer(item?.buildingInfo?.images)}
                    />
                )}
                <IconButton
                    icon="map-marker"
                    size={24}
                    color="#4CAF50"
                    onPress={() => openMap(item.building.lat, item.building.lng)}
                />
                {item.status === "completed" ? (
                    <IconButton
                        icon="eye"
                        size={24}
                        color="#4CAF50"
                        onPress={() => {
                            setModalInspect(true);
                            setInspectionData(item?.buildingInfo);
                        }}
                    />
                ) : (
                    <IconButton
                        icon="clipboard-text"
                        size={24}
                        color="#4CAF50"
                        onPress={() => {
                            navigation.navigate("InspectionForm", {
                                id: item.id,
                                name: item.building.name,
                                owner: item.building.owner.name,
                                baddress: item.building.address,
                            });
                        }}
                    />
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
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={SceneMap({
                        pending: () => (
                            <ScrollView
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                    />
                                }
                            >
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    data={pendingBookings}
                                    renderItem={renderBookingItem}
                                    keyExtractor={(item) => item.id.toString()}
                                />
                            </ScrollView>
                        ),
                        history: () => (
                            <ScrollView
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                    />
                                }
                            >
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    data={historyBookings}
                                    renderItem={renderBookingItem}
                                    keyExtractor={(item) => item.id.toString()}
                                />
                            </ScrollView>
                        ),
                    })}
                    onIndexChange={setIndex}
                    initialLayout={{ width: 100 }}
                />
                <ImageView
                    images={images}
                    imageIndex={0}
                    visible={imageViewerVisible}
                    onRequestClose={() => setImageViewerVisible(false)}
                />
            </View>
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
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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

export default Booking;
