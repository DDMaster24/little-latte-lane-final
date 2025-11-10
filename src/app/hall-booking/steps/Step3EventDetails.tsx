'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HallBookingFormData, EVENT_TYPES, VALIDATION_RULES } from '@/types/hall-booking';

interface Step3Props {
  formData: HallBookingFormData;
  updateFormData: (updates: Partial<HallBookingFormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  user: any;
}

export default function Step3EventDetails({
  formData,
  updateFormData,
  onNext,
  onPrevious,
}: Step3Props) {
  const handleNext = () => {
    // Validation
    if (!formData.eventDate) {
      alert('Please select an event date');
      return;
    }
    if (!formData.eventStartTime) {
      alert('Please select a start time');
      return;
    }
    if (!formData.eventEndTime) {
      alert('Please select an end time');
      return;
    }
    if (!formData.eventType) {
      alert('Please select an event type');
      return;
    }

    // Check guest limit
    if (formData.totalGuests < VALIDATION_RULES.minGuests) {
      alert(`Minimum ${VALIDATION_RULES.minGuests} guest required`);
      return;
    }
    if (formData.totalGuests > VALIDATION_RULES.maxGuests) {
      alert(`Maximum ${VALIDATION_RULES.maxGuests} guests allowed`);
      return;
    }

    // Check vehicle limit
    if (formData.numberOfVehicles > VALIDATION_RULES.maxVehicles) {
      alert(`Maximum ${VALIDATION_RULES.maxVehicles} vehicles allowed`);
      return;
    }

    // Check end time is not past 23:00
    if (formData.eventEndTime > VALIDATION_RULES.eventEndTime) {
      alert('Functions must end by 23:00 as per Roberts Hall rules');
      return;
    }

    // Check start time is before end time
    if (formData.eventStartTime >= formData.eventEndTime) {
      alert('Start time must be before end time');
      return;
    }

    // Check date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.eventDate);
    if (selectedDate < today) {
      alert('Event date must be in the future');
      return;
    }

    onNext();
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Event Details</h2>
        <p className="text-gray-300">Tell us about your event at Roberts Hall.</p>
      </div>

      {/* Date & Time */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">📅 Date & Time</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block font-semibold mb-2 text-gray-200">
              Event Date <span className="text-red-400">*</span>
            </label>
            <Input
              type="date"
              value={formData.eventDate}
              onChange={(e) => updateFormData({ eventDate: e.target.value })}
              min={today}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200">
              Start Time <span className="text-red-400">*</span>
            </label>
            <Input
              type="time"
              value={formData.eventStartTime}
              onChange={(e) => updateFormData({ eventStartTime: e.target.value })}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200">
              End Time <span className="text-red-400">*</span>
            </label>
            <Input
              type="time"
              value={formData.eventEndTime}
              onChange={(e) => updateFormData({ eventEndTime: e.target.value })}
              max={VALIDATION_RULES.eventEndTime}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
            />
            <p className="text-sm text-gray-400 mt-1">Must end by 23:00</p>
          </div>
        </div>
      </div>

      {/* Event Type & Description */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">🎉 Event Information</h3>

        <div>
          <label className="block font-semibold mb-2 text-gray-200">
            Type of Event <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.eventType}
            onChange={(e) => updateFormData({ eventType: e.target.value })}
            required
            className="w-full p-3 rounded-lg bg-gray-700/80 text-white border border-gray-600 focus:border-neonCyan focus:ring-2 focus:ring-neonCyan/20"
          >
            <option value="">-- Select Event Type --</option>
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-200">Event Description</label>
          <textarea
            value={formData.eventDescription}
            onChange={(e) => updateFormData({ eventDescription: e.target.value })}
            rows={4}
            className="w-full p-4 rounded-lg bg-gray-700/80 text-white border border-gray-600 focus:border-neonCyan focus:ring-2 focus:ring-neonCyan/20 resize-vertical"
            placeholder="Briefly describe your event (optional)"
          />
          <p className="text-sm text-gray-400 mt-1">
            Optional: Provide any additional details about your event
          </p>
        </div>
      </div>

      {/* Guest & Vehicle Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">👥 Guests & Vehicles</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200">
              Total Number of Guests <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              value={formData.totalGuests}
              onChange={(e) => updateFormData({ totalGuests: parseInt(e.target.value) || 1 })}
              min={VALIDATION_RULES.minGuests}
              max={VALIDATION_RULES.maxGuests}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
            />
            <p className="text-sm text-gray-400 mt-1">
              Maximum {VALIDATION_RULES.maxGuests} guests permitted
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200">
              Number of Vehicles <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              value={formData.numberOfVehicles}
              onChange={(e) =>
                updateFormData({ numberOfVehicles: parseInt(e.target.value) || 0 })
              }
              min={VALIDATION_RULES.minVehicles}
              max={VALIDATION_RULES.maxVehicles}
              required
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
            />
            <p className="text-sm text-gray-400 mt-1">
              Maximum {VALIDATION_RULES.maxVehicles} vehicles permitted
            </p>
          </div>
        </div>
      </div>

      {/* Equipment Needs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">🪑 Equipment Requirements</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2 text-gray-200">Tables Required</label>
            <Input
              type="number"
              value={formData.tablesRequired}
              onChange={(e) => updateFormData({ tablesRequired: parseInt(e.target.value) || 0 })}
              min={0}
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
            />
            <p className="text-sm text-gray-400 mt-1">
              Optional: Enter 0 if you don't need tables
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-200">Chairs Required</label>
            <Input
              type="number"
              value={formData.chairsRequired}
              onChange={(e) => updateFormData({ chairsRequired: parseInt(e.target.value) || 0 })}
              min={0}
              className="bg-gray-700/80 border-gray-600 text-white focus:border-neonCyan"
            />
            <p className="text-sm text-gray-400 mt-1">
              Optional: Enter 0 if you don't need chairs
            </p>
          </div>
        </div>

        <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-4">
          <p className="text-gray-300 text-sm">
            💡 <strong className="text-white">Note:</strong> Equipment availability will be
            confirmed by the office after your booking is approved.
          </p>
        </div>
      </div>

      {/* Important Rules */}
      <div className="bg-neonPink/10 border border-neonPink/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neonPink mb-4">⚠️ Important Rules</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-neonPink mt-1">•</span>
            <span>Maximum 50 guests permitted per function</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neonPink mt-1">•</span>
            <span>Maximum 30 vehicles permitted per function</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neonPink mt-1">•</span>
            <span>
              <strong>Functions must end by 23:00 latest</strong> - NO EXCEPTIONS
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neonPink mt-1">•</span>
            <span>Speed limit within Roberts Estate is 30 km/h</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neonPink mt-1">•</span>
            <span>All guests must respect estate rules and neighboring residents</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          ← Previous
        </Button>

        <Button
          onClick={handleNext}
          className="bg-gradient-to-r from-neonPink to-neonCyan hover:from-neonPink/80 hover:to-neonCyan/80 text-black font-semibold"
        >
          Continue to Bank Details →
        </Button>
      </div>
    </div>
  );
}
