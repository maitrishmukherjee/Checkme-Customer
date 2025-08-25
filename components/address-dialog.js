"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Search, Crosshair } from "lucide-react";
import { getPincodeFromCoordinates } from "@/lib/geocoding";
import { addNewAddress, getStateDistrict, updateAddress } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have a Checkbox component
import { v4 as uuidv4 } from 'uuid'; // Import uuid to generate a random id

// Add CSS for Google Maps autocomplete styling
const autocompleteStyles = `
  .pac-container {
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
    font-family: inherit;
  }
  .pac-item {
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid #f3f4f6;
  }
  .pac-item:hover {
    background-color: #f9fafb;
  }
  .pac-item-selected {
    background-color: #dbeafe;
  }
`;

// A helper component to render the map and its controls
const MapSection = ({
  mapRef,
  getCurrentLocation,
  mapError,
  isMapLoaded,
  showApiKeyInput,
  apiKey,
  setApiKey,
  handleApiKeySubmit,
  searchInputRef,
}) => (
  <div className="relative h-[400px] w-full">
    <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={searchInputRef}
          placeholder="Search for area, street name..."
          className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            backgroundColor: 'white',
          }}
        />
      </div>
      <Button onClick={getCurrentLocation} size="sm" variant="outline" className="bg-white shadow-md">
        <Crosshair className="w-4 h-4" />
      </Button>
    </div>

    {mapError ? (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-red-500 mb-4 text-4xl">🗺️</div>
          <h3 className="text-lg font-semibold mb-2">Google Maps API Key Required</h3>
          <p className="text-sm text-gray-600 mb-4">{mapError}</p>
          {showApiKeyInput && (
            <div className="space-y-3">
              <Input
                placeholder="Enter your Google Maps API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="text-sm"
              />
              <Button onClick={handleApiKeySubmit} size="sm" className="w-full">
                Load Map
              </Button>
            </div>
          )}
        </div>
      </div>
    ) : !isMapLoaded ? (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    ) : (
      <div ref={mapRef} className="w-full h-full" />
    )}
  </div>
);

