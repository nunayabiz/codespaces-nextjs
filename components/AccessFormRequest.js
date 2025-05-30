// components/AccessRequestForm.js
import { useState } from 'react';

export default function AccessRequestForm({ userIp, userCountryCode }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear any previous messages
    setIsSubmitting(true); // Indicate submission is in progress

    try {
      const response = await fetch('/api/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the user's email, detected IP, and country code to the API route
        body: JSON.stringify({ email, userIp, userCountryCode }),
      });

      const data = await response.json(); // Parse the JSON response from the API

      // Check if the API request was successful.
      if (response.ok) {
        setMessage('Access request sent successfully! We will review your request.');
        setEmail(''); // Clear the email input field after successful submission
      } else {
        // Display an error message from the API or a generic one.
        setMessage(`Error: ${data.error || 'Something went wrong.'}`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false); // Reset submission status
    }
  };

  return (
    <>
      <p className="text-lg text-gray-700 mb-6">
        Please send us an email to request access:
      </p>
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-4"> {/* Added space-y-4 for vertical spacing */}
        <input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     transition-all duration-200 ease-in-out placeholder-gray-500 text-base"
        />
        <button
          type="submit"
          disabled={isSubmitting} // Disable button during submission
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold text-lg
                     hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-4 focus:ring-indigo-300
                     transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
        >
          {isSubmitting ? 'Sending Request...' : 'Send Request'}
        </button>
      </form>
      {message && (
        <p className={`mt-6 text-base ${message.includes('success') ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}`}>
          {message}
        </p>
      )}
    </>
  );
}