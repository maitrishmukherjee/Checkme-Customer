"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { useUser } from "../../contexts/user-context"
import AddressDialog from "../../components/address-dialog"
import { Stepper } from "../../components/ui/stepper"
import { GarageIcon, HouseIcon, PresentationIcon } from "@phosphor-icons/react"
import { Drawer, DrawerContent } from "../../components/ui/drawer"
import { addNewAddress, getAddresses, getStateDistrict, updateAddress, getProductInfo, getAvailableVirtualSlots } from "@/lib/api"
import StepContent from "../../components/StepContent"

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
  const demoType = searchParams.get("type")  
  const { user, isAuthenticated, login, accessToken } = useUser()  
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState("address") 
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [districts, setDistricts] = useState([])
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [showStepsDrawer, setShowStepsDrawer] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Define steps for the stepper based on demo type
  const getSteps = () => {
    if (demoType === 'virtual') {
      return [
        { id: "slots", title: "Date & Time", subtitle: "Choose Slot" },
        { id: "confirmation", title: "Confirm", subtitle: "Book Demo" }
      ]
    }
    return [
      { id: "address", title: "Address", subtitle: "Select Address" },
      { id: "slots", title: "Date & Time", subtitle: "Choose Slot" },
      { id: "confirmation", title: "Confirm", subtitle: "Book Demo" }
    ]
  }

  const steps = getSteps()

  // Get current step number for stepper
  const getCurrentStepNumber = () => {
    if (demoType === 'virtual') {
      switch (step) {
        case "slots": return 1
        case "confirmation": return 2
        default: return 1
      }
    }
    switch (step) {
      case "address": return 1
      case "slots": return 2
      case "confirmation": return 3
      default: return 1
    }
  }

  // Set initial step based on demo type
  useEffect(() => {
    if (demoType === 'virtual') {
      setStep("slots")
      console.log("Virtual demo initialized - starting with slots step")
    } else {
      setStep("address")
      console.log("Physical demo initialized - starting with address step")
    }
  }, [demoType])

  // Fetch available slots for virtual demo
  const fetchAvailableSlots = async (date) => {
    if (demoType === 'virtual' && productId && date) {
      try {
        setIsLoadingSlots(true)
        const formattedDate = format(date, "yyyy-MM-dd")
        console.log("Fetching slots for:", { productId, formattedDate })
        
        const { data } = await getAvailableVirtualSlots({ 
          productid: productId, 
          demo_date: formattedDate 
        })
        
        console.log("Slots API response:", data)
        
        if (data.status_code === 0) {
          setAvailableSlots(data.return_data)
        } else {
          console.error("Error fetching slots:", data.status_msg)
          setAvailableSlots([])
        }
      } catch (error) {
        console.error("Error fetching available slots:", error)
        setAvailableSlots([])
      } finally {
        setIsLoadingSlots(false)
      }
    } else {
      console.log("Missing required params for fetching slots:", { demoType, productId, date })
    }
  }

  useEffect(() => {
    async function fetchProduct() {
      if (productId) {
        try {
          setIsLoading(true)
          console.log("Fetching product with ID:", productId)
          const { data } = await getProductInfo({ productid: productId })
          console.log("API response:", data)
          
          const mapped = (() => {
            const raw = data.return_data[0]
            if (!raw) {
              console.log("No product data found in API response")
              return null
            }
            
            const id = raw?.product_id
            const name = raw?.product_name
            const image = raw?.product_image
            const brandLogo = raw?.brand_logo
            const brandName = raw?.brand_name
            const price = Number(raw?.base_price)
            const discountedPrice = Number(raw?.sale_price)
            const description = raw?.product_description
            
            console.log("Mapped product:", { id, name, image, brandLogo, brandName, price, discountedPrice, description })
            
            return { 
              id, 
              name, 
              image, 
              brandLogo, 
              brandName,
              price, 
              discountedPrice, 
              description 
            }
          })()
          setProduct(mapped)
        } catch (err) {
          console.error("Error fetching product:", err)
          setProduct(null)
        } finally {
          setIsLoading(false)
        }
      } else {
        console.log("No product ID provided")
        setIsLoading(false)
      }
    }

    async function fetchAddresses() {
      if (accessToken) {
        const data = await getAddresses(accessToken)
        setAddresses(data.data.return_data)
      }
    }

    async function fetchDistricts() {
      const data = await getStateDistrict()
      setDistricts(data)
    }

    fetchProduct()
    fetchAddresses()
    fetchDistricts()
  }, [productId, accessToken])

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
    if (otp === "123456") { // Hardcoded OTP
      setIsOtpVerified(true)
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

const handleSaveAddress = async (addressData) => {
  console.log('inside save address')
  if (editingAddress) {
    await updateAddress(editingAddress.id, addressData);
    const updatedAddresses = await getAddresses();
    setAddresses(updatedAddresses.return_data);
  } else {
    const newAddress = { ...addressData, id: Date.now() }; 
    addNewAddress(newAddress);
    const updatedAddresses = await getAddresses();
    console.log(updatedAddresses?.data?.return_data)
    setAddresses(updatedAddresses?.data?.return_data);
  }
  setShowAddressDialog(false);
  setEditingAddress(null);
};

  const handleContinue = () => {
    if (demoType === 'virtual') {
      if (step === "slots" && selectedDate && selectedTimeSlot) {
        setStep("confirmation")
      }
    } else {
      if (step === "address" && selectedAddress) {
        setStep("slots")
      } else if (step === "slots" && selectedDate && selectedTimeSlot) {
        setStep("confirmation")
      }
    }
  }

  const canContinue = () => {
    if (demoType === 'virtual') {
      switch (step) {
        case "slots":
          return selectedDate !== null && selectedTimeSlot !== ""
        default:
          return false
      }
    }
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-4">Loading Product...</h1>
            <p className="text-gray-600 mb-6">Please wait while we fetch the product details.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The requested product could not be found in our system.</p>
            <Button asChild className="mt-4">
              <a href="/products">Browse Products</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-0 lg:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with product info and steps */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-12">
          {/* Left side - Product Image */}
          <div className="relative flex flex-col items-center py-5 lg:py-0 lg:col-span-1">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.image || "/placeholder.jpg"}
                alt={product.name || "Product"}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder.jpg"
                }}
              />
            </div>
            <div className="flex items-center gap-3 mb-4 mt-4 ">
              <img
                src={product.brandLogo || "/placeholder.svg"}
                alt={product.brandName || "Brand"}
                className="w-12 h-12 rounded-full object-contain"
              />
              <div>
                <span className="text-xl font-bold text-gray-900">{product.name}</span>
                {product.brandName && (
                  <p className="text-sm text-gray-600 mt-1">{product.brandName}</p>
                )}
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
                  <StepContent
                    step={step}
                    demoType={demoType}
                    isAuthenticated={isAuthenticated}
                    mobileNumber={mobileNumber}
                    setMobileNumber={setMobileNumber}
                    showOtpInput={showOtpInput}
                    otp={otp}
                    setOtp={setOtp}
                    handleMobileSubmit={handleMobileSubmit}
                    handleOtpSubmit={handleOtpSubmit}
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    handleAddressSelect={handleAddressSelect}
                    handleAddAddress={handleAddAddress}
                    handleEditAddress={handleEditAddress}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedTimeSlot={selectedTimeSlot}
                    setSelectedTimeSlot={setSelectedTimeSlot}
                    timeSlots={timeSlots}
                    availableSlots={availableSlots}
                    isLoadingSlots={isLoadingSlots}
                    fetchAvailableSlots={fetchAvailableSlots}
                    canContinue={canContinue}
                    handleContinue={handleContinue}
                    product={product}
                  />
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
            <div className="space-y-2 lg:space-y-6 overflow-y-auto">
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
                <StepContent
                  step={step}
                  demoType={demoType}
                  isAuthenticated={isAuthenticated}
                  mobileNumber={mobileNumber}
                  setMobileNumber={setMobileNumber}
                  showOtpInput={showOtpInput}
                  otp={otp}
                  setOtp={setOtp}
                  handleMobileSubmit={handleMobileSubmit}
                  handleOtpSubmit={handleOtpSubmit}
                  addresses={addresses}
                  selectedAddress={selectedAddress}
                  handleAddressSelect={handleAddressSelect}
                  handleAddAddress={handleAddAddress}
                  handleEditAddress={handleEditAddress}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  setSelectedTimeSlot={setSelectedTimeSlot}
                  timeSlots={timeSlots}
                  availableSlots={availableSlots}
                  isLoadingSlots={isLoadingSlots}
                  fetchAvailableSlots={fetchAvailableSlots}
                  canContinue={canContinue}
                  handleContinue={handleContinue}
                  product={product}
                />
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
            districts={districts}
          />
        )}
      </div>
    </div>
  )
}
              