export default function AddressDialog({ open, onOpenChange, onAddressSelect, editingAddress, title = "Select Address" }) {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    houseNumber: "",
    landmark: "",
    addressType: "Home",
    fullAddress: "",
    latitude: 28.6139,
    longitude: 77.209,
    pincode: "",
    state: "",
    country: "",
    district: "", // Add district field
    isDefault: false, // Add isDefault field
  });

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const scriptLoadedRef = useRef(false);
  const searchInputRef = useRef(null);

  // Use a state to control the current step: 'map' or 'form'
  const [step, setStep] = useState("map");

  // Inject autocomplete styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = autocompleteStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // This is the missing handleChange function
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Initialize form data when editing
  useEffect(() => {
    if (editingAddress) {
      setFormData({
        name: editingAddress.name || "",
        mobileNumber: editingAddress.mobile_no || editingAddress.mobileNumber || "",
        houseNumber: editingAddress.apartment || editingAddress.houseNumber || "",
        landmark: editingAddress.landmark || "",
        addressType: editingAddress.address_type || editingAddress.addressType || "Home",
        fullAddress: editingAddress.street_address || editingAddress.fullAddress || "",
        latitude: editingAddress.address_lat || editingAddress.latitude || editingAddress.coordinates?.latitude || 28.6139,
        longitude: editingAddress.address_lng || editingAddress.longitude || editingAddress.coordinates?.longitude || 77.209,
        pincode: editingAddress.pincode || "",
        state: editingAddress.state || "",
        country: editingAddress.country || "",
        district: editingAddress.district || "",
        isDefault: editingAddress.is_default || false,
      });
    }
  }, [editingAddress]);

  // Fetch state and district based on pincode
  useEffect(() => {
    const fetchStateDistrict = async () => {
      if (formData.pincode) {
        try {
          const response = await getStateDistrict({ pincode: formData.pincode });
          const data = response?.data?.return_data?.[0]; // Access the first object in the array
          if (data) {
            setFormData((prev) => ({
              ...prev,
              state: data.state || "",
              country: data.country || "",
              district: data.district || "", // Set the district from the API response
            }));
          } else {
            console.error("No data found for the provided pincode.");
          }
        } catch (error) {
          console.error("Failed to fetch state and district:", error);
        }
      }
    };

    fetchStateDistrict();
  }, [formData.pincode]);

  useEffect(() => {
    if (!open) {
      setStep("map"); // Reset to map step when dialog closes
      
      // Reset form data when dialog closes (unless editing)
      if (!editingAddress) {
        setFormData({
          name: "",
          mobileNumber: "",
          houseNumber: "",
          landmark: "",
          addressType: "Home",
          fullAddress: "",
          latitude: 28.6139,
          longitude: 77.209,
          pincode: "",
          state: "",
          country: "",
          district: "",
          isDefault: false,
        });
        
        // Reset map state
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat: 28.6139, lng: 77.209 });
          mapInstanceRef.current.setZoom(20);
        }
        if (markerRef.current) {
          markerRef.current.setPosition({ lat: 28.6139, lng: 77.209 });
        }
      }
      return;
    }

    // If editing an address, ensure we have the correct coordinates
    if (editingAddress && editingAddress.address_lat && editingAddress.address_lng) {
      setFormData(prev => ({
        ...prev,
        latitude: editingAddress.address_lat,
        longitude: editingAddress.address_lng,
      }));
    }

    // Existing Google Maps script loading logic remains the same
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsMapLoaded(true);
        return;
      }

      if (scriptLoadedRef.current) {
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkLoaded);
            setIsMapLoaded(true);
          }
        }, 100);
        return;
      }

      scriptLoadedRef.current = true;
      const googleMapsApiKey = "AIzaSyBlW9lsqtBx5sIWX0I_Cwq-YWpcvXVzXCE";

      if (!googleMapsApiKey) {
        setMapError("Google Maps API key is required");
        setShowApiKeyInput(true);
        scriptLoadedRef.current = false;
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google && window.google.maps) {
          setIsMapLoaded(true);
          setMapError(null);
          setShowApiKeyInput(false);
        } else {
          setMapError("Google Maps API failed to initialize");
        }
      };
      script.onerror = () => {
        setMapError("Failed to load Google Maps. Please check your API key.");
        setShowApiKeyInput(true);
        scriptLoadedRef.current = false;
      };
      document.head.appendChild(script);
    };

    if (step === "map") {
      loadGoogleMaps();
    }
  }, [open, apiKey, step]);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      scriptLoadedRef.current = false;
      setMapError(null);
      setIsMapLoaded(false);
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }
      const loadEvent = new Event("load");
      window.dispatchEvent(loadEvent);
    }
  };

  useEffect(() => {
    if (isMapLoaded && mapRef.current && open && !mapInstanceRef.current && step === "map") {
      initializeMap();
    }
  }, [isMapLoaded, open, step, editingAddress]);

  // Ensure map is visible when step changes to map
  useEffect(() => {
    if (step === "map" && mapInstanceRef.current && open) {
      // Force map to redraw when step changes to map
      setTimeout(() => {
        if (mapInstanceRef.current) {
          window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
        }
      }, 100);
    }
  }, [step, open]);

  // Only center map on editing address coordinates when first opening (not when user changes location)
  useEffect(() => {
    if (editingAddress && mapInstanceRef.current && markerRef.current && 
        editingAddress.address_lat && editingAddress.address_lng && step === "map") {
      // Only do this when first opening the map, not when user has moved the pin
      const lat = editingAddress.address_lat;
      const lng = editingAddress.address_lng;
      
      // Center the map on the editing address
      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(20);
      
      // Update marker position
      markerRef.current.setPosition({ lat, lng });
    }
  }, [editingAddress?.address_lat, editingAddress?.address_lng, step]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      return;
    }

    try {
      // Use the actual coordinates from the address data
      const centerLat = editingAddress?.address_lat || formData.latitude;
      const centerLng = editingAddress?.address_lng || formData.longitude;
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 20, // Maximum zoom level for maximum street-level detail
        mapTypeControl: false, // Disable map type control (no satellite toggle)
        streetViewControl: false, // Disable street view control
        fullscreenControl: false, // Disable fullscreen control
        zoomControl: true, // Keep zoom control for user convenience
        scaleControl: false, // Disable scale control
        tilt: 0, // Ensure map is not tilted for better detail viewing
        gestureHandling: 'greedy', // Better touch handling for mobile
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "on" }] }, // Show POI labels
          { featureType: "transit", elementType: "labels", stylers: [{ visibility: "on" }] }, // Show transit labels
          { featureType: "road", elementType: "geometry", stylers: [{ visibility: "on" }] }, // Show road geometry
          { featureType: "landscape", elementType: "geometry", stylers: [{ visibility: "on" }] }, // Show landscape features
          { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "on" }] }, // Show administrative boundaries
        ],
      });

      const marker = new window.google.maps.Marker({
        position: { lat: centerLat, lng: centerLng },
        map: map,
        draggable: true,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(
              `<svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16C0 24.837 16 40 16 40S32 24.837 32 16C32 7.163 24.837 0 16 0Z" fill="#1976D2"/>
              <circle cx="16" cy="16" r="8" fill="white"/>
              <circle cx="16" cy="16" r="4" fill="#1976D2"/>
            </svg>`,
            ),
          scaledSize: new window.google.maps.Size(32, 40),
          anchor: new window.google.maps.Point(16, 40),
        },
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      marker.addListener("dragend", () => {
        const position = marker.getPosition();
        if (position) {
          const lat = position.lat();
          const lng = position.lng();
          setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
          reverseGeocode(lat, lng);
        }
      });

      map.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        marker.setPosition({ lat, lng });
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        reverseGeocode(lat, lng);
      });

      // If editing an address, don't call getCurrentLocation as we want to stay at the address coordinates
      if (!editingAddress) {
        getCurrentLocation();
      } else {
        // Ensure the map is properly centered on the editing address with a slight delay to ensure proper rendering
        setTimeout(() => {
          map.setCenter({ lat: centerLat, lng: centerLng });
          map.setZoom(20);
        }, 100);
      }

      // Initialize Google Maps Autocomplete for search input
      if (searchInputRef.current && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'IN' }, // Restrict to India
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // Update map and marker
            map.setCenter({ lat, lng });
            map.setZoom(20);
            marker.setPosition({ lat, lng });
            
            // Update form data
            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              fullAddress: place.formatted_address || '',
            }));

            // Get additional details like pincode
            reverseGeocode(lat, lng);
          }
        });
      }
    } catch (error) {
      setMapError("Failed to initialize map");
    }
  };

  const getCurrentLocation = async () => {
    // Always get current location when crosshair button is clicked, regardless of editing mode

    try {
      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation) {
        const { lat, lng, timestamp } = JSON.parse(savedLocation);
        const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        if (isRecent && lat && lng) {
          updateLocationOnMap(lat, lng);
          return;
        }
      }
    } catch (error) {}

    try {
      const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
      if (response.ok) {
        const data = await response.json();
        const lat = Number.parseFloat(data.latitude);
        const lng = Number.parseFloat(data.longitude);
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          saveLocationToStorage(lat, lng);
          updateLocationOnMap(lat, lng);
          return;
        }
      }
    } catch (error) {}

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          saveLocationToStorage(lat, lng);
          updateLocationOnMap(lat, lng);
        },
        (error) => {
          reverseGeocode(formData.latitude, formData.longitude);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
      );
    } else {
      reverseGeocode(formData.latitude, formData.longitude);
    }
  };

  const saveLocationToStorage = (lat, lng) => {
    try {
      const locationData = { lat, lng, timestamp: Date.now() };
      // localStorage.setItem("userLocation", JSON.stringify(locationData));
    } catch (error) {}
  };

  const updateLocationOnMap = (lat, lng) => {
    if (mapInstanceRef.current && markerRef.current) {
      const newPosition = { lat, lng };
      mapInstanceRef.current.setCenter(newPosition);
      markerRef.current.setPosition(newPosition);
      setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      reverseGeocode(lat, lng);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    setIsLoadingAddress(true);
    try {
      const { pincode, fullAddress } = await getPincodeFromCoordinates(lat, lng);

      setFormData((prev) => ({
        ...prev,
        fullAddress,
        latitude: lat,
        longitude: lng,
        pincode,
      }));
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
    } finally {
      setIsLoadingAddress(false);
    }
  };



  const handleProceedToForm = () => {
    if (formData.fullAddress) {
      setStep("form");
    }
  };

  const handleGoBackToMap = () => {
    setStep("map");
    // Force map to reload when going back
    setTimeout(() => {
      if (mapInstanceRef.current) {
        // Force the map to recalculate its size and redraw
        window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
        
        // Re-center the map on the current location (use form data, not original editing address)
        const currentLat = formData.latitude;
        const currentLng = formData.longitude;
        mapInstanceRef.current.setCenter({ lat: currentLat, lng: currentLng });
        mapInstanceRef.current.setZoom(20);
        
        // Ensure marker is visible at current location
        if (markerRef.current) {
          markerRef.current.setPosition({ lat: currentLat, lng: currentLng });
        }
        
        // Force a complete redraw by changing zoom slightly
        const currentZoom = mapInstanceRef.current.getZoom();
        mapInstanceRef.current.setZoom(currentZoom + 0.001);
        setTimeout(() => {
          mapInstanceRef.current.setZoom(currentZoom);
        }, 50);
      }
    }, 150);
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    // Map your local formData to the API schema
    const addressData = {
      address_type: formData.addressType,
      apartment: formData.houseNumber,
      street_address: formData.fullAddress,
      pincode: formData.pincode,
      state: formData.state,
      country: formData.country,
      district: formData.district, // Include district field
      address_lng: formData.longitude,
      address_lat: formData.latitude,
      address_map: formData.fullAddress, // Using fullAddress for map field
      name: formData.name,
      phone: formData.mobileNumber, // Fixed: using 'phone' field name as per API
      is_default: formData.isDefault, // Include is_default field
    };

    try {
      if (editingAddress) {
        const dataToUpdate = {
          ...addressData,
          address_id: editingAddress.address_id,
        };
        await updateAddress(dataToUpdate);
        console.log("Address updated successfully!");
      } else {
        // For adding, add a random integer ID and call the add API
        const dataToAdd = {
          ...addressData,
          address_id: Date.now(), // Use a timestamp for a unique integer ID
        };
        await addNewAddress(dataToAdd);
        console.log("Address added successfully!");
      }

      // After successful API call, call onAddressSelect and close the dialog
      onAddressSelect({
        ...formData,
        coordinates: {
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
      });
      onOpenChange(false);
      // Reset form data if not editing
      if (!editingAddress) {
        setFormData({
          name: "",
          mobileNumber: "",
          houseNumber: "",
          landmark: "",
          addressType: "Home",
          fullAddress: "",
          latitude: 28.6139,
          longitude: 77.209,
          pincode: "",
          state: "",
          country: "",
          district: "",
          isDefault: false,
        });
      }
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6">
        {step === "map" && (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                Find your location on the map. You can drag the pin or search for an address.
              </DialogDescription>
            </DialogHeader>

            <MapSection
              mapRef={mapRef}
              getCurrentLocation={getCurrentLocation}
              mapError={mapError}
              isMapLoaded={isMapLoaded}
              showApiKeyInput={showApiKeyInput}
              apiKey={apiKey}
              setApiKey={setApiKey}
              handleApiKeySubmit={handleApiKeySubmit}
              searchInputRef={searchInputRef}
            />

            <DialogFooter className="pt-4">
              <Button onClick={handleProceedToForm} disabled={!formData.fullAddress || !isMapLoaded}>
                Confirm Location
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Address Details</DialogTitle>
              <DialogDescription className="mt-1">
                <span className="font-medium text-gray-800">Selected:</span> {formData.fullAddress}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Name*
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mobileNumber" className="text-sm font-medium">
                  Mobile Number*
                </Label>
                <Input
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) => handleChange("mobileNumber", e.target.value)}
                  placeholder="Enter your mobile number"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="houseNumber" className="text-sm font-medium">
                  House/Flat Number*
                </Label>
                <Input
                  id="houseNumber"
                  value={formData.houseNumber}
                  onChange={(e) => handleChange("houseNumber", e.target.value)}
                  placeholder="Enter house/flat number"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="pincode" className="text-sm font-medium">
                  Pincode*
                </Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  placeholder="Enter pincode"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-sm font-medium">
                  State
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  disabled
                  className="mt-1 bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-sm font-medium">
                  Country
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  disabled
                  className="mt-1 bg-gray-100"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => handleChange("isDefault", checked)}
                />
                <Label htmlFor="isDefault" className="text-sm font-medium">
                  Set as default address
                </Label>
              </div>
              <div>
                <Label className="text-sm font-medium">Save as</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={formData.addressType === "Home" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange("addressType", "Home")}
                    className="flex-1"
                  >
                    Home
                  </Button>
                  <Button
                    type="button"
                    variant={formData.addressType === "Work" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange("addressType", "Work")}
                    className="flex-1"
                  >
                    Work
                  </Button>
                  <Button
                    type="button"
                    variant={formData.addressType === "Other" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange("addressType", "Other")}
                    className="flex-1"
                  >
                    Other
                  </Button>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoBackToMap}
                >
                  Go Back to Map
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.houseNumber || !formData.name || !formData.pincode}
                >
                  {editingAddress ? "Update Address" : "Save Address"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}