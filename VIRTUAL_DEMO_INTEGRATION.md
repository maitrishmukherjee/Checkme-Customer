# Virtual Demo Integration

This document describes the integration of the virtual demo API for the CheckMe customer application.

## Overview

The virtual demo integration allows users to book virtual demos without requiring address selection. Instead, users directly select a date and time slot from available options provided by the API.

## API Integration

### Endpoint
- **URL**: `/demo/slots/available_vs`
- **Method**: GET
- **Parameters**:
  - `productid`: Product ID (integer)
  - `demo_date`: Date in YYYY-MM-DD format (string)

### API Response Structure
```json
{
  "status_code": 0,
  "status_msg": "All OK",
  "return_data": [
    {
      "time_slot_id": 13,
      "time": "08:00 AM",
      "available": true,
      "available_count": 1
    }
    // ... more slots
  ]
}
```

## Implementation Details

### 1. Demo Flow Changes
- **Physical Demo**: Address → Date & Time → Confirmation (3 steps)
- **Virtual Demo**: Date & Time → Confirmation (2 steps)

### 2. New Components and Features

#### Horizontal Date Picker
- Shows next 7 days in a horizontal scrollable format
- Each date shows day abbreviation, date, and month
- Selected date is highlighted with blue border and background
- Automatically fetches available slots when a date is selected

#### Dynamic Time Slot Selection
- Fetches real-time availability from API
- Shows loading state while fetching slots
- Displays available/unavailable slots with visual indicators
- Shows available count for each slot
- Handles cases where no slots are available

#### Confirmation Step
- Shows selected date and time
- Displays demo type (Virtual vs Physical)
- Provides confirmation message with next steps

### 3. State Management
- `availableSlots`: Array of available time slots from API
- `isLoadingSlots`: Loading state for slot fetching
- `selectedDate`: Currently selected date
- `selectedTimeSlot`: Currently selected time slot ID

### 4. API Functions
- `getAvailableVirtualSlots(params)`: Fetches available slots for a given date and product

## Usage

### For Virtual Demo
1. Navigate to `/demo?type=virtual&product=<product_id>`
2. Select a date from the horizontal date picker
3. Choose an available time slot from the list
4. Review and confirm the booking

### For Physical Demo
1. Navigate to `/demo?type=physical&product=<product_id>`
2. Complete authentication (if required)
3. Select or add an address
4. Select date and time slot
5. Review and confirm the booking

## Technical Implementation

### Files Modified
1. **`app/demo/page.js`**: Main demo page logic
2. **`components/StepContent.js`**: Step content rendering
3. **`lib/api.js`**: API function for fetching slots
4. **`app/globals.css`**: Scrollbar hiding utilities

### Key Functions
- `fetchAvailableSlots(date)`: Fetches available slots for virtual demo
- `handleDateChange(date)`: Handles date selection and triggers slot fetching
- `getSteps()`: Returns different step configurations based on demo type

## Error Handling

- API errors are logged to console
- Loading states are properly managed
- Empty states are handled with user-friendly messages
- Fallback to empty arrays when API calls fail

## Testing

To test the virtual demo integration:

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/demo?type=virtual&product=38`
3. Select a date from the horizontal picker
4. Verify that available slots are fetched and displayed
5. Select a time slot and proceed to confirmation

## Notes

- The integration automatically detects demo type from URL parameters
- Virtual demo skips the address selection step entirely
- Date selection automatically triggers slot fetching
- All API responses are logged for debugging purposes
- The UI is responsive and works on both desktop and mobile devices
