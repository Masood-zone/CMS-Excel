import type React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { cva } from "class-variance-authority";

interface AnalyticsCardProps {
  title: string;
  value: number | string;
  secondaryValue?: string;
  icon: React.ReactNode;
  notice?: string;
  className?: string;
}

export function AnalyticsCard({
  title,
  value,
  secondaryValue,
  icon,
  notice,
  className,
}: AnalyticsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {secondaryValue && (
          <p className="text-sm text-muted-foreground">{secondaryValue}</p>
        )}
      </CardContent>
      {notice && (
        <CardFooter>
          <p className="text-xs text-muted-foreground flex items-center space-x-2">
            <Info className="size-4" />
            <span>{notice}</span>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

const cardVariants = cva(
  "relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all hover:shadow-md",
  {
    variants: {
      variant: {
        blue: "border-blue-100 bg-gradient-to-br from-blue-50 to-white",
        purple: "border-purple-100 bg-gradient-to-br from-purple-50 to-white",
        green: "border-green-100 bg-gradient-to-br from-green-50 to-white",
        amber: "border-amber-100 bg-gradient-to-br from-amber-50 to-white",
        default: "border-gray-100 bg-gradient-to-br from-gray-50 to-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconVariants = cva("absolute right-6 top-6 size-12 opacity-10", {
  variants: {
    variant: {
      blue: "text-blue-400",
      purple: "text-purple-400",
      green: "text-green-400",
      amber: "text-amber-400",
      default: "text-gray-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const valueVariants = cva("text-3xl font-bold", {
  variants: {
    variant: {
      blue: "text-blue-700",
      purple: "text-purple-700",
      green: "text-green-700",
      amber: "text-amber-700",
      default: "text-gray-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const secondaryValueVariants = cva("mt-1 text-sm font-medium", {
  variants: {
    variant: {
      blue: "text-blue-600",
      purple: "text-purple-600",
      green: "text-green-600",
      amber: "text-amber-600",
      default: "text-gray-600",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ProfessionalAnalyticsCardProps {
  title: string;
  value: string | number;
  secondaryValue?: string | number;
  icon: LucideIcon;
  notice?: string;
  variant?: "blue" | "purple" | "green" | "amber" | "default";
  className?: string;
}

export function ProfessionalAnalyticsCard({
  title,
  value,
  secondaryValue,
  icon: Icon,
  notice,
  variant = "default",
  className,
}: ProfessionalAnalyticsCardProps) {
  return (
    <div className={cn(cardVariants({ variant }), className)}>
      <div className="flex flex-col">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="mt-2">
          <div className={cn(valueVariants({ variant }))}>{value}</div>
          {secondaryValue && (
            <div className={cn(secondaryValueVariants({ variant }))}>
              {secondaryValue}
            </div>
          )}
        </div>
        {notice && (
          <p className="mt-3 text-xs text-muted-foreground">{notice}</p>
        )}
      </div>
      <Icon className={cn(iconVariants({ variant }))} />
    </div>
  );
}
