import { PaymentInfo } from "@/shared/registration.interface";

const PAYMENT_API_URL = "/api/payment/checkout";

interface CreatePaymentResponse {
  paymentLink: string;
  amount: number;
}

export async function createPaymentLink(paymentData: PaymentInfo): Promise<CreatePaymentResponse> {
  const res = await fetch(PAYMENT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  });

  if (!res.ok) {
    throw new Error("Erro ao criar link de pagamento.");
  }

  return res.json();
}