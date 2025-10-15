'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

const TIME_SLOTS = ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];
const BOOKING_PRICE = 3000;

export default function BookingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchBookedSlots = async (date: Date) => {
    setLoadingSlots(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const q = query(
        collection(db, 'bookings'),
        where('date', '==', dateStr),
        where('status', '!=', 'cancelled')
      );
      const snapshot = await getDocs(q);
      const slots = snapshot.docs.map(doc => doc.data().timeSlot);
      setBookedSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !user) {
      toast.error('Please select date and time slot');
      return;
    }

    setSubmitting(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const bookingData = {
        userId: user.uid,
        userName: user.displayName || 'User',
        userEmail: user.email,
        date: dateStr,
        timeSlot: selectedSlot,
        amount: BOOKING_PRICE,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);

      toast.success('Booking created! Redirecting to payment...');
      setTimeout(() => {
        router.push(`/payment/${docRef.id}`);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const availableSlots = TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
  const isFullyBooked = selectedDate && availableSlots.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Water Tanker</h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Date</h2>
          <div className="flex justify-center">
            <Calendar
              onChange={(value) => setSelectedDate(value as Date)}
              value={selectedDate}
              minDate={new Date()}
              className="border-0 shadow-none"
            />
          </div>
        </div>

        {selectedDate && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Select Time Slot for {selectedDate.toLocaleDateString()}
            </h2>

            {loadingSlots ? (
              <p className="text-center text-gray-600 py-4">Loading available slots...</p>
            ) : isFullyBooked ? (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-xl font-semibold text-red-600 mb-2">
                  BOOKINGS FULL — CHOOSE ANOTHER DATE
                </p>
                <p className="text-gray-600">All time slots are booked for this date</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = selectedSlot === slot;

                  return (
                    <button
                      key={slot}
                      onClick={() => !isBooked && setSelectedSlot(slot)}
                      disabled={isBooked}
                      className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                        isBooked
                          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900 hover:border-blue-600'
                      }`}
                    >
                      <Clock className="w-5 h-5 mx-auto mb-2" />
                      {slot}
                      {isBooked && <div className="text-xs mt-1">Booked</div>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedDate && selectedSlot && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">{selectedDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold">{selectedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-blue-600">KSh {BOOKING_PRICE.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {submitting ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
