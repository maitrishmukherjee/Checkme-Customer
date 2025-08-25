"use client";

import Link from "next/link";
import {
  Search,
  User,
  ShoppingCart,
  Moon,
  Sun,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useCart } from "../contexts/cart-context";
import { useUser } from "../contexts/user-context";
import { useTheme } from "../contexts/theme-context";
import { useState, useEffect } from "react";
import Image from "next/image";
import { popularCities } from "@/lib/data";
import { CheckIcon, MapPinLineIcon } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getPincodeFromCoordinates } from "@/lib/geocoding";

export default function Navigation() {
  const { getCartItemsCount } = useCart();
  const { user, isAuthenticated } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState(""); // Add state for pincode
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const cartItemsCount = getCartItemsCount();

  // Load saved location on component mount
  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    setIsLoadingLocation(true);

    const savedLocation = localStorage.getItem("userLocation");
    const savedPincode = localStorage.getItem("userPincode");
    if (savedLocation && savedPincode) {
      setLocation(savedLocation);
      setPincode(savedPincode);
      setIsLoadingLocation(false);
      return;
    }

    try {
      const geoJSResponse = await fetch("https://get.geojs.io/v1/ip/geo.json");
      if (geoJSResponse.ok) {
        const geoData = await geoJSResponse.json();
        const { latitude, longitude } = geoData;

        const { pincode, city } = await getPincodeFromCoordinates(
          latitude,
          longitude
        );

        if (pincode) {
          setLocation(city || "Unknown Location");
          setPincode(pincode);
          localStorage.setItem("userLocation", city);
          localStorage.setItem("userPincode", pincode);
        } else {
          console.warn("Pincode could not be resolved. Using fallback values.");
          setLocation("Unknown Location");
          setPincode("Unknown Pincode");
        }
      } else {
        console.error("GeoJS API failed to fetch location.");
        setLocation("Location unavailable");
        setPincode("Pincode unavailable");
      }
    } catch (error) {
      console.error("Failed to fetch location:", error);
      setLocation("Location unavailable");
      setPincode("Pincode unavailable");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleLocationSelect = (selectedCity) => {
    setLocation(selectedCity);
    localStorage.setItem("userLocation", selectedCity);
    setShowLocationDropdown(false);
  };

  const handleLocationRefresh = () => {
    localStorage.removeItem("userLocation");
    setLocation("");
    loadSavedLocation();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  const filteredCities = popularCities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="border-b bg-background max-w-6xl mx-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-row gap-10 items-center">
            <Link href="/" className="text-xl font-bold">
              <Image
                src="/checkme-web.gif"
                alt="checkme"
                width={120}
                height={120}
                className="block lg:hidden"
              />
              <Image
                src="/checkme-web.gif"
                alt="checkme"
                width={180}
                height={180}
                className="hidden lg:block"
              />
            </Link>

            <div className="flex items-center gap-2 relative">
              <MapPinLineIcon className="text-[#fd6c4d]" size={25} />
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-sm font-medium hover:bg-accent"
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                >
                  {isLoadingLocation ? (
                    <span className="text-muted-foreground">
                      Detecting location...
                    </span>
                  ) : (
                    <span className="text-foreground">
                      {location || "Select location"}{" "}
                      {pincode && `(${pincode})`}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3" />
                </Button>

                {/* Location Dropdown */}
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">
                          Select Your Location
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLocationRefresh}
                          className="text-xs"
                        >
                          Detect Again
                        </Button>
                      </div>
                      <Input
                        placeholder="Search cities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {(searchQuery
                        ? filteredCities
                        : popularCities.slice(0, 20)
                      ).map((city) => (
                        <button
                          key={city}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
                          onClick={() => handleLocationSelect(city)}
                        >
                          <div className="flex items-center gap-2">
                            <MapPinLineIcon size={18} />

                            <span>{city}</span>
                          </div>
                        </button>
                      ))}

                      {searchQuery && filteredCities.length === 0 && (
                        <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                          No cities found matching "{searchQuery}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link href="/profile" className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium flex items-center gap-1">
                    {user?.name}
                    
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {user?.email}
                    
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="relative">
                  {user?.picture ? (
                    <Avatar>
                      <AvatarImage
                        className="w-8 h-8 rounded-full"
                        src={user?.picture}
                        alt="user"
                      />
                      <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="flex items-center">
                <span>Login/SignUp</span>
                <Button variant="ghost" size="icon">
                  
                  <User className="w-6 h-6" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Location Display */}
        {/* <div className="lg:hidden mt-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-sm font-medium hover:bg-accent p-2"
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            {isLoadingLocation ? (
              <span className="text-muted-foreground">
                Detecting location...
              </span>
            ) : (
              <span className="text-foreground">
                {location || "Select location"}
              </span>
            )}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div> */}
      </div>

      {/* Click outside to close dropdown */}
      {showLocationDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLocationDropdown(false)}
        />
      )}
    </header>
  );
}

