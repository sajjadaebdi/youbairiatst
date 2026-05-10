
// Payment Configuration for Content Reward Program

export const PAYMENT_CONFIG = {
  // Paytm UPI Configuration
  PAYTM_UPI: {
    UPI_ID: '9368598307@pthdfc', // Your Paytm UPI ID
    MERCHANT_NAME: 'Youbairia',
    CURRENCY: 'INR',
  },
  
  // Payment Methods
  PAYMENT_METHODS: {
    PAYTM_UPI: 'PAYTM_UPI',
    STRIPE: 'STRIPE',
  },


  
  // Default Payment Method
  DEFAULT_PAYMENT_METHOD: 'PAYTM_UPI',
};

// Function to get Paytm UPI ID
export function getPaytmUpiId(): string {
  return PAYMENT_CONFIG.PAYTM_UPI.UPI_ID;
}

// Function to update Paytm UPI ID
export function updatePaytmUpiId(newUpiId: string): void {
  PAYMENT_CONFIG.PAYTM_UPI.UPI_ID = newUpiId;
}

// Function to get payment method display name
export function getPaymentMethodDisplayName(method: string): string {
  switch (method) {
    case 'PAYTM_UPI':
      return 'Paytm UPI';
    case 'STRIPE':
      return 'Stripe';
    default:
      return method;
  }
}
