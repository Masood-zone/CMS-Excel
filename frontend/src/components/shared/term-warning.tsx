"use client";

import { AlertTriangle, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTerms } from "@/services/api/queries";
import { Term } from "@/pages/admin/settings/terms/terms";

interface TermWarningProps {
  showNavigateButton?: boolean;
  className?: string;
}

export function TermWarning({
  showNavigateButton = true,
  className,
}: TermWarningProps) {
  const navigate = useNavigate();
  const { data: terms } = useTerms();

  const activeTerm = terms?.find((term: Term) => term.isActive);

  if (activeTerm) {
    return null; // Don't show warning if there's an active term
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>No Active Term</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          No academic term is currently active. Record and expense submissions
          are disabled.
        </span>
        {showNavigateButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/settings/terms")}
            className="ml-4"
          >
            <Settings className="mr-2 h-4 w-4" />
            Manage Terms
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
