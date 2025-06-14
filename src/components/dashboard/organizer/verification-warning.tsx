"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";

interface VerificationWarningProps {
  organizerId: string;
  verificationDocs?: string | null;
}

export function VerificationWarning({
  organizerId,
  verificationDocs,
}: VerificationWarningProps) {
  const router = useRouter();

  const handleRedirect = () => {
    router.push(`/organizer/${organizerId}/verification`);
  };
  // If verification documents have been submitted but not yet approved
  if (verificationDocs) {
    return (
      <MagicCard 
        className="mb-6 p-4 bg-gradient-to-br from-amber-50/90 to-orange-50/90 backdrop-blur-sm border-amber-200/50"
        gradientColor="rgba(245, 158, 11, 0.1)"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="font-semibold text-amber-800">Verification Pending</h3>
            <p className="text-sm text-amber-700">
              Your verification documents have been submitted and are pending review by our team.
              Some features may be limited until your account is verified.
            </p>
          </div>
        </div>
      </MagicCard>
    );
  }
  // If no verification documents have been submitted
  return (
    <MagicCard 
      className="mb-6 p-4 bg-gradient-to-br from-red-50/90 to-rose-50/90 backdrop-blur-sm border-red-200/50"
      gradientColor="rgba(239, 68, 68, 0.1)"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-red-800">Account Not Verified</h3>
            <p className="text-sm text-red-700">
              Your organizer account is not verified. You cannot create or publish events until your account is verified.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            onClick={handleRedirect}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Verify Your Account
          </Button>
        </div>
      </div>
    </MagicCard>
  );
}
