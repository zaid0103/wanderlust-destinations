'use client';

import { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Button from './Button';

interface BookingFormProps {
  price: number;
  propertyId: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ price, propertyId }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  });
  const [guests, setGuests] = useState(1);

  const calculateTotalPrice = () => {
    const days = Math.ceil(
      (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days * price;
  };

  const handleBooking = async () => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          guests,
          totalPrice: calculateTotalPrice(),
        }),
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      // Handle successful booking
      alert('Booking successful!');
    } catch (error) {
      alert('Failed to book. Please try again.');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Book this property</h3>
      <div className="mb-4">
        <DateRange
          ranges={[dateRange]}
          onChange={item => setDateRange(item.selection)}
          minDate={new Date()}
          rangeColors={['#262626']}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Number of guests</label>
        <input
          type="number"
          min="1"
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value))}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <p className="text-lg">Total: ${calculateTotalPrice()}</p>
      </div>
      <Button label="Book Now" onClick={handleBooking} />
    </div>
  );
};

export default BookingForm;
