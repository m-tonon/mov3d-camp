import { RegistrationFormData, SaveRegistrationResponse } from "@/shared/registration.interface";

const API_URL = "/api/registration";

export async function saveRegistration(
  data: RegistrationFormData
): Promise<SaveRegistrationResponse> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Erro ao salvar inscrição.");
  }

  return res.json();
}

export async function getRegistrationStatus(
  referenceId: string
): Promise<RegistrationFormData | null> {
  const res = await fetch(`${API_URL}/${referenceId}`);
  if (!res.ok) return null;
  return res.json();
}