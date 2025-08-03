"use client";
import { useState } from "react";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CircleCheckBig } from "lucide-react";
import Link from "next/link";

const steps = [1, 2, 3];

const CreateAppointmentSteps = () => {
  const [activeStep, setActiveStep] = useState(1);

  // States for step 1
  const [visiting, setVisiting] = useState("");
  const [condition, setCondition] = useState("");
  const [dischargeType, setDischargeType] = useState("");

  const restartBooking = () => {
    setActiveStep(1);
    setVisiting("");
    setCondition("");
    setDischargeType("");
  };

  return (
    <div className="w-full lg:w-[800px] mx-auto bg-white rounded-lg p-5 md:p-10 shadow border-2">
      <Stepper defaultValue={activeStep} value={activeStep} className="w-full">
        {steps.map((step) => (
          <StepperItem key={step} step={step} className="not-last:flex-1">
            <StepperTrigger>
              {/* <StepperIndicator onClick={() => setActiveStep(step)} /> */}
              <StepperIndicator />
            </StepperTrigger>
            {step < steps.length && <StepperSeparator />}
          </StepperItem>
        ))}
      </Stepper>
      <div>
        <div className="pt-5">
          <h3 className="flex gap-2 items-center text-lg font-semibold">
            {/* {activeStep !== 1 && (
                <Button
                  variant="ghost"
                  onClick={() => setActiveStep(activeStep - 1)}
                >
                  <ArrowLeft />
                </Button>
              )} */}
            {activeStep === 1
              ? "Medical Condition"
              : activeStep === 2
              ? "Review Information"
              : ""}
          </h3>
        </div>

        {/*
          
          
          STEP 1
          
          
          */}

        {activeStep === 1 && (
          <form
            className="pb-5"
            onSubmit={(e) => {
              e.preventDefault();
              setActiveStep(activeStep + 1);
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 my-5 gap-5">
              <div className="grid gap-2">
                <Label htmlFor="visiting">Visiting Status</Label>
                <Select
                  defaultValue={visiting}
                  onValueChange={setVisiting}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select visiting status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discharged_inpatient">
                      Discharged Inpatient
                    </SelectItem>
                    <SelectItem value="external_referral">
                      External referrals (1st timers)
                    </SelectItem>
                    <SelectItem value="internal_referral">
                      Internal referrals (1st timers)
                    </SelectItem>
                    <SelectItem value="review_patient">
                      Review patients (Old patients)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="condition">Medical Condition</Label>
                <Textarea
                  id="condition"
                  placeholder="Describe your medical condition"
                  rows={10}
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  required
                />
              </div>
              {visiting === "discharged_inpatient" && (
                <div className="grid gap-2">
                  <Label htmlFor="gender">Discharge Type</Label>
                  <Select
                    required
                    defaultValue={dischargeType}
                    onValueChange={setDischargeType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select discharge type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discharged_inpatient_1week">
                        Discharged Inpatients (1 week early review)
                      </SelectItem>
                      <SelectItem value="discharged_inpatient_2weeks">
                        Discharged Inpatients ( 2 weeks post discharge)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button
              className="block w-full md:w-max md:ml-auto cursor-pointer"
              disabled={
                !visiting ||
                !condition ||
                (visiting === "discharged_inpatient" && !dischargeType)
              }
              type="submit"
            >
              Continue
            </Button>
          </form>
        )}

        {/*
          
          
          STEP 2 
          
          
          */}

        {activeStep === 2 && (
          <form
            className="pb-5"
            onSubmit={(e) => {
              e.preventDefault();
              setActiveStep(activeStep + 1);
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 my-5 gap-5">
              <div className="grid bg-zinc-100 rounded-lg p-4 gap-4 grid-cols-2 md:grid-cols-3 col-span-full">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-sm font-medium truncate" title="John Doe">
                    John Doe
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="text-sm font-medium">+1234567890</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p
                    className="text-sm font-medium truncate"
                    title="anthonysaah589@gmail.com"
                  >
                    anthonysaah589@gmail.com
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="text-sm font-medium">Male</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="text-sm font-medium">25 Years</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Comm. Preference
                  </p>
                  <p className="text-sm font-medium">Email & SMS</p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Visiting Status</Label>
                <Select disabled>
                  <SelectTrigger className="w-full disabled:opacity-80">
                    <SelectValue
                      placeholder={
                        visiting === "discharged_inpatient"
                          ? "Discharged Inpatient"
                          : visiting === "external_referral"
                          ? "External referrals (1st timers)"
                          : visiting === "internal_referral"
                          ? "Internal referrals (1st timers)"
                          : visiting === "review_patient"
                          ? "Review patients (Old patients)"
                          : ""
                      }
                    />
                  </SelectTrigger>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Medical Condition</Label>
                <Textarea rows={10} value={condition} disabled />
              </div>
              {visiting === "discharged_inpatient" && (
                <div className="grid gap-2">
                  <Label>Discharge Type</Label>
                  <Select disabled>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          dischargeType === "discharged_inpatient_1week"
                            ? "Discharged Inpatients (1 week early review)"
                            : dischargeType === "discharged_inpatient_2weeks"
                            ? "Discharged Inpatients (2 weeks post discharge)"
                            : ""
                        }
                      />
                    </SelectTrigger>
                  </Select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:flex w-full justify-end gap-2">
              <Button
                className="cursor-pointer"
                onClick={() => setActiveStep(activeStep - 1)}
                type="button"
              >
                Go Back
              </Button>
              <Button className="cursor-pointer" type="submit">
                Confirm
              </Button>
            </div>
          </form>
        )}

        {/*
          
          
          STEP 3
          
          
          */}

        {activeStep === 3 && (
          <div className="pb-5">
            <div className="flex items-center justify-center my-5">
              <CircleCheckBig className="text-green-700" size={100} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-700">
                Appointment Confirmed!
              </h3>
              <p className="text-sm text-muted-foreground">
                Thank you for booking your appointment. We will contact you
                shortly with further details.
              </p>
            </div>
            <div className="grid md:flex w-full md:justify-end gap-2 mt-5">
              <Button className="cursor-pointer" onClick={restartBooking}>
                Book Another Appointment
              </Button>
              <Button className="cursor-pointer" variant="outline" asChild>
                <Link href={"/dashboard"}>Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAppointmentSteps;
