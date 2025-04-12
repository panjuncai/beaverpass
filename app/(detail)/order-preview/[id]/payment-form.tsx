import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button, Toast } from "antd-mobile";
import PropTypes from "prop-types";
import { LeftOutline } from "antd-mobile-icons";
interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  amount: number;
  email:string;
  onClose: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  onSuccess,
  onError,
  amount,
  email,
  onClose,
}) => {
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
        onError(error.message || "Payment failed, please try again");
        Toast.show({
          icon: "fail",
          content: error.message || "Payment failed, please try again",
        });
      } else {
        onSuccess();
        Toast.show({
          icon: "success",
          content: "Payment successful!",
        });
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      onError("Payment processing error");
      Toast.show({
        icon: "fail",
        content: "Payment processing error",
      });
    }

    setIsProcessing(false);
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
          
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-2">
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

            <Button
              disabled={!stripe || isProcessing}
              block
              color="success"
              size="large"
              className="flex-1 rounded-full"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <span className="loading loading-spinner"></span>
                  Processing...
                </span>
              ) : (
                "Pay"
              )}
            </Button>
          </form>
          <span className="flex mt-4">
            <span className="flex-1 text-right">
              Powered by <span className="font-bold text-lg text-blue-500">Stripe</span>
            </span>
          </span>
        </div>
      </div>
    </>
  );
};

PaymentForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  amount: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PaymentForm;
