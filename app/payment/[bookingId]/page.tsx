'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface Booking {
  id: string;
  date: string;
  timeSlot: string;
  amount: number;
  status: string;
  paymentStatus: string;
}

export default function PaymentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const docRef = doc(db, 'bookings', bookingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBooking({ id: docSnap.id, ...docSnap.data() } as Booking);
        } else {
          toast.error('Booking not found');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Failed to load booking');
      } finally {
        setLoadingBooking(false);
      }
    };

    fetchBooking();
  }, [bookingId, router]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !booking) {
      toast.error('Please enter phone number');
      return;
    }

    // Format phone number (remove spaces, dashes, and ensure it starts with 254)
    let formattedPhone = phoneNumber.replace(/[\s-]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    setProcessing(true);

    try {
      const response = await axios.post('/api/mpesa/stk-push', {
        phoneNumber: formattedPhone,
        amount: booking.amount,
        bookingId: booking.id,
      });

      if (response.data.ResponseCode === '0') {
        toast.success('Payment request sent! Check your phone.');

        // Update booking status
        await updateDoc(doc(db, 'bookings', booking.id), {
          paymentStatus: 'processing',
          paymentPhone: formattedPhone,
        });

        // Simulate payment completion (in production, wait for callback)
        setTimeout(async () => {
          await updateDoc(doc(db, 'bookings', booking.id), {
            paymentStatus: 'completed',
            status: 'pending',
          });
          toast.success('Payment successful!');
          router.push('/dashboard');
        }, 5000);
      } else {
        toast.error('Payment request failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || loadingBooking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

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

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Payment</h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">{new Date(booking.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold">{booking.timeSlot}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600 text-lg">Total Amount:</span>
              <span className="font-bold text-2xl text-blue-600">
                KSh {booking.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">M-Pesa Payment</h2>
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="0700000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the M-Pesa number you want to pay from
              </p>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay with M-Pesa
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> You will receive a prompt on your phone to complete the payment.
              Enter your M-Pesa PIN to confirm the transaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
