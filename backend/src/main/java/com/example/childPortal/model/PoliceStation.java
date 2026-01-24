package com.example.childPortal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "police_stations")
public class PoliceStation {
    @Id
    private String id;
    private String stationName;
    private String district;
    private String city;
    private String address;
    private String contactNumber;
    private String email;
    private String officerInChargeName;
    private String locationCoordinates; // Format: "latitude,longitude"

    public PoliceStation() {
    }

    public PoliceStation(String stationName, String district, String city, String contactNumber) {
        this.stationName = stationName;
        this.district = district;
        this.city = city;
        this.contactNumber = contactNumber;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStationName() {
        return stationName;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOfficerInChargeName() {
        return officerInChargeName;
    }

    public void setOfficerInChargeName(String officerInChargeName) {
        this.officerInChargeName = officerInChargeName;
    }

    public String getLocationCoordinates() {
        return locationCoordinates;
    }

    public void setLocationCoordinates(String locationCoordinates) {
        this.locationCoordinates = locationCoordinates;
    }
}
