"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { HouseIcon } from "@phosphor-icons/react";
import { format } from "date-fns";

export default function StepContent({
  step,
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
  canContinue,
  handleContinue,
}) {
  return (
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
          <div className="grid md:grid-cols-2 gap-8">
            {/* Date Selection */}
            <div>
              <Label className="text-base font-medium mb-4 block">Select Date</Label>
              <Input
                type="date"
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setSelectedDate(date);
                }}
                min={format(new Date(), "yyyy-MM-dd")}
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
    </div>
  );
}
