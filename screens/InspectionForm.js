import React, { useState, useLayoutEffect, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native";
import {
    Button,
    TextInput,
    Switch,
    ActivityIndicator,
    Snackbar,
} from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import apiClient from "../axiosInstance"; // Adjust the import path if necessary

const InspectionForm = ({ route, navigation }) => {
    const { id, owner, name, baddress } = route.params; 
    useEffect(() =>{
        setOwnerName(owner)
        setBuildingName(name)
        setOwnerName(owner)
    },[id])  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [buildingName, setBuildingName] = useState(name);
    const [address, setAddress] = useState(baddress);
    const [businessName, setBusinessName] = useState("");
    const [natureOfBusiness, setNatureOfBusiness] = useState("");
    const [ownerName, setOwnerName] = useState(owner);
    const [fsecNo, setFsecNo] = useState("");
    const [buildingPermit, setBuildingPermit] = useState("");
    const [fsicNo, setFsic] = useState("");
    const [businessPermitNo, setBusinessPermitNo] = useState("");
    const [fireInsuranceNo, setFireInsuranceNo] = useState("");
    const [contactNo, setContactNo] = useState("");
    const [inspectionOrderNo, setinspectionOrderNo] = useState("");
    const [dateIssued, setDateIssued] = useState("");
    const [dateInspected, setDateInspected] = useState("");
    const [inspectionDuringConstruction, setInspectionDuringConstruction] =
        useState(false);
    const [fsicOccupancy, setFsicOccupancy] = useState(false);
    const [fsicNewPermit, setFsicNewPermit] = useState(false);
    const [fsicRenewPermit, setFsicRenewPermit] = useState(false);
    const [fsicAnnualInspection, setFsicAnnualInspection] = useState(false);
    const [verificationInspection, setVerificationInspection] = useState(false);
    const [ntc, setNtc] = useState(false);
    const [ntcv, setNtcv] = useState(false);
    const [abatement, setAbatement] = useState(false);
    const [closure, setClosure] = useState(false);
    const [disapproval, setDisapproval] = useState(false);
    const [others, setOthers] = useState("");
    const [mercantile, setmercantile] = useState(false);
    const [business, setbusiness] = useState(false);
    const [reinforcedconcrete, setReinforcedconcrete] = useState(false);
    const [timberframedwalls, setTimberframedwalls] = useState(false);
    const [steel, setSteel] = useState(false);
    const [mixed, setMixed] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [activeDateField, setActiveDateField] = useState("");
    const [image, setImage] = useState([]);

    // New state for Pass/Fail and Failure Reason
    const [inspectionResult, setInspectionResult] = useState("pass"); // 'pass' or 'fail'
    const [failureReason, setFailureReason] = useState(""); // Store the reason for failure

    const showDatePicker = (field) => {
        setActiveDateField(field);
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleDateConfirm = (date) => {
        const formattedDate = date.toISOString().split("T")[0];
        if (activeDateField === "dateIssued") {
            setDateIssued(formattedDate);
        } else if (activeDateField === "dateInspected") {
            setDateInspected(formattedDate);
        }
        hideDatePicker();
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        const errors = [];

        if (!inspectionOrderNo) {
            errors.push("Inspection Order No. is required.");
        }

        if (!businessName) {
            errors.push("Business Name is required.");
        }

        if (!address) {
            errors.push("Address is required.");
        }

        // If the inspection result is "fail", ensure the failure reason is provided
        if (inspectionResult === "fail" && !failureReason) {
            errors.push("Please provide a reason for failure.");
        }

        if (errors.length > 0) {
            setError(errors.join("\n"));
            setLoading(false);
            return;
        }

        const formData = new FormData();

        // Append general form fields
        formData.append("inspectionOrderNo", inspectionOrderNo);
        formData.append("dateIssued", dateIssued);
        formData.append("dateInspected", dateInspected);
        formData.append("inspectionResult", inspectionResult);

        if (inspectionResult === "fail") {
            formData.append("failureReason", failureReason);
        }

        // Append additional fields
        formData.append("booking_id", id);
        formData.append("buildingName", buildingName);
        formData.append("address", address);
        formData.append("businessName", businessName);
        formData.append("natureOfBusiness", natureOfBusiness);
        formData.append("ownerName", ownerName);
        formData.append("fsecNo", fsecNo);
        formData.append("buildingPermit", buildingPermit);
        formData.append("fsicNo", fsicNo);
        formData.append("businessPermitNo", businessPermitNo);
        formData.append("fireInsuranceNo", fireInsuranceNo);
        formData.append("contactNo", contactNo);
        formData.append(
            "inspectionDuringConstruction",
            inspectionDuringConstruction
        );
        formData.append("fsicOccupancy", fsicOccupancy);
        formData.append("fsicNewPermit", fsicNewPermit);
        formData.append("fsicRenewPermit", fsicRenewPermit);
        formData.append("fsicAnnualInspection", fsicAnnualInspection);
        formData.append("verificationInspection", verificationInspection);
        formData.append("ntc", ntc);
        formData.append("ntcv", ntcv);
        formData.append("abatement", abatement);
        formData.append("closure", closure);
        formData.append("disapproval", disapproval);
        formData.append("others", others);
        formData.append("mercantile", mercantile);
        formData.append("business", business);
        formData.append("reinforcedconcrete", reinforcedconcrete);
        formData.append("timberframedwalls", timberframedwalls);
        formData.append("steel", steel);
        formData.append("mixed", mixed);

        if (image.length) {
            image.forEach((img) => {
                formData.append("images[]", {
                    uri: img.uri,
                    type: "image/jpeg", // Adjust according to the file type
                    name: img.uri.split("/").pop(),
                });
            });
        }

        try {
            const response = await apiClient.post("/save-inpection", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 201) {
                setBuildingName("");
                setAddress("");
                setBusinessName("");
                setNatureOfBusiness("");
                setOwnerName("");
                setFsecNo("");
                setBuildingPermit("");
                setFsic("");
                setBusinessPermitNo("");
                // setFireInsuranceNo("");
                // setContactNo("");
                // //setInspectionOrderNo("");
                // setDateIssued("");
                // setDateInspected("");
                // setInspectionDuringConstruction(false);
                // setFsicOccupancy(false);
                // setFsicNewPermit(false);
                // setFsicRenewPermit(false);
                // setFsicAnnualInspection(false);
                // setVerificationInspection(false);
                // setNtc(false);
                // setNtcv(false);
                // setAbatement(false);
                // setClosure(false);
                // setDisapproval(false);
                // setOthers("");
                // setMercantile(false);
                // setBusiness(false);
                // setReinforcedconcrete(false);
                // setTimberframedwalls(false);
                // setSteel(false);
                // setMixed(false);
                setInspectionResult("pass"); // Reset to pass
                setFailureReason(""); // Reset failure reason
                setImage([]); // Clear image array
                setError("Form submitted successfully!");

                // Optionally navigate to a different screen
                setTimeout(() => {
                    navigation.navigate("Booking");
                }, 1000);
            } else {
                // Failure - Show failure message
                setError("Failed to submit form. Please try again.");
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            setError(
                "Failed to submit form. Please check your network or try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        // Request permission to access the media library
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Sorry, we need camera roll permissions to make this work!");
            return;
        }

        // Launch image picker to select multiple images
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets); // Store the selected images
        }
    };

    // Dynamically set the header title based on the `id`
    useLayoutEffect(() => {
        // navigation.setOptions({
        //     title: `Booking ID #${id}`, // Change title dynamically
        // });
        navigation.setOptions({
            headerTitle: () => (
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>{name}</Text>
                    <Text style={styles.subtitle}>{owner}</Text>
                </View>
            ),
        });
    }, [navigation, id]); // Only update if `id` change

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.header}>I. REFERENCE</Text>

                <TextInput
                    label="Inspection Order Number"
                    value={inspectionOrderNo}
                    onChangeText={setinspectionOrderNo}
                    style={styles.input}
                    keyboardType="numeric"
                />

                {/* <TouchableOpacity
                    onPress={() => showDatePicker("dateIssued")}
                    style={styles.dateInput}
                >
                    <Text>{dateIssued || "Select Date"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => showDatePicker("dateInspected")}
                    style={styles.dateInput}
                >
                    <Text>{dateInspected || "Select Date"}</Text>
                </TouchableOpacity> */}

                <Text style={styles.header}>
                    II. NATURE OF INSPECTION CONDUCTED
                </Text>
                <SwitchInput
                    label="Inspection During Construction"
                    value={inspectionDuringConstruction}
                    onValueChange={setInspectionDuringConstruction}
                />
                <SwitchInput
                    label="FSIC Occupancy"
                    value={fsicOccupancy}
                    onValueChange={setFsicOccupancy}
                />
                <SwitchInput
                    label="FSIC New Permit"
                    value={fsicNewPermit}
                    onValueChange={setFsicNewPermit}
                />
                <SwitchInput
                    label="FSIC Renew Permit"
                    value={fsicRenewPermit}
                    onValueChange={setFsicRenewPermit}
                />
                <SwitchInput
                    label="FSIC Annual Inspection"
                    value={fsicAnnualInspection}
                    onValueChange={setFsicAnnualInspection}
                />
                <SwitchInput
                    label="Verification Inspection"
                    value={verificationInspection}
                    onValueChange={setVerificationInspection}
                />
                <SwitchInput label="NTC" value={ntc} onValueChange={setNtc} />
                <SwitchInput
                    label="NTCv"
                    value={ntcv}
                    onValueChange={setNtcv}
                />
                <SwitchInput
                    label="Abatement"
                    value={abatement}
                    onValueChange={setAbatement}
                />
                <SwitchInput
                    label="Closure"
                    value={closure}
                    onValueChange={setClosure}
                />
                <SwitchInput
                    label="Disapproval"
                    value={disapproval}
                    onValueChange={setDisapproval}
                />

                <TextInput
                    label="Others (Specify)"
                    value={others}
                    onChangeText={setOthers}
                    style={styles.input}
                />

                <Text style={styles.header}>III. GENERAL INFORMATION</Text>

                <TextInput
                    label="Name of Building"
                    value={buildingName}
                    onChangeText={setBuildingName}
                    style={styles.input}
                />
                <TextInput
                    label="Address"
                    value={address}
                    onChangeText={setAddress}
                    style={styles.input}
                    multiline={true}
                />
                <TextInput
                    label="Business Name"
                    value={businessName}
                    onChangeText={setBusinessName}
                    style={styles.input}
                />
                <TextInput
                    label="Nature of Business"
                    value={natureOfBusiness}
                    onChangeText={setNatureOfBusiness}
                    style={styles.input}
                />
                <TextInput
                    label="Name of Owner/Representative"
                    value={ownerName}
                    onChangeText={setOwnerName}
                    style={styles.input}
                />
                <TextInput
                    label="FSEC NO."
                    value={fsecNo}
                    onChangeText={setFsecNo}
                    style={styles.input}
                    keyboardType="numeric"
                />
                <TextInput
                    label="Building Permit No."
                    value={buildingPermit}
                    onChangeText={setBuildingPermit}
                    style={styles.input}
                    keyboardType="numeric"
                />
                <TextInput
                    label="FSIC No."
                    value={fsicNo}
                    onChangeText={setFsic}
                    style={styles.input}
                    keyboardType="numeric"
                />
                <TextInput
                    label="Business Permit No."
                    value={businessPermitNo}
                    onChangeText={setBusinessPermitNo}
                    style={styles.input}
                    keyboardType="numeric"
                />
                <TextInput
                    label="Fire Insurance No."
                    value={fireInsuranceNo}
                    onChangeText={setFireInsuranceNo}
                    style={styles.input}
                    keyboardType="numeric"
                />
                <TextInput
                    label="Contact No."
                    value={contactNo}
                    onChangeText={setContactNo}
                    style={styles.input}
                />

                <Text style={styles.header}>IV. TYPE OF BUILDING</Text>
                <SwitchInput
                    label="Mercantile"
                    value={mercantile}
                    onValueChange={setmercantile}
                />
                <SwitchInput
                    label="Business"
                    value={business}
                    onValueChange={setbusiness}
                />
                <SwitchInput
                    label="Reinforced Concrete"
                    value={reinforcedconcrete}
                    onValueChange={setReinforcedconcrete}
                />
                <SwitchInput
                    label="Timber Framed Walls"
                    value={timberframedwalls}
                    onValueChange={setTimberframedwalls}
                />
                <SwitchInput
                    label="Steel"
                    value={steel}
                    onValueChange={setSteel}
                />
                <SwitchInput
                    label="Mixed"
                    value={mixed}
                    onValueChange={setMixed}
                />

                {/* Button to trigger Image Picker */}
                <Button
                    mode="outlined"
                    onPress={pickImage}
                    style={styles.submitButton}
                >
                    Select Image
                </Button>

                {image.length > 0 && (
                    <ScrollView horizontal style={styles.imagePreviewContainer}>
                        {image.map((img, index) => (
                            <Image
                                key={index}
                                source={{ uri: img.uri }}
                                style={styles.imagePreview}
                            />
                        ))}
                    </ScrollView>
                )}
                <View
                    style={{
                        backgroundColor: "#ddd",
                        padding: 10,
                        marginTop: 20,
                        borderRadius: 10,
                    }}
                >
                    <Text style={{ fontWeight: "bold", marginTop: 20 }}>
                        Remarks
                    </Text>
                    <View style={styles.switchRow}>
                        <Text>Pass</Text>
                        <Switch
                            value={inspectionResult === "pass"}
                            onValueChange={() => setInspectionResult("pass")}
                        />
                        <Text>Fail</Text>
                        <Switch
                            value={inspectionResult === "fail"}
                            onValueChange={() => setInspectionResult("fail")}
                        />
                    </View>
                </View>

                {inspectionResult === "fail" && (
                    <TextInput
                        label="Reason for Failure"
                        value={failureReason}
                        onChangeText={setFailureReason}
                        style={[styles.input, { height: 100 }]} // Adjust height for multiline input
                        multiline
                        numberOfLines={4}
                    />
                )}

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    style={styles.submitButton}
                >
                    Submit
                </Button>
            </ScrollView>

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
            />

            <Snackbar
                visible={!!error}
                onDismiss={() => setError("")}
                duration={Snackbar.DURATION_SHORT}
            >
                {error}
            </Snackbar>
        </View>
    );
};

const SwitchInput = ({ label, value, onValueChange }) => (
    <View style={styles.switchRow}>
        <Text>{label}</Text>
        <Switch value={value} onValueChange={onValueChange} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    scrollContainer: { paddingBottom: 16 },
    header: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
    input: { marginBottom: 12 },
    submitButton: { marginTop: 20 },
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    dateInput: {
        borderBottomWidth: 1,
        paddingVertical: 8,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    imageText: { marginTop: 8, fontSize: 14, color: "gray" }, // Display image URI
    imagePreviewContainer: { flexDirection: "row", marginVertical: 10 },
    imagePreview: { width: 100, height: 100, marginRight: 10 },
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
});

export default InspectionForm;
