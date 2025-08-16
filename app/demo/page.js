"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Calendar } from "../../components/ui/calendar"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addDays, isBefore, startOfToday } from "date-fns"
import { useUser } from "../../contexts/user-context"
import { products } from "../../lib/data"
import AddressDialog from "../../components/address-dialog"
import { Stepper } from "../../components/ui/stepper"
import { GarageIcon, PresentationIcon } from "@phosphor-icons/react"
import { Drawer, DrawerContent } from "../../components/ui/drawer"

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [matches, query])
  return matches
}

export default function DemoPage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("product")
  const demoType = searchParams.get("type") || "virtual" // virtual or physical
  const product = productId ? products.find((p) => p.id === Number.parseInt(productId)) : null

  const { user, isAuthenticated, login } = useUser()
  const isDesktop = useMediaQuery("(min-width: 1024px)") // lg breakpoint
  
  const [step, setStep] = useState("address") // address, slots, confirmation
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [showStepsDrawer, setShowStepsDrawer] = useState(false)

  // Define steps for the stepper
  const steps = [
    { id: "address", title: "Address", subtitle: "Select Address" },
    { id: "slots", title: "Date & Time", subtitle: "Choose Slot" },
    { id: "confirmation", title: "Confirm", subtitle: "Book Demo" }
  ]

  // Get current step number for stepper
  const getCurrentStepNumber = () => {
    switch (step) {
      case "address": return 1
      case "slots": return 2
      case "confirmation": return 3
      default: return 1
    }
  }

  // Load addresses from localStorage
  useEffect(() => {
    const savedAddresses = localStorage.getItem("userAddresses")
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses))
    }
  }, [])

  // Save addresses to localStorage
  useEffect(() => {
    if (addresses.length > 0) {
      localStorage.setItem("userAddresses", JSON.stringify(addresses))
    }
  }, [addresses])

  // Auto-open drawer on mobile/tablet
  useEffect(() => {
    // Only auto-open if we're definitely on mobile/tablet
    // isDesktop will be undefined initially, then true/false after evaluation
    if (isDesktop === false) {
      setShowStepsDrawer(true)
    } else if (isDesktop === true) {
      setShowStepsDrawer(false)
    }
  }, [isDesktop])

  const timeSlots = [
    "8:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM", 
    "12:00 PM - 2:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
    "6:00 PM - 8:00 PM"
  ]

  const handleMobileSubmit = () => {
    if (mobileNumber.length === 10) {
      setShowOtpInput(true)
    }
  }

  const handleOtpSubmit = () => {
    if (otp === "1111") { // Hardcoded OTP
      setIsOtpVerified(true)
      // Create or update user with mobile number
      const userData = {
        ...user,
        mobile: mobileNumber,
        name: user?.name || "User"
      }
      login(userData)
      setStep("address")
    } else {
      alert("Invalid OTP. Please try again.")
    }
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address)
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setShowAddressDialog(true)
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setShowAddressDialog(true)
  }

  const handleSaveAddress = (addressData) => {
    if (editingAddress) {
      // Edit existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id ? { ...addressData, id: addr.id } : addr
      ))
    } else {
      // Add new address
      const newAddress = { ...addressData, id: Date.now() }
      setAddresses(prev => [...prev, newAddress])
    }
    setShowAddressDialog(false)
    setEditingAddress(null)
  }

  const handleContinue = () => {
    if (step === "address" && selectedAddress) {
      setStep("slots")
    } else if (step === "slots" && selectedDate && selectedTimeSlot) {
      setStep("confirmation")
    }
  }

  const canContinue = () => {
    switch (step) {
      case "address":
        return isAuthenticated && selectedAddress !== null
      case "slots":
        return selectedDate !== null && selectedTimeSlot !== ""
      default:
        return false
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case "address":
        return ""
      case "slots":
        return "Select Date & Time"
      case "confirmation":
        return "Confirm Booking"
      default:
        return "Book Demo"
    }
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The requested product could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step content component to avoid duplication
  const StepContent = () => (
    <div className="space-y-6 pb-5">
      {/* Step 1: Address Selection */}
      {step === "address" && (
        <div className="space-y-6">
          {!isAuthenticated ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    maxLength={10}
                    className="flex-1"
                  />
                  <Button onClick={handleMobileSubmit} disabled={mobileNumber.length !== 10}>
                    Continue
                  </Button>
                </div>
              </div>

              {showOtpInput && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="otp">Enter OTP *</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={4}
                        className="flex-1"
                      />
                      <Button onClick={handleOtpSubmit} disabled={otp.length !== 4}>
                        Verify OTP
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Use OTP: 1111</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Select Address</h3>
                <Button onClick={handleAddAddress} variant="outline">
                  + Add New Address
                </Button>
              </div>

              {addresses.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {addresses.map((address) => (
                    <div
                      key={address.houseNumber}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddress?.id === address.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleAddressSelect(address)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">{address.addressType}</span>
                            {selectedAddress?.id === address.id && (
                              <Check className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <p className="font-medium">{address.name}</p>
                          <p className="text-sm text-gray-600">{address.houseNumber}, {address.fullAddress}</p>
                          {address.landmark && (
                            <p className="text-sm text-gray-500">Near: {address.landmark}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditAddress(address)
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No addresses saved yet</p>
                  <Button onClick={handleAddAddress}>Add Your First Address</Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Date and Time Selection */}
      {step === "slots" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Date Selection */}
            <div>
              <Label className="text-base font-medium mb-4 block">Select Date</Label>
                <Input
                  type="date"
                  value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value)
                    setSelectedDate(date)
                  }}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full"
                />
              <p className="text-sm text-gray-500 mt-2">Available dates: Next 7 days</p>
            </div>

            {/* Time Slot Selection */}
            <div>
              <Label className="text-base font-medium mb-4 block">Select Time Slot</Label>
              <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === "confirmation" && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Demo Booking Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Product:</span>
                <span>{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Demo Type:</span>
                <span>{demoType === 'virtual' ? 'Virtual Demo' : 'Physical Demo'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{selectedDate ? format(selectedDate, 'PPP') : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span>{selectedTimeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Address:</span>
                <span className="text-right max-w-xs">
                  {selectedAddress?.name}, {selectedAddress?.houseNumber}, {selectedAddress?.fullAddress}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              We'll send you a confirmation email and SMS with further details.
            </p>
          </div>
        </div>
      )}

      {/* Continue Button */}
      {step !== "confirmation" && (
        <div className="flex justify-between items-center pt-0 lg:pt-6">
          {step !== "address" && (
            <Button onClick={() => setStep(step === "slots" ? "address" : "slots")}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {step === "address" && <div></div>}
          <Button onClick={handleContinue} disabled={!canContinue()}>
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Confirm Booking Button for Confirmation Step */}
      {step === "confirmation" && (
        <div className="flex justify-between items-center pt-0 lg:pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep("slots")}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button className="px-8">
            Confirm Booking
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-0 lg:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with product info and steps */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-12">
          {/* Left side - Product Image */}
          <div className="relative flex flex-col items-center py-5 lg:py-0 lg:col-span-1">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-3 mb-4 mt-4 ">
              <img
                src={product.brandLogo || "/placeholder.svg"}
                alt={product.brandName}
                className="w-12 h-12 rounded-full object-contain"
              />
              <div>
                <span className="text-xl font-bold text-gray-900">{product.name}</span>
              </div>
            </div>
          </div>

          {/* Right side - Product Info, Steps, and Step Content */}
          <div className="space-y-6 lg:col-span-2">
            <div>
              {/* Demo Type Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Demo Type Selected:</h3>
                <div className="flex items-center gap-2">
                  <div>{demoType === 'virtual' ? <PresentationIcon size={20} /> : <GarageIcon size={20} />}</div>
                  <span className="font-medium text-blue-800">
                    {demoType === 'virtual' ? 'Virtual Demo' : 'Physical Demo'}
                  </span>
                </div>
              </div>

              {/* Desktop Step Content */}
              <div className="hidden lg:block">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{getStepTitle()}</h3>
                  </div>
                  <StepContent />
                </div>
              </div>

              {/* Mobile/Tablet - Button to open steps drawer */}
              <div className="lg:hidden">
                <Button 
                  onClick={() => setShowStepsDrawer(true)} 
                  className="w-full"
                  size="lg"
                >
                  Start Booking Demo
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Steps Drawer */}
        <Drawer open={showStepsDrawer} onOpenChange={setShowStepsDrawer}>
          <DrawerContent className="px-4">
            <div className="space-y-2 lg:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Book Demo</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowStepsDrawer(false)}
                >
                  ✕
                </Button>
              </div>
              
              {/* Steps */}
              <div className="mb-0 lg:mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Steps</h3>
                <Stepper steps={steps} currentStep={getCurrentStepNumber()} />
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg px-6">
                <div className="flex items-center pt-4 gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{getStepTitle()}</h3>
                </div>
                <StepContent />
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Address Dialog */}
        {showAddressDialog && (
          <AddressDialog
            open={showAddressDialog}
            onOpenChange={setShowAddressDialog}
            onAddressSelect={handleSaveAddress}
            editingAddress={editingAddress}
            title={editingAddress ? "Edit Address" : "Add New Address"}
          />
        )}
      </div>
    </div>
  )
}
