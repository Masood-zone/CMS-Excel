"use client";

import React, { useMemo, useCallback } from "react";
import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  useTerms,
  useCreateTerm,
  useUpdateTerm,
  useActivateTerm,
  useDeleteTerm,
} from "@/services/api/queries";

export interface Term {
  id: number;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TermFormData {
  name: string;
  year: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const TermCard = React.memo(function TermCard({
  term,
  onEdit,
  onActivate,
  onDelete,
  activateLoading,
}: {
  term: Term;
  onEdit: (term: Term) => void;
  onActivate: (id: number) => void;
  onDelete: (id: number) => void;
  activateLoading: boolean;
}) {
  return (
    <Card key={term.id} className={term.isActive ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {term.name} {term.year}
              {term.isActive && <Badge variant="default">Active</Badge>}
            </CardTitle>
            <CardDescription>
              {format(new Date(term.startDate), "PPP")} -{" "}
              {format(new Date(term.endDate), "PPP")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!term.isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onActivate(term.id)}
                disabled={activateLoading}
              >
                Activate
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onEdit(term)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Term</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{term.name} {term.year}"?
                    This action cannot be undone and will affect all associated
                    records.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(term.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
});

export default function TermsManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [formData, setFormData] = useState<TermFormData>({
    name: "",
    year: new Date().getFullYear(),
    startDate: undefined,
    endDate: undefined,
  });

  const { data: terms, isLoading, error } = useTerms();
  const createTermMutation = useCreateTerm();
  const updateTermMutation = useUpdateTerm();
  const activateTermMutation = useActivateTerm();
  const deleteTermMutation = useDeleteTerm();

  const resetForm = () => {
    setFormData({
      name: "",
      year: new Date().getFullYear(),
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleCreateTerm = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.startDate >= formData.endDate) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      await createTermMutation.mutateAsync({
        name: formData.name,
        year: formData.year,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        isActive: false,
      });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Term created successfully");
    } catch {
      toast.error("Failed to create term");
    }
  };

  const handleEditTerm = async () => {
    if (
      !editingTerm ||
      !formData.name ||
      !formData.startDate ||
      !formData.endDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.startDate >= formData.endDate) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      await updateTermMutation.mutateAsync({
        id: editingTerm.id,
        name: formData.name,
        year: formData.year,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      });
      setIsEditDialogOpen(false);
      setEditingTerm(null);
      resetForm();
      toast.success("Term updated successfully");
    } catch {
      toast.error("Failed to update term");
    }
  };

  const handleActivateTerm = async (termId: number) => {
    try {
      await activateTermMutation.mutateAsync(termId);
      toast.success("Term activated successfully");
    } catch {
      toast.error("Failed to activate term");
    }
  };

  const handleDeleteTerm = async (termId: number) => {
    try {
      await deleteTermMutation.mutateAsync(termId);
      toast.success("Term deleted successfully");
    } catch {
      toast.error("Failed to delete term");
    }
  };

  const openEditDialog = (term: Term) => {
    setEditingTerm(term);
    setFormData({
      name: term.name,
      year: term.year,
      startDate: new Date(term.startDate),
      endDate: new Date(term.endDate),
    });
    setIsEditDialogOpen(true);
  };

  const activeTerm = useMemo(
    () => terms?.find((term: Term) => term.isActive),
    [terms]
  );
  const handleEdit = useCallback(openEditDialog, []);
  const handleActivate = useCallback(handleActivateTerm, [
    activateTermMutation,
  ]);
  const handleDelete = useCallback(handleDeleteTerm, [deleteTermMutation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading terms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error loading terms</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Term Management</h1>
          <p className="text-muted-foreground">
            Manage academic terms and their schedules
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Term
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Term</DialogTitle>
              <DialogDescription>
                Add a new academic term to the system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Term Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., First Term, Second Term"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, "PPP")
                      ) : (
                        <span>Pick start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) =>
                        setFormData({ ...formData, startDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(formData.endDate, "PPP")
                      ) : (
                        <span>Pick end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) =>
                        setFormData({ ...formData, endDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTerm}
                disabled={createTermMutation.isLoading}
              >
                {createTermMutation.isLoading ? "Creating..." : "Create Term"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Term Alert */}
      {activeTerm ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              Active Term
            </CardTitle>
            <CardDescription className="text-green-700">
              {activeTerm.name} {activeTerm.year} is currently active
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <XCircle className="mr-2 h-5 w-5" />
              No Active Term
            </CardTitle>
            <CardDescription className="text-red-700">
              No term is currently active. Please activate a term to enable
              record and expense submissions.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Terms List */}
      <div className="grid gap-4">
        {terms?.map((term: Term) => (
          <TermCard
            key={term.id}
            term={term}
            onEdit={handleEdit}
            onActivate={handleActivate}
            onDelete={handleDelete}
            activateLoading={activateTermMutation.isLoading}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Term</DialogTitle>
            <DialogDescription>Update the term details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Term Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., First Term, Second Term"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-year">Year</Label>
              <Input
                id="edit-year"
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: Number.parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "PPP")
                    ) : (
                      <span>Pick start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) =>
                      setFormData({ ...formData, startDate: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "PPP")
                    ) : (
                      <span>Pick end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) =>
                      setFormData({ ...formData, endDate: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditTerm}
              disabled={updateTermMutation.isLoading}
            >
              {updateTermMutation.isLoading ? "Updating..." : "Update Term"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
