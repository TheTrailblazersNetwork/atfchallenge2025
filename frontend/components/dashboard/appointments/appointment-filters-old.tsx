"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDownIcon, FunnelX } from "lucide-react";
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

  // filters
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [conditionFilter, setConditionFilter] = useState<string | undefined>(
    ""
  );

  const clearFilters = () => {
    setDateFilter(undefined);
    setStatusFilter("");
    setConditionFilter("");
  };

  return (
    <div className="w-full md:w-max grid grid-cols-2 md:flex gap-2">
      <Button className="max-sm:col-span-2" onClick={clearFilters} variant={"outline"}>
        <FunnelX /> Clear Filters
      </Button>

      <Select
        defaultValue={statusFilter}
        value={statusFilter}
        onValueChange={setStatusFilter}
      >
        <SelectTrigger className="bg-white max-sm:col-span-1 max-sm:max-w-full max-sm:min-w-full">
          <SelectValue placeholder="Filter Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Appointment Filter</SelectLabel>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rebook">Rebooked</SelectItem>
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
            {dateFilter ? dateFilter.toLocaleDateString() : "Date Filter"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={dateFilter}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDateFilter(date);
              // console.log(dateFilter?.toISOString());
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Input
        className="bg-white col-span-full"
        placeholder="Filter by condition..."
        value={conditionFilter}
        onChange={(e) => setConditionFilter(e.target.value)}
      />

      <Button asChild>
        <Link className="col-span-full" href={"/dashboard/appointments/create"}>Book Appointment</Link>
      </Button>
    </div>
  );
};

export default AppointmentFilters;
