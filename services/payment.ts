import { PaymentInfo } from "@/shared/registration.interface";

const PAYMENT_API_URL = "/api/payment/checkout";

interface CreatePaymentResponse {
  paymentLink: string;
  amount: number;
  discountPercentage?: number;
  originalAmount?: number;
  finalAmount?: number;
}

export async function createPaymentLink(
  paymentData: PaymentInfo,
  couponCode?: string
): Promise<CreatePaymentResponse> {
  const res = await fetch(PAYMENT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...paymentData, couponCode }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Erro ao criar link de pagamento.");
  }

  return res.json();
}