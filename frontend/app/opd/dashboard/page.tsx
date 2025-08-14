"use client";
import system_api from "@/app/data/api";
import DashboardPageHeader from "@/components/dashboard/page-header";
import PageFull from "@/components/Page-Full";
import PageLoading from "@/components/Page-Loading";
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
import axiosInstance from "@/lib/axiosInstance";
import { Ban, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface QueueItem {
  id: number;
  appointment_id: string;
  patient_id: string;
  queue_position: number;
  status: string;
  completed_time: string | null;
  created_at: string;
  updated_at: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_gender: string;
  patient_age: string;
  medical_description: string;
  visiting_status: string;
  priority_rank: number;
  severity_score: string;
}

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentPatient, setCurrentPatient] = useState<QueueItem | null>(null);
  const [completedPatients, setCompletedPatients] = useState<QueueItem[]>([]);
  const [unavailablePatients, setUnavailablePatients] = useState<QueueItem[]>(
    []
  );
  const [isUnavailableDialogOpen, setIsUnavailableDialogOpen] = useState(false);
  const [isCompletedDialogOpen, setIsCompletedDialogOpen] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(system_api.opd.queue.getAll)
      .then((res) => {
        console.log(res);
        setQueue(res.data.data);
        setCurrentPatient(res.data.data[0] || null);
      })
      .catch((err) => {
        console.error("Error fetching queue:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const skipPatient = () => {
    if (queue.length > 1) {
      setQueue((prevQueue) => {
        const newQueue = [...prevQueue];
        [newQueue[0], newQueue[1]] = [newQueue[1], newQueue[0]];
        return newQueue;
      });
      setCurrentPatient(queue[1]);
    }
  };

  const markAsUnavailable = () => {
    if (queue.length > 0) {
      const unavailablePatient = queue[0]; // Get the first patient

      // Update the patient's status
      const updatedUnavailablePatient = {
        ...unavailablePatient,
        status: "unavailable",
      };

      // Remove first patient from queue
      setQueue((prevQueue) => {
        const newQueue = [...prevQueue];
        newQueue.shift(); // Remove first patient
        return newQueue;
      });

      // Add to unavailable patients
      setUnavailablePatients((prev) => [...prev, updatedUnavailablePatient]);

      // Update current patient
      setCurrentPatient(queue[1] || null);
      setIsUnavailableDialogOpen(false); // Close dialog after action
    }
  };

  const markAsCompleted = () => {
    if (queue.length > 0) {
      const completedPatient = queue[0]; // Get the first patient

      // Update the patient's status and completion time
      const updatedCompletedPatient = {
        ...completedPatient,
        status: "completed",
        completed_time: new Date().toISOString(),
      };

      // Remove first patient from queue
      setQueue((prevQueue) => {
        const newQueue = [...prevQueue];
        newQueue.shift(); // Remove first patient
        return newQueue;
      });

      // Add to completed patients
      setCompletedPatients((prev) => [...prev, updatedCompletedPatient]);

      // Update current patient
      setCurrentPatient(queue[1] || null);
      setIsCompletedDialogOpen(false); // Close dialog after action
    }
  };

  const markAsAvailable = (patientId: number) => {
    // Find the patient in unavailable list
    const patientToRestore = unavailablePatients.find(
      (p) => p.id === patientId
    );
    if (!patientToRestore) return;

    // Update patient status back to original
    const restoredPatient = {
      ...patientToRestore,
      status: "approved", // or whatever the original status should be
    };

    // Remove from unavailable patients
    setUnavailablePatients((prev) => prev.filter((p) => p.id !== patientId));

    // Add to queue at position 1 (next up) and shift others
    setQueue((prevQueue) => {
      const newQueue = [...prevQueue];
      newQueue.splice(1, 0, restoredPatient); // Insert at position 1
      return newQueue;
    });

    // Update current patient if queue was empty
    if (queue.length === 0) {
      setCurrentPatient(restoredPatient);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="dashboard-page">
      {loading ? (
        <PageFull>
          <PageLoading title="Getting Queue" />
        </PageFull>
      ) : (queue || completedPatients || unavailablePatients) && (queue.length > 0 || unavailablePatients.length > 0 || completedPatients.length > 0) ? (
        <>
          <div>
            <DashboardPageHeader
              title="Queue Dashboard"
              subtitle="Manage and monitor patient queue"
            />

            {/* In Progress - First item */}
            <div className="grid grid-cols-2 gap-4">
              {queue.length > 0 && (
                <div key={queue[0].appointment_id} className="my-5">
                  <div className="p-4 border rounded-lg nf-glass-bg shadow-md">
                    <h2 className="float-right uppercase text-sm ml-auto border-2 bg-cyan-200 text-cyan-800 rounded font-medium py-1 px-3 w-max mb-3">
                      In Progress
                    </h2>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {queue[0].patient_first_name}{" "}
                          {queue[0].patient_last_name}
                        </h3>
                        <p className="capitalize text-base text-gray-600">
                          {queue[0].patient_gender} • Age {queue[0].patient_age}
                        </p>
                        <div className="flex items-center gap-2 my-2">
                          <span
                            className={`capitalize px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              queue[0].status
                            )}`}
                          >
                            Queue Position: #{queue[0].queue_position}
                          </span>
                          <span
                            className={`capitalize px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              queue[0].status
                            )}`}
                          >
                            {queue[0].status}
                          </span>
                          <span
                            className={`capitalize px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              queue[0].status
                            )}`}
                          >
                            {queue[0].visiting_status.replace("_", " ")} Patient
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="font-semibold text-sm text-muted-foreground">
                        Medical Description:
                      </p>
                      <p className="">{queue[0].medical_description}</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="mr-auto">
                        <Button
                          onClick={skipPatient}
                          className="cursor-pointer"
                          variant="outline"
                          size={"sm"}
                        >
                          Skip Patient
                        </Button>
                      </div>

                      <Dialog
                        open={isUnavailableDialogOpen}
                        onOpenChange={setIsUnavailableDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            className="flex items-center justify-center gap-2 cursor-pointer"
                            variant="outline"
                            size={"sm"}
                          >
                            <Ban />
                            Unavailable
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Mark Patient as Unavailable
                            </DialogTitle>
                            <DialogDescription>
                              Are you sure you want to mark{" "}
                              <strong>
                                {queue[0]?.patient_first_name}{" "}
                                {queue[0]?.patient_last_name}
                              </strong>{" "}
                              as unavailable? This will move them to the end of
                              the queue.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsUnavailableDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={markAsUnavailable}
                              className="flex items-center gap-2"
                            >
                              <Ban className="h-4 w-4" />
                              Mark as Unavailable
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={isCompletedDialogOpen}
                        onOpenChange={setIsCompletedDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            className="flex items-center justify-center gap-2 cursor-pointer"
                            variant="outline"
                            size={"sm"}
                          >
                            <CheckCheck />
                            Completed
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Mark Patient as Completed</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to mark{" "}
                              <strong>
                                {queue[0]?.patient_first_name}{" "}
                                {queue[0]?.patient_last_name}
                              </strong>{" "}
                              as completed? This will move them to the served
                              patients list.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsCompletedDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="default"
                              onClick={markAsCompleted}
                              className="flex items-center gap-2"
                            >
                              <CheckCheck className="h-4 w-4" />
                              Mark as Completed
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Up - Second item */}
              {queue.length > 1 && (
                <div key={queue[1].appointment_id} className="my-auto opacity-80">
                  <div className="p-4 border rounded-lg nf-glass-bg h-full shadow-md">
                    <h2 className="float-right text-sm ml-auto border-2 bg-cyan-200 text-cyan-800 rounded font-medium py-1 px-3 w-max">
                      Up Next
                    </h2>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {queue[1].patient_first_name}{" "}
                          {queue[1].patient_last_name}
                        </h3>
                        <p className="capitalize text-base text-gray-600">
                          {queue[1].patient_gender} • Age {queue[1].patient_age}
                        </p>
                        <div className="flex items-center gap-2 my-2">
                          <span
                            className={`capitalize px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              queue[1].status
                            )}`}
                          >
                            {queue[1].status}
                          </span>
                          <span
                            className={`capitalize px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              queue[1].status
                            )}`}
                          >
                            {queue[1].visiting_status.replace("_", " ")} Patient
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="font-semibold text-sm text-muted-foreground">
                        Medical Description:
                      </p>
                      <p className="">{queue[0].medical_description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Patients - First two items */}

            {/* Upcoming Patients - Rest of the items */}
            {queue.length > 2 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  Upcoming Patients
                </h2>
                {queue.slice(2).map((item) => (
                  <div
                    key={item.appointment_id}
                    className="my-3 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.patient_first_name} {item.patient_last_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.patient_gender} • Age {item.patient_age}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          Position: {item.queue_position}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Medical Description:
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.medical_description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Visit Status:</span>
                        <p>{item.visiting_status.replace("_", " ")}</p>
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span>
                        <p>{item.priority_rank}</p>
                      </div>
                      <div>
                        <span className="font-medium">Severity:</span>
                        <p>{item.severity_score}</p>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <p>{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Served Patients - Completed patients */}
            {completedPatients.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  Served Patients
                </h2>
                {completedPatients.map((item) => (
                  <div
                    key={`completed-${item.appointment_id}`}
                    className="my-3 p-4 border rounded-lg bg-green-50 border-green-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.patient_first_name} {item.patient_last_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.patient_gender} • Age {item.patient_age}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                        {item.completed_time && (
                          <p className="text-sm text-gray-500 mt-1">
                            Completed:{" "}
                            {new Date(item.completed_time).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Medical Description:
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.medical_description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Visit Status:</span>
                        <p>{item.visiting_status.replace("_", " ")}</p>
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span>
                        <p>{item.priority_rank}</p>
                      </div>
                      <div>
                        <span className="font-medium">Severity:</span>
                        <p>{item.severity_score}</p>
                      </div>
                      <div>
                        <span className="font-medium">Original Position:</span>
                        <p>{item.queue_position}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Unavailable Patients */}
            {unavailablePatients.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  Unavailable Patients
                </h2>
                {unavailablePatients.map((item) => (
                  <div
                    key={`unavailable-${item.id}`}
                    className="my-3 p-4 border rounded-lg bg-red-50 border-red-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.patient_first_name} {item.patient_last_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.patient_gender} • Age {item.patient_age}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          Original Position: {item.queue_position}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Medical Description:
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.medical_description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500 mb-4">
                      <div>
                        <span className="font-medium">Visit Status:</span>
                        <p>{item.visiting_status.replace("_", " ")}</p>
                      </div>
                      <div>
                        <span className="font-medium">Priority:</span>
                        <p>{item.priority_rank}</p>
                      </div>
                      <div>
                        <span className="font-medium">Severity:</span>
                        <p>{item.severity_score}</p>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <p>{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => markAsAvailable(item.id)}
                        className="flex items-center justify-center gap-2 cursor-pointer"
                        variant="default"
                      >
                        <CheckCheck className="h-4 w-4" />
                        Mark as Available
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <p>No Items in the queue</p>
      )}
    </div>
  );
};

export default Page;
