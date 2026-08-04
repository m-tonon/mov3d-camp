"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RegistrationForm } from "@/components/registration/registration-form";
import { RegistrationClosed } from "@/components/registration/registration-closed";
import { PaymentSection } from "@/components/payment/payment-section";
import { PaymentCompletedScreen } from "@/components/payment/payment-completed";
import { RegistrationFormData } from "@/shared/registration.interface";
import { isRegistrationOpen } from "@/lib/registration-config";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";

function AdminAccessLink() {
  return (
    <Button variant="outline" size="sm" className="gap-2 shadow-sm" asChild>
      <Link href="/admin">
        <ShieldCheck className="size-4" aria-hidden />
        Área administrativa
      </Link>
    </Button>
  );
}

function RegistrationTopBar({ className }: { className?: string }) {
  return (
    <header
      className={
        className ??
        'border-b border-border bg-background/80 backdrop-blur-sm'
      }
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <AdminThemeToggle />
        <AdminAccessLink />
      </div>
    </header>
  );
}

type Step = "form" | "payment";

const STEP_LABELS: Record<Step, string> = {
  form: "Inscrição",
  payment: "Pagamento",
};

const STEPS: Step[] = ["form", "payment"];

function RegistrationPageContent() {
  const searchParams = useSearchParams();
  const paymentCompleted = searchParams.get("paymentCompleted");
  const registrationOpen = isRegistrationOpen();

  const [step, setStep] = useState<Step>("form");
  const [submittedData, setSubmittedData] =
    useState<RegistrationFormData | null>(null);

  const currentIndex = STEPS.indexOf(step);

  const handleFormSubmit = (data: RegistrationFormData) => {
    setSubmittedData(data);
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStep("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (paymentCompleted) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <RegistrationTopBar />
        <PaymentCompletedScreen />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <RegistrationTopBar className="relative z-10 border-b border-border bg-background/80 backdrop-blur-sm" />
      <motion.div
        className="pointer-events-none absolute top-10 left-[-80px] z-0 w-[260px] h-[260px] bg-primary/15 blur-3xl rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[-120px] right-[-60px] z-0 w-[320px] h-[320px] bg-accent/15 blur-3xl rounded-full"
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 md:py-16">
        {!registrationOpen ? (
          <RegistrationClosed showHomeLink />
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-8">
              {STEPS.map((s, i) => {
                const isDone = i < currentIndex;
                const isCurrent = i === currentIndex;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          isDone
                            ? "bg-primary text-primary-foreground"
                            : isCurrent
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isDone ? (
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium transition-colors ${
                          isCurrent ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {STEP_LABELS[s]}
                      </span>
                    </div>

                    {i < STEPS.length - 1 && (
                      <div
                        className={`w-8 h-px transition-colors duration-500 ${
                          isDone ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <div hidden={step !== "form"} aria-hidden={step !== "form"}>
                <RegistrationForm onSubmit={handleFormSubmit} />
              </div>

              {step === "payment" && submittedData && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <PaymentSection data={submittedData} onBack={handleBack} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

      </div>
    </main>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense>
      <RegistrationPageContent />
    </Suspense>
  );
}
