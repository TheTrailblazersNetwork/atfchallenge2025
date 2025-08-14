"use client";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDownIcon, Filter } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppointmentCardType } from "@/types/Appointment";

const AppointmentFilters = ({
  filter,
  filterFunction,
}: {
  filter: Array<AppointmentCardType>;
  filterFunction: React.Dispatch<React.SetStateAction<Array<AppointmentCardType>>>;
}) => {
  const [open, setOpen] = useState(false);
  const [allAppointments, setAllAppointments] = useState<AppointmentCardType[]>([]);

  // filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [descriptionFilter, setDescriptionFilter] = useState<string>("");

  // Store original data when component mounts
  useEffect(() => {
    if (allAppointments.length === 0 && filter.length > 0) {
      setAllAppointments(filter);
    }
  }, [filter, allAppointments.length]);

  // Apply filters whenever filter state changes
  useEffect(() => {
    let filtered = [...allAppointments];

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(
        (appointment) => appointment.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter((appointment) => {
        const appointmentDate = new Date(appointment.created_at);
        return (
          appointmentDate.toDateString() === dateFilter.toDateString()
        );
      });
    }

    // Filter by medical description
    if (descriptionFilter) {
      filtered = filtered.filter((appointment) =>
        appointment.medical_description
          .toLowerCase()
          .includes(descriptionFilter.toLowerCase())
      );
    }

    filterFunction(filtered);
  }, [statusFilter, dateFilter, descriptionFilter, allAppointments, filterFunction]);

  const clearFilters = () => {
    setDateFilter(undefined);
    setStatusFilter("");
    setDescriptionFilter("");
  };

  const hasActiveFilters = statusFilter || dateFilter || descriptionFilter;

  return (
    <div className="w-full md:w-max grid grid-cols-2 md:grid-cols-3 lg:flex gap-2">
      <Button 
        className="max-sm:col-span-2" 
        onClick={clearFilters} 
        variant={hasActiveFilters ? "outline" : "ghost"}
        disabled={!hasActiveFilters}
      >
        <Filter className="w-4 h-4 mr-2" />
        {hasActiveFilters ? "Clear Filters" : "No Filters"}
      </Button>

      <Select
        value={statusFilter}
        onValueChange={setStatusFilter}
      >
        <SelectTrigger className="bg-white max-sm:col-span-1 max-sm:max-w-full max-sm:min-w-full">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Appointment Status</SelectLabel>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="bg-white max-sm:col-span-1 max-sm:max-w-full max-sm:min-w-full justify-between font-normal text-muted-foreground"
          >
            {dateFilter ? dateFilter.toLocaleDateString() : "Filter by Date"}
            <ChevronDownIcon className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={dateFilter}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDateFilter(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Input
        className="bg-white col-span-full"
        placeholder="Search by medical description..."
        value={descriptionFilter}
        onChange={(e) => setDescriptionFilter(e.target.value)}
      />
    </div>
  );
};

export default AppointmentFilters;
