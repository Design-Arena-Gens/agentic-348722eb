'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Droplet, Calendar, CreditCard, Star } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <Droplet className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-800">Marwasco Water Tanker</h1>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Droplet className="w-20 h-20 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Marwasco Water Tanker Booking
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Book water tanker services with ease. Fast, reliable, and convenient water delivery.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-12 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Easy Booking</h3>
            <p className="text-gray-600 text-sm">Select date and time slot</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">M-Pesa Payment</h3>
            <p className="text-gray-600 text-sm">Secure mobile payments</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <Droplet className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Quick Delivery</h3>
            <p className="text-gray-600 text-sm">Same-day water delivery</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <Star className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Rate Service</h3>
            <p className="text-gray-600 text-sm">Share your feedback</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
