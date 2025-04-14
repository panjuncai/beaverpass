import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "antd-mobile";
import PropTypes from "prop-types";
import { LeftOutline } from "antd-mobile-icons";

interface PaymentFormProps {
  email: string;
  onError: (error: string) => void;
  onClose: () => void;
  amount: number;
}

export function PaymentForm({ email, amount, onError, onClose }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded or clientSecret is missing");
      setErrorMessage("Payment system is not ready. Please try again later.");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // 验证表单
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "An error occurred while validating your payment method.");
        setIsLoading(false);
        return;
      }
      
      // 确认支付
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });
      
      console.log("Payment result:", result);
      
      // 处理支付结果
      if (result.error) {
        if (result.error.type === "card_error" || result.error.type === "validation_error") {
          setErrorMessage(result.error.message || "Your payment was unsuccessful, please try again.");
        } else {
          setErrorMessage("An unexpected error occurred."+result.error.message);
        }
        console.error("Payment error:", result.error);
        onError(result.error.message || "Payment failed, please try again");
      } else {
        console.log("No error returned, assuming redirect will happen");
      }
    } catch (e) {
      console.error("Error during payment confirmation:", e);
      setErrorMessage("An error occurred while processing your payment. Please try again.");
      onError("Payment processing error");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div className="fixed inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center">
              <LeftOutline
                className="cursor-pointer"
                fontSize={24}
                onClick={() => onClose()}
              />
              <div className="text-xl font-bold ml-2">BeaverPass</div>
            </div>
          
          <form id="payment-form" onSubmit={handleSubmit} className="space-y-2">
            <div className="pt-4 rounded-lg">
              <div className="text-4xl font-semibold text-left">
                ${amount.toFixed(2)}
              </div>
            </div>

            <div className="flex bg-gray-50 p-2 rounded-lg gap-2">
              <div className="flex-none text-lg">Email:</div>
              <div className="flex-1 text-lg">{email}</div>
            </div>

            <PaymentElement className="mb-6" />
            
            {errorMessage && (
              <div className="text-error text-sm p-2 bg-red-50 rounded">
                {errorMessage}
              </div>
            )}
            
            <div className="h-12"></div>
            <div className="fixed bottom-8 left-4 right-4 p-2">
              <Button
                block
                color="success"
                size="large"
                className="flex-1"
                loading={isLoading}
                disabled={isLoading || !stripe || !elements}
                type="submit"
                shape='rounded'
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="loading loading-spinner mr-2"></span>
                    Processing...
                  </span>
                ) : (
                  "Pay"
                )}
              </Button>
            </div>
          </form>
          <div className="fixed bottom-0 left-4 right-4 p-2">
          <span className="flex mt-4">
            <span className="flex-1 text-right">
              Powered by <span className="font-bold text-lg text-blue-500">Stripe</span>
            </span>
          </span>
          </div>
        </div>
      </div>
    </>
  );
}

PaymentForm.propTypes = {
  email: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
  amount: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PaymentForm;
