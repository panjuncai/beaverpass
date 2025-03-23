import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Toast } from 'antd-mobile';
import PropTypes from 'prop-types';

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  amount: number;
  onClose: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSuccess, onError, amount, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed, please try again');
        Toast.show({
          icon: 'fail',
          content: error.message || 'Payment failed, please try again',
        });
      } else {
        onSuccess();
        Toast.show({
          icon: 'success',
          content: 'Payment successful!',
        });
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      onError('Payment processing error');
      Toast.show({
        icon: 'fail',
        content: 'Payment processing error',
      });
    }

    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Payment Details</h2>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-circle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="text-lg font-semibold text-right">
              Amount to pay: ${amount.toFixed(2)}
            </div>
          </div>

          <PaymentElement className="mb-6" />
          
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="btn btn-primary w-full"
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="loading loading-spinner"></span>
                Processing...
              </span>
            ) : (
              'Confirm Payment'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

PaymentForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  amount: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PaymentForm; 