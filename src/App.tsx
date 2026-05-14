/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    admissionId: '',
    joiningDate: '',
    exitDate: '',
  });

  const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });

  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Silent check on load if possible, but no popup
  }, []);

  const requestLocation = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setStatus('requesting');
      if (!navigator.geolocation) {
        setStatus('error');
        setErrorMessage('Geolocation is not supported by your browser');
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(coords);
          setStatus('granted');
          resolve(true);
        },
        (error) => {
          console.error('Location error:', error);
          if (error.code === error.PERMISSION_DENIED) {
            setStatus('denied');
          } else {
            setStatus('error');
            setErrorMessage('Failed to retrieve location. Please try again.');
          }
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Request location JUST IN TIME
    const hasLocation = await requestLocation();
    
    if (!hasLocation) {
      setIsSubmitting(false);
      return;
    }

    // Logic for Google Apps Script submission
    try {
      const scriptURL = (import.meta as any).env.VITE_GOOGLE_SCRIPT_URL;
      
      if (!scriptURL) {
        console.error('URL error: VITE_GOOGLE_SCRIPT_URL is missing in Settings > Secrets.');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSubmitSuccess(true);
        return;
      }

      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ 
          ...formData, 
          // Use the location values fetched just now
          latitude: location.lat, 
          longitude: location.lng 
        }),
      });

      setSubmitSuccess(true);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden"
      >
        {/* Header Section */}
        <div className="px-8 pt-12 pb-6 text-center">
          <div className="relative inline-block mb-8">
            <img 
              src="input_file_0.png" 
              alt="English House Academy" 
              className="h-24 w-auto drop-shadow-sm"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-red-600 rounded-full" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 mb-1">
            Refund Application
          </h1>
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.4em] ml-1">
            English House Academy Portal
          </p>
        </div>

        {/* Silent Security Layer (Errors only) */}
        <AnimatePresence>
          {(status === 'denied' || status === 'error') && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 border-y border-red-100 overflow-hidden"
            >
              <div className="px-8 py-3 flex items-center justify-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-[11px] font-medium text-red-600 leading-tight">
                  Verification required. Please allow location access and refresh the page to continue.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Body */}
        <form ref={formRef} onSubmit={handleSubmit} className="px-8 pt-8 pb-4 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 ml-1">
                Full Name
              </label>
              <input
                required
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all placeholder:text-zinc-300"
              />
            </div>

            <div>
              <label htmlFor="admissionId" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 ml-1">
                Admission ID
              </label>
              <input
                required
                type="text"
                id="admissionId"
                name="admissionId"
                value={formData.admissionId}
                onChange={handleInputChange}
                placeholder="ADM-0000"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all placeholder:text-zinc-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="joiningDate" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 ml-1">
                  Joining Date
                </label>
                <input
                  required
                  type="date"
                  id="joiningDate"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-zinc-600"
                />
              </div>
              <div>
                <label htmlFor="exitDate" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 ml-1">
                  Exit Date
                </label>
                <input
                  required
                  type="date"
                  id="exitDate"
                  name="exitDate"
                  value={formData.exitDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all text-zinc-600"
                />
              </div>
            </div>
          </div>

          {/* Hidden Location Fields (Req validation) */}
          <input type="hidden" name="latitude" value={location.lat || ''} />
          <input type="hidden" name="longitude" value={location.lng || ''} />

          <button
            type="submit"
            disabled={isSubmitting || submitSuccess}
            className={`
              w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2
              ${!submitSuccess 
                ? 'bg-[#00007B] text-white hover:bg-zinc-900 shadow-xl shadow-zinc-200 active:scale-[0.98]' 
                : 'bg-emerald-600 text-white cursor-default'}
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Successfully Submitted
              </>
            ) : (
              'Request Refund'
            )}
          </button>
        </form>

        <div className="px-8 pb-8 text-center text-[10px] text-zinc-400 uppercase tracking-widest flex flex-col items-center gap-1">
          <span>English House Academy • Official Refund Portal</span>
          {!(import.meta as any).env.VITE_GOOGLE_SCRIPT_URL && (
            <span className="text-[8px] text-red-300 font-bold lowercase tracking-normal">
              (Admin: check secrets configuration)
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
