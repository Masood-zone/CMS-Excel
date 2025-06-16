"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  buttonText?: string;
  buttonAction?: () => void;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
}

export function Header({
  title,
  buttonText,
  buttonAction,
  secondaryButtonText,
  secondaryButtonAction,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {(buttonText || secondaryButtonText) && (
        <div className="flex items-center gap-2">
          {secondaryButtonText && secondaryButtonAction && (
            <Button
              variant="outline"
              onClick={secondaryButtonAction}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {secondaryButtonText}
            </Button>
          )}
          {buttonText && buttonAction && (
            <Button onClick={buttonAction}>{buttonText}</Button>
          )}
        </div>
      )}
    </div>
  );
}

export function PageHeading({ children }: { children: React.ReactNode }) {
  return <h1 className="text-4xl font-semibold">{children}</h1>;
}
