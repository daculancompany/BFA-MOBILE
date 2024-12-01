import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
} from "react-native";
import { RadioButton, Button, ActivityIndicator, TextInput, Provider, Portal, Dialog, Paragraph } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import apiClient from "../axiosInstance";

const ScheduleScreen = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [surveyDate, setSurveyDate] = useState(new Date());
  const [surveyTime, setSurveyTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await apiClient.get("/buildings");
        setBuildings(response.data.data);
      } catch (err) {
        setError("Failed to fetch buildings. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  const createBooking = async (type) => {
    if (!selectedBuilding || !surveyDate || !surveyTime) {
      setDialogMessage("Please select a building and enter a date and time for the survey.");
      setDialogVisible(true);
      return;
    }

    const formattedDate = surveyDate.toISOString().split("T")[0];
    const formattedTime = surveyTime.toTimeString().split(" ")[0];

    try {
      const response = await apiClient.post("/bookings", {
        buildings_id: selectedBuilding,
        type: type,
        appointment_date: `${formattedDate} ${formattedTime}`,
      });

      setDialogMessage("Booking created successfully!");
      setDialogVisible(true);
      resetForm();
    } catch (error) {
      console.error(error);
      setDialogMessage("Failed to create booking. Please try again.");
      setDialogVisible(true);
    }
  };

  const resetForm = () => {
    setSelectedBuilding(null);
    setSurveyDate(new Date());
    setSurveyTime(new Date());
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || surveyDate;
    setShowDatePicker(Platform.OS === "ios"); // Keep picker open on iOS
    setSurveyDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || surveyTime;
    setShowTimePicker(Platform.OS === "ios"); // Keep picker open on iOS
    setSurveyTime(currentTime);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <Provider>
      <View style={styles.container}>
        {/* <Text style={styles.title}>Schedule a Survey</Text> */}

        {/* Building Selection */}
        <FlatList
          data={buildings}
          renderItem={({ item }) => (
            <View style={styles.buildingItem}>
              <RadioButton.Group onValueChange={(value) => setSelectedBuilding(value)} value={selectedBuilding}>
                <View style={styles.radioItem}>
                  <RadioButton value={item.id.toString()} />
                  <View>
                    <Text style={styles.buildingName}>{item.name}</Text>
                    <Text>{item.address}</Text>
                  </View>
                </View>
              </RadioButton.Group>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />

        {/* Date Picker */}
        <View style={styles.pickerContainer}>
          <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
            Select Survey Date
          </Button>
          {showDatePicker && (
            <DateTimePicker
              value={surveyDate}
              mode="date"
              display="calendar"
              onChange={handleDateChange}
            />
          )}
          <Text style={styles.selectedDateText}>Selected Date: {surveyDate.toLocaleDateString()}</Text>
        </View>

        {/* Time Picker */}
        <View style={styles.pickerContainer}>
          <Button mode="outlined" onPress={() => setShowTimePicker(true)} style={styles.timeButton}>
            Select Survey Time
          </Button>
          {showTimePicker && (
            <DateTimePicker
              value={surveyTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={handleTimeChange}
            />
          )}
          <Text style={styles.selectedTimeText}>
            Selected Time: {surveyTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
          </Text>
        </View>

        {/* Create Booking Button */}
        <Button mode="contained" onPress={() => createBooking("survey")} style={styles.submitButton}>
          Create Survey Schedule
        </Button>

        {/* Dialog for success or error messages */}
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
            <Dialog.Title>{dialogMessage.includes("successfully") ? "Success" : "Error"}</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{dialogMessage}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buildingItem: {
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
    padding: 10,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  buildingName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pickerContainer: {
    marginTop: 20,
  },
  dateButton: {
    marginBottom: 10,
  },
  timeButton: {
    marginBottom: 10,
  },
  selectedDateText: {
    fontSize: 16,
    marginTop: 10,
    color: "#333",
  },
  selectedTimeText: {
    fontSize: 16,
    marginTop: 10,
    color: "#333",
  },
  submitButton: {
    marginTop: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
});

export default ScheduleScreen;
