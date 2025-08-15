"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Calendar, Clock } from "lucide-react";

interface PatientDetailsDialogProps {
  patient: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PatientDetailsDialog({
  patient,
  open,
  onOpenChange,
}: PatientDetailsDialogProps) {
  if (!patient) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        variant: "default",
        label: "Active",
        color: "bg-green-100 text-green-800",
      },
      inactive: {
        variant: "secondary",
        label: "Inactive",
        color: "bg-gray-100 text-gray-800",
      },
      pending: {
        variant: "outline",
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return (
      <Badge variant={config.variant as any} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            Patient Details
          </DialogTitle>
          <DialogDescription>
            Patient information and contact details
          </DialogDescription>
        </DialogHeader>

        {/* Personal Information */}
        <Card className="nf-glass-bg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  First Name
                </label>
                <p className="text-sm font-semibold">
                  {patient.first_name || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Last Name
                </label>
                <p className="text-sm font-semibold">
                  {patient.last_name || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Age</label>
                <p className="text-sm font-semibold">
                  {calculateAge(patient.date_of_birth)} years
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Gender
                </label>
                <p className="text-sm font-semibold capitalize">
                  {patient.gender || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Date of Birth
                </label>
                <p className="text-sm font-semibold">
                  {formatDate(patient.date_of_birth)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <div className="mt-1">
                  {getStatusBadge(patient.status || "active")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="nf-glass-bg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email Address
              </label>
              <p className="text-sm font-semibold">{patient.email || "N/A"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Phone Number
              </label>
              <p className="text-sm font-semibold">
                {patient.phone_number || "N/A"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Preferred Contact Method
              </label>
              <p className="text-sm font-semibold capitalize">
                {patient.preferred_contact || "Not specified"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Registration Information */}
        <Card className="nf-glass-bg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Registration Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Patient ID
                </label>
                <p className="text-sm font-semibold font-mono">
                  {patient.id || patient._id || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Registration Date
                </label>
                <p className="text-sm font-semibold">
                  {formatDateTime(patient.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
