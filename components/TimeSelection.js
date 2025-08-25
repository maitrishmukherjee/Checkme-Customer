"use client";

import { Check } from "lucide-react";

export default function TimeSelection({ 
  demoType, 
  selectedDate, 
  selectedTimeSlot, 
  setSelectedTimeSlot, 
  availableSlots, 
  isLoadingSlots, 
  timeSlots 
}) {
  // Convert physical demo time slots to match virtual demo format
  const getPhysicalTimeSlots = () => {
    return timeSlots.map((slot, index) => ({
      time_slot_id: `physical_${index}`,
      time: slot,
      available: true,
      available_count: 1
    }));
  };

  const displaySlots = demoType === "virtual" ? availableSlots : getPhysicalTimeSlots();

  if (demoType === "virtual") {
    // Virtual demo: Show available slots from API
    if (!selectedDate) {
      return (
        <div className="text-center py-6 sm:py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-8 h-8 sm:w-12 sm:h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-gray-500 px-4">
            Please select a date first to see available time slots
          </p>
        </div>
      );
    }

    if (isLoadingSlots) {
      return (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading available slots...</p>
        </div>
      );
    }
  }

  if (displaySlots.length > 0) {
    return (
      <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-2">
        {displaySlots.map((slot) => (
          <div
            key={slot.time_slot_id}
            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
              slot.available
                ? selectedTimeSlot === slot.time_slot_id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
                : "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
            }`}
            onClick={() => {
              if (slot.available) {
                setSelectedTimeSlot(slot.time_slot_id)
              }
            }}
          >
            <div className="flex justify-between items-center">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">{slot.time}</p>
                {demoType === "virtual" && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    Available: {slot.available_count} slot{slot.available_count !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              {slot.available && selectedTimeSlot === slot.time_slot_id && (
                <Check className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (demoType === "virtual") {
    return (
      <div className="text-center py-6 sm:py-8 border-2 border-dashed border-gray-200 rounded-lg">
        <div className="text-gray-400 mb-2">
          <svg
            className="w-8 h-8 sm:w-12 sm:h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm sm:text-base text-gray-500 px-4">No slots available for this date</p>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 px-4">Try selecting a different date</p>
      </div>
    );
  }

  return null;
}
