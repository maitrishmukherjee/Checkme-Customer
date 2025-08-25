const GOOGLE_MAPS_API_KEY = "AIzaSyBlW9lsqtBx5sIWX0I_Cwq-YWpcvXVzXCE";

export async function getPincodeFromCoordinates(latitude, longitude) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is missing.");
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch geocoding data.");
    }

    const data = await response.json();
    
    // Check if any results were returned
    if (data.status !== "OK" || !data.results.length) {
        console.warn("No geocoding results found.");
        return { pincode: "Unknown Pincode", city: "Unknown City", fullAddress: "Unknown Address" };
    }

    // Iterate through all results to find the most specific address with a postal code
    let pincode = "Unknown Pincode";
    let city = "Unknown City";
    let fullAddress = data.results[0]?.formatted_address || "Unknown Address";

    for (const result of data.results) {
      const addressComponents = result.address_components || [];
      const postalCodeComponent = addressComponents.find((component) =>
        component.types.includes("postal_code")
      );
      
      // If a postal code is found, use this result's data and break the loop
      if (postalCodeComponent) {
        pincode = postalCodeComponent.long_name;
        
        const cityComponent = addressComponents.find((component) =>
            component.types.includes("locality") || component.types.includes("administrative_area_level_2")
        );
        city = cityComponent?.long_name || "Unknown City";
        fullAddress = result.formatted_address;
        break; // Exit the loop once a pincode is found
      }
    }

    return { pincode, city, fullAddress };
    
  } catch (error) {
    console.error("Error in getPincodeFromCoordinates:", error);
    return { pincode: "Unknown Pincode", city: "Unknown City", fullAddress: "Unknown Address" };
  }
}
