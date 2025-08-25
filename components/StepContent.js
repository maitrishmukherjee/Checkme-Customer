"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { HouseIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import DateSelection from "./DateSelection";
import TimeSelection from "./TimeSelection";

export default function StepContent({
  step,
  demoType,
  isAuthenticated,
  mobileNumber,
  setMobileNumber,
  showOtpInput,
  otp,
  setOtp,
  handleMobileSubmit,
  handleOtpSubmit,
  addresses,
  selectedAddress,
  handleAddressSelect,
  handleAddAddress,
  handleEditAddress,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  timeSlots,
  availableSlots,
  isLoadingSlots,
  fetchAvailableSlots,
  canContinue,
  handleContinue,
  product,
}) {
  // Handle date change for virtual demo
  const handleDateChange = (date) => {
    setSelectedDate(date)
    setSelectedTimeSlot("") // Reset time slot when date changes
    if (demoType === 'virtual') {
      fetchAvailableSlots(date)
    }
  }

  return (
    <div className="space-y-6 pb-5">
      {/* Step 1: Address Selection (only for physical demo) */}
      {step === "address" && demoType !== 'virtual' && (
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

              {addresses?.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {addresses?.map((address) => (
                    <div
                      key={address.address_id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        address.is_default
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleAddressSelect(address)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm flex gap-1 font-medium text-gray-500 capitalize">
                              <span>
                                {address.address_type === "home" ? <HouseIcon weight="bold" size={18} /> : ""}
                              </span>{" "}
                              <span>{address.address_type}</span>{" "}
                            </p>
                            {selectedAddress?.id === address.address_id && (
                              <Check className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <p className="font-medium">{address.name}</p>
                          <p className="text-sm text-gray-600">
                            {address.apartment}, {address.street_address}, {address.district},{address.state}{" "}
                            {address.postal_code}{" "}
                          </p>
                          <p className="text-sm">
                            Phone Number: <span className="text-gray-600">{address.mobile_no}</span>
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div className="w-full">
              <Label className="text-base font-medium mb-4 block">Select Date</Label>
              <DateSelection 
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                demoType={demoType}
              />
            </div>

            {/* Time Slot Selection */}
            <div className="w-full">
              <Label className="text-base font-medium mb-4 block">Select Time Slot</Label>
              <TimeSelection
                demoType={demoType}
                selectedDate={selectedDate}
                selectedTimeSlot={selectedTimeSlot}
                setSelectedTimeSlot={setSelectedTimeSlot}
                availableSlots={availableSlots}
                isLoadingSlots={isLoadingSlots}
                timeSlots={timeSlots}
              />
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      {step !== "confirmation" && (
        <div className="flex justify-between items-center pt-0 lg:pt-6">
          {step !== "address" && demoType !== 'virtual' && (
            <Button onClick={() => setStep(step === "slots" ? "address" : "slots")}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {step === "address" && demoType !== 'virtual' && <div></div>}
          <Button onClick={handleContinue} disabled={!canContinue()}>
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Confirmation Step */}
      {step === "confirmation" && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-900">Demo Booking Confirmation</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-1 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Demo Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Demo Type:</span>
                      <span className="font-medium">
                        {demoType === 'virtual' ? 'Virtual Demo' : 'Physical Demo'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Not selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {demoType === 'virtual' 
                          ? availableSlots.find(slot => slot.time_slot_id === selectedTimeSlot)?.time || "Not selected"
                          : timeSlots.find((_, index) => `physical_${index}` === selectedTimeSlot) || "Not selected"
                        }
                      </span>
                    </div>
                    {demoType !== 'virtual' && selectedAddress && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium text-right max-w-xs">
                          {selectedAddress.apartment}, {selectedAddress.street_address}, {selectedAddress.district}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product:</span>
                      <span className="font-medium">{product?.name || "Loading..."}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Brand:</span>
                      <span className="font-medium">{product?.brandName || "Loading..."}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">
                        {product ? (
                          product.discountedPrice < product.price ? (
                            <>
                              <span className="line-through text-gray-500 mr-2">₹{product.price}</span>
                              <span className="text-green-600">₹{product.discountedPrice}</span>
                            </>
                          ) : (
                            `₹${product.price}`
                          )
                        ) : (
                          "Loading..."
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Confirmed</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-green-200">
                <p className="text-sm text-green-700">
                  Your demo has been successfully scheduled! You will receive a confirmation email and SMS shortly.
                  {demoType === 'virtual' && ' A meeting link will be shared before the scheduled time.'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button size="lg" className="px-8">
              Book Another Demo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
