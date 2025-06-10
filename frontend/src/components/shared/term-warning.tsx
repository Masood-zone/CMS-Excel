"use client";

import { useActiveTerm } from "@/services/api/queries";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TermWarningProps {
  className?: string;
  showNavigateButton?: boolean;
}

export function TermWarning({
  className,
  showNavigateButton = true,
}: TermWarningProps) {
  const { data: activeTerm, isLoading } = useActiveTerm();
  const navigate = useNavigate();

  if (isLoading) return null;

  if (activeTerm) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>No Active Term</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          There is no active term set. Some features may be limited or
          unavailable.
        </p>
        {showNavigateButton && (
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => navigate("/admin/settings/terms")}
          >
            Go to Term Management
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
