"use client";

import { format, addDays, isSameDay } from "date-fns";

export default function DateSelection({ selectedDate, onDateChange, demoType }) {
  return (
    <div className="space-y-3">
      <div className="w-full overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(new Date(), i + 1)
            const isSelected = selectedDate && isSameDay(selectedDate, date)
            return (
              <div
                key={i}
                className={`flex-shrink-0 w-16 sm:w-20 h-20 sm:h-24 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onDateChange(date)}
              >
                <div className="h-full flex flex-col items-center justify-center p-1 sm:p-2">
                  <div className="text-xs text-gray-500 uppercase">{format(date, "EEE")}</div>
                  <div
                    className={`text-base sm:text-lg font-bold ${isSelected ? "text-blue-600" : "text-gray-900"}`}
                  >
                    {format(date, "d")}
                  </div>
                  <div className="text-xs text-gray-500">{format(date, "MMM")}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <p className="text-sm text-gray-500">Select a date to see available time slots</p>
    </div>
  );
}
