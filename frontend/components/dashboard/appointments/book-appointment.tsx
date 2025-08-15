"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createAppointment } from "@/services/appointmentService";
import { CreateAppointmentData } from "@/types/Appointment";

interface BookAppointmentProps {
  onAppointmentCreated?: () => void;
}

export default function BookAppointment({ onAppointmentCreated }: BookAppointmentProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentData>({
    medical_description: "",
    visiting_status: "",
    discharge_type: "",
  });

  const visitingStatusOptions = [
    { value: "discharged_inpatient_2weeks", label: "Discharged Inpatient (2 weeks)" },
    { value: "discharged_inpatient_1week", label: "Discharged Inpatient (1 week)" },
    { value: "external_referral", label: "External Referral" },
    { value: "internal_referral", label: "Internal Referral" },
    { value: "review_patient", label: "Review Patient" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.medical_description.trim() || !formData.visiting_status) {
      toast.error("Please fill in all required fields", { richColors: true });
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Creating appointment...", { richColors: true });

    try {
      const response = await createAppointment({
        medical_description: formData.medical_description.trim(),
        visiting_status: formData.visiting_status,
        discharge_type: formData.discharge_type?.trim() || undefined,
      });

      toast.success(response.message || "Appointment created successfully!", { 
        richColors: true 
      });
      
      // Reset form
      setFormData({
        medical_description: "",
        visiting_status: "",
        discharge_type: "",
      });
      
      setOpen(false);
      onAppointmentCreated?.();
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : "Failed to create appointment";
      toast.error(message, {
        richColors: true
      });
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Book New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book New Appointment</DialogTitle>
          <DialogDescription>
            Fill in the details below to request a new appointment. Scheduling will be processed on Wednesday.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visiting_status">Visiting Status *</Label>
            <Select
              value={formData.visiting_status}
              onValueChange={(value) =>
                setFormData({ ...formData, visiting_status: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visiting status" />
              </SelectTrigger>
              <SelectContent>
                {visitingStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_description">Medical Description *</Label>
            <Textarea
              id="medical_description"
              placeholder="Describe your medical condition, symptoms, or reason for the appointment..."
              value={formData.medical_description}
              onChange={(e) =>
                setFormData({ ...formData, medical_description: e.target.value })
              }
              disabled={isLoading}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
