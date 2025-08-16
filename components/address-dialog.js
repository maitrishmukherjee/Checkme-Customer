"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Search, Crosshair } from "lucide-react"

// A helper component to render the map and its controls
const MapSection = ({
  mapRef,
  searchQuery,
  setSearchQuery,
  handleSearch,
  getCurrentLocation,
  mapError,
  isMapLoaded,
  showApiKeyInput,
  apiKey,
  setApiKey,
  handleApiKeySubmit,
}) => (
  <div className="relative h-[400px] w-full">
    <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search for area, street name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="pl-10 bg-white shadow-md"
        />
      </div>
      <Button onClick={handleSearch} size="sm" className="shadow-md">
        Search
      </Button>
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
    houseNumber: "",
    landmark: "",
    addressType: "Home",
    fullAddress: "",
    latitude: 28.6139,
    longitude: 77.209,
  });

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapError, setMapError] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  // Use a state to control the current step: 'map' or 'form'
  const [step, setStep] = useState("map");

  // Initialize form data when editing
  useEffect(() => {
    if (editingAddress) {
      setFormData({
        name: editingAddress.name || "",
        houseNumber: editingAddress.houseNumber || "",
        landmark: editingAddress.landmark || "",
        addressType: editingAddress.addressType || "Home",
        fullAddress: editingAddress.fullAddress || "",
        latitude: editingAddress.latitude || editingAddress.coordinates?.latitude || 28.6139,
        longitude: editingAddress.longitude || editingAddress.coordinates?.longitude || 77.209,
      });
    }
  }, [editingAddress]);

  useEffect(() => {
    if (!open) {
      setStep("map"); // Reset to map step when dialog closes
      return;
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
      const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyBlW9lsqtBx5sIWX0I_Cwq-YWpcvXVzXCE";

      if (!googleMapsApiKey || googleMapsApiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
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
  }, [isMapLoaded, open, step]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      return;
    }

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: formData.latitude, lng: formData.longitude },
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
      });

      const marker = new window.google.maps.Marker({
        position: { lat: formData.latitude, lng: formData.longitude },
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

      getCurrentLocation();
    } catch (error) {
      setMapError("Failed to initialize map");
    }
  };

  // ... (rest of your existing functions like getCurrentLocation, saveLocationToStorage, etc. are unchanged)
  const getCurrentLocation = async () => {
    try {
      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation) {
        const { lat, lng, timestamp } = JSON.parse(savedLocation);
        const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        if (isRecent && lat && lng) {
          updateLocationOnMap(lat, lng);
          return;
        } 
        // else {
        //   localStorage.removeItem("userLocation");
        // }
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
    if (!window.google || !window.google.maps) return;
    setIsLoadingAddress(true);
    const geocoder = new window.google.maps.Geocoder();
    try {
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK") resolve(results);
          else reject(status);
        });
      });
      const results = response;
      if (results && results[0]) {
        const address = results[0].formatted_address;
        setFormData((prev) => ({ ...prev, fullAddress: address, latitude: lat, longitude: lng }));
      }
    } catch (error) {
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleSearch = () => {
    if (!window.google || !window.google.maps || !searchQuery.trim()) return;
    const service = new window.google.maps.places.PlacesService(mapInstanceRef.current);
    const request = { query: searchQuery, fields: ["name", "geometry", "formatted_address"] };
    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
        const place = results[0];
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        if (mapInstanceRef.current && markerRef.current) {
          const newPosition = { lat, lng };
          mapInstanceRef.current.setCenter(newPosition);
          markerRef.current.setPosition(newPosition);
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            fullAddress: place.formatted_address || searchQuery,
          }));
        }
      }
    });
  };

  const handleProceedToForm = () => {
    if (formData.fullAddress) {
      setStep("form");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddressSelect({
      ...formData,
      coordinates: {
        latitude: formData.latitude,
        longitude: formData.longitude,
      },
    });
    onOpenChange(false);
    // Reset form data only if not editing
    if (!editingAddress) {
      setFormData({
        name: "",
        houseNumber: "",
        landmark: "",
        addressType: "Home",
        fullAddress: "",
        latitude: 28.6139,
        longitude: 77.209,
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              getCurrentLocation={getCurrentLocation}
              mapError={mapError}
              isMapLoaded={isMapLoaded}
              showApiKeyInput={showApiKeyInput}
              apiKey={apiKey}
              setApiKey={setApiKey}
              handleApiKeySubmit={handleApiKeySubmit}
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
                <Label htmlFor="landmark" className="text-sm font-medium">
                  Landmark (Optional)
                </Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
                  onChange={(e) => handleChange("landmark", e.target.value)}
                  placeholder="Any nearby landmark"
                  className="mt-1"
                />
              </div>
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
                  onClick={() => setStep("map")}
                >
                  Go Back to Map
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.houseNumber || !formData.name}
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