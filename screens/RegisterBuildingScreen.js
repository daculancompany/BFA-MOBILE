import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import {
    TextInput,
    Button,
    Dialog,
    Portal,
    Paragraph,
    Provider,
} from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment"; // To format the date properly
import apiClient from "../axiosInstance"; // Adjust the import path if needed

const RegisterBuildingScreen = ({ navigation }) => {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [buildingType, setBuildingType] = useState("");
    const [floors, setFloors] = useState("");
    const [units, setUnits] = useState("");
    const [constructionDate, setConstructionDate] = useState("");
    const [lat, setLat] = useState(""); // New state for Latitude
    const [lng, setLng] = useState(""); // New state for Longitude
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");

    const handleDateConfirm = (date) => {
        setConstructionDate(moment(date).format("YYYY-MM-DD")); // Format the date to 'YYYY-MM-DD'
        setDatePickerVisible(false); // Close the picker after selection
    };

    const handleSubmit = async () => {
        // Validation
        if (!name || !address || !buildingType || !lat || !lng) {
            setDialogMessage("Please fill in all required fields.");
            setDialogVisible(true);
            return;
        }

        try {
            // Make POST request to the Laravel backend
            const response = await apiClient.post("/buildings/register", {
                name,
                address,
                building_type: buildingType,
                floors: floors ? parseInt(floors) : null,
                units: units ? parseInt(units) : null,
                construction_date: constructionDate || null,
                lat: parseFloat(lat),  // Ensure lat is treated as a float
                lng: parseFloat(lng), // Ensure lng is treated as a float
            });

            // If successful
            if (response.data.success) {
                setName("");
                setAddress("");
                setBuildingType("");
                setFloors("");
                setUnits("");
                setConstructionDate("");
                setLat(""); // Clear latitude
                setLng(""); // Clear longitude
                setDialogMessage("Building registered successfully!");
                setDialogVisible(true);
            } else {
                setDialogMessage(
                    response.data.message ||
                        "There was a problem registering the building."
                );
                setDialogVisible(true);
            }
        } catch (error) {
            setDialogMessage("There was a problem registering the building.");
            setDialogVisible(true);
            console.error(error.response ? error.response.data : error.message);
        }
    };

    return (
        <Provider>
            <ScrollView contentContainerStyle={styles.container}>
                <TextInput
                    label="Building Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
                <TextInput
                    label="Address"
                    value={address}
                    onChangeText={setAddress}
                    style={styles.input}
                />
                <TextInput
                    label="Building Type"
                    value={buildingType}
                    onChangeText={setBuildingType}
                    style={styles.input}
                />
                <TextInput
                    label="Floors"
                    value={floors}
                    onChangeText={setFloors}
                    style={styles.input}
                    keyboardType="numeric"
                />
                <TextInput
                    label="Units"
                    value={units}
                    onChangeText={setUnits}
                    style={styles.input}
                    keyboardType="numeric"
                />
                <TextInput
                    label="Latitude"
                    value={lat}
                    onChangeText={setLat}
                    style={styles.input}
                    keyboardType="numeric"
                />
                <TextInput
                    label="Longitude"
                    value={lng}
                    onChangeText={setLng}
                    style={styles.input}
                    keyboardType="numeric"
                />
                <View>
                    <Button
                        mode="outlined"
                        onPress={() => setDatePickerVisible(true)}
                        style={styles.dateButton}
                    >
                        Select Construction Date
                    </Button>
                    {constructionDate ? (
                        <Text style={styles.selectedDate}>
                            Selected Date: {constructionDate}
                        </Text>
                    ) : (
                        <Text style={styles.selectedDate}>
                            No Date Selected
                        </Text>
                    )}
                </View>

                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleDateConfirm}
                    onCancel={() => setDatePickerVisible(false)}
                />

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                >
                    Submit
                </Button>
            </ScrollView>

            <Portal>
                <Dialog
                    visible={dialogVisible}
                    onDismiss={() => setDialogVisible(false)}
                >
                    <Dialog.Title>
                        {dialogMessage.includes("successfully")
                            ? "Success"
                            : "Error"}
                    </Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>{dialogMessage}</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDialogVisible(false)}>
                            Close
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#ffffff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        marginBottom: 15,
    },
    selectedDate: {
        marginTop: 10,
        fontSize: 16,
        color: "gray",
    },
    dateButton: {
        marginBottom: 15,
    },
    submitButton: {
        marginTop: 20,
    },
});

export default RegisterBuildingScreen;
