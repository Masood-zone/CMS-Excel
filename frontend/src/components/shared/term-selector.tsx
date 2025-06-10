"use client"

import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTerms } from "@/services/api/queries"

interface Term {
  id: number
  name: string
  year: number
  isActive: boolean
}

interface TermSelectorProps {
  selectedTermId?: number
  onTermChange: (termId: number | undefined) => void
  className?: string
}

export function TermSelector({ selectedTermId, onTermChange, className }: TermSelectorProps) {
  const { data: terms, isLoading } = useTerms()

  useEffect(() => {
    // Auto-select active term if no term is selected
    if (!selectedTermId && terms && terms.length > 0) {
      const activeTerm = terms.find((term: Term) => term.isActive)
      if (activeTerm) {
        onTermChange(activeTerm.id)
      }
    }
  }, [terms, selectedTermId, onTermChange])

  if (isLoading) {
    return (
      <div className={className}>
        <span className="text-sm text-muted-foreground">Loading terms...</span>
      </div>
    )
  }

  if (!terms || terms.length === 0) {
    return (
      <div className={className}>
        <Badge variant="destructive">No terms available</Badge>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium">Term:</span>
      <Select
        value={selectedTermId?.toString() || ""}
        onValueChange={(value) => onTermChange(value ? Number(value) : undefined)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select term" />
        </SelectTrigger>
        <SelectContent>
          {terms.map((term: Term) => (
            <SelectItem key={term.id} value={term.id.toString()}>
              <div className="flex items-center gap-2">
                {term.name} {term.year}
                {term.isActive && (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
