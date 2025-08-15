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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/lib/axiosInstance";
import { Ban, BrushCleaning, Bubbles, CheckCheck, PersonStanding } from "lucide-react";
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
  const [isSkipping, setIsSkipping] = useState(false);

  // localStorage utility functions
  const saveQueuesToLocalStorage = (
    queueData: QueueItem[],
    completedData: QueueItem[],
    unavailableData: QueueItem[]
  ) => {
    try {
      localStorage.setItem('opd_queue', JSON.stringify(queueData));
      localStorage.setItem('opd_completed_patients', JSON.stringify(completedData));
      localStorage.setItem('opd_unavailable_patients', JSON.stringify(unavailableData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadQueuesFromLocalStorage = () => {
    try {
      const savedQueue = localStorage.getItem('opd_queue');
      const savedCompleted = localStorage.getItem('opd_completed_patients');
      const savedUnavailable = localStorage.getItem('opd_unavailable_patients');

      return {
        queue: savedQueue ? JSON.parse(savedQueue) : [],
        completed: savedCompleted ? JSON.parse(savedCompleted) : [],
        unavailable: savedUnavailable ? JSON.parse(savedUnavailable) : []
      };
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return { queue: [], completed: [], unavailable: [] };
    }
  };

  const processQueueData = (data: QueueItem[], savedUnavailable: QueueItem[]) => {
    const activeQueue: QueueItem[] = [];
    const completedFromQueue: QueueItem[] = [];

    console.log('Processing queue data:', {
      totalFromAPI: data.length,
      savedUnavailable: savedUnavailable.length,
      unavailableIds: savedUnavailable.map(u => u.id)
    });

    data.forEach(item => {
      // Check if this patient is in the saved unavailable list
      const isUnavailable = savedUnavailable.some((unavailable: QueueItem) => unavailable.id === item.id);
      
      if (item.completed_time) {
        // If it has completed_time, move to completed list
        completedFromQueue.push({
          ...item,
          status: "completed"
        });
        console.log(`Patient ${item.id} moved to completed (has completed_time)`);
      } else if (!isUnavailable) {
        // Only keep in active queue if not marked as unavailable locally
        activeQueue.push(item);
      } else {
        console.log(`Patient ${item.id} filtered out (marked as unavailable locally)`);
      }
      // If isUnavailable is true, we skip adding it to activeQueue (it stays filtered out)
    });

    console.log('Queue processing result:', {
      activeQueue: activeQueue.length,
      completedFromQueue: completedFromQueue.length
    });

    return { activeQueue, completedFromQueue };
  };

  useEffect(() => {
    // Load saved data from localStorage first
    const savedData = loadQueuesFromLocalStorage();
    console.log('Loaded from localStorage:', {
      queue: savedData.queue.length,
      completed: savedData.completed.length,
      unavailable: savedData.unavailable.length
    });
    
    setCompletedPatients(savedData.completed);
    setUnavailablePatients(savedData.unavailable);

    // Fetch fresh data from API
    axiosInstance
      .get(system_api.opd.queue.getAll)
      .then((res) => {
        console.log(res);
        const { activeQueue, completedFromQueue } = processQueueData(res.data.data, savedData.unavailable);
        
        // Merge completed patients from API with saved ones
        const mergedCompleted = [
          ...savedData.completed,
          ...completedFromQueue.filter(item => 
            !savedData.completed.some((saved: QueueItem) => saved.id === item.id)
          )
        ];

        setQueue(activeQueue);
        setCurrentPatient(activeQueue[0] || null);
        setCompletedPatients(mergedCompleted);

        // Save updated data to localStorage
        saveQueuesToLocalStorage(activeQueue, mergedCompleted, savedData.unavailable);
      })
      .catch((err) => {
        console.error("Error fetching queue:", err);
        // On error, use saved data from localStorage
        if (savedData.queue.length > 0) {
          setQueue(savedData.queue);
          setCurrentPatient(savedData.queue[0] || null);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const skipPatient = () => {
    if (queue.length > 1 && !isSkipping) {
      setIsSkipping(true);

      // Start the animation
      setTimeout(() => {
        let newQueue: QueueItem[] = [];
        
        setQueue((prevQueue) => {
          newQueue = [...prevQueue];
          [newQueue[0], newQueue[1]] = [newQueue[1], newQueue[0]];
          return newQueue;
        });
        setCurrentPatient(queue[1]);

        // Save to localStorage after state update
        setTimeout(() => {
          saveQueuesToLocalStorage(newQueue, completedPatients, unavailablePatients);
        }, 0);

        // Reset animation state after a short delay
        setTimeout(() => {
          setIsSkipping(false);
        }, 300);
      }, 150);
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

      let newQueue: QueueItem[] = [];
      let newUnavailableList: QueueItem[] = [];

      // Remove first patient from queue
      setQueue((prevQueue) => {
        newQueue = [...prevQueue];
        newQueue.shift(); // Remove first patient
        return newQueue;
      });

      // Add to unavailable patients
      setUnavailablePatients((prev) => {
        newUnavailableList = [...prev, updatedUnavailablePatient];
        return newUnavailableList;
      });

      // Update current patient
      setCurrentPatient(queue[1] || null);
      setIsUnavailableDialogOpen(false); // Close dialog after action

      // Save to localStorage after state updates
      setTimeout(() => {
        saveQueuesToLocalStorage(newQueue, completedPatients, newUnavailableList);
      }, 0);
    }
  };

  const markAsCompleted = async () => {
    if (queue.length > 0) {
      const completedPatient = queue[0]; // Get the first patient

      try {
        // Call backend API to mark patient as completed
        const response = await axiosInstance.post(
          `${system_api.opd.queue.complete}${completedPatient.id}/complete`
        );

        if (response.data.success) {
          // Update the patient's status and completion time from backend response
          const updatedCompletedPatient = {
            ...completedPatient,
            status: "completed",
            completed_time: response.data.data.queueEntry.completed_time,
          };

          let newQueue: QueueItem[] = [];
          let newCompletedList: QueueItem[] = [];

          // Remove first patient from queue
          setQueue((prevQueue) => {
            newQueue = [...prevQueue];
            newQueue.shift(); // Remove first patient
            return newQueue;
          });

          // Add to completed patients
          setCompletedPatients((prev) => {
            newCompletedList = [...prev, updatedCompletedPatient];
            return newCompletedList;
          });

          // Update current patient
          setCurrentPatient(queue[1] || null);
          setIsCompletedDialogOpen(false); // Close dialog after action

          // Save to localStorage after state updates
          setTimeout(() => {
            saveQueuesToLocalStorage(newQueue, newCompletedList, unavailablePatients);
          }, 0);

          console.log('Patient marked as completed successfully:', response.data);
        }
      } catch (error) {
        console.error('Error marking patient as completed:', error);
        // You might want to show an error message to the user here
        // For now, we'll still update the UI optimistically
        const updatedCompletedPatient = {
          ...completedPatient,
          status: "completed",
          completed_time: new Date().toISOString(),
        };

        let newQueue: QueueItem[] = [];
        let newCompletedList: QueueItem[] = [];

        setQueue((prevQueue) => {
          newQueue = [...prevQueue];
          newQueue.shift();
          return newQueue;
        });

        setCompletedPatients((prev) => {
          newCompletedList = [...prev, updatedCompletedPatient];
          return newCompletedList;
        });

        setCurrentPatient(queue[1] || null);
        setIsCompletedDialogOpen(false);

        // Save to localStorage even on error
        setTimeout(() => {
          saveQueuesToLocalStorage(newQueue, newCompletedList, unavailablePatients);
        }, 0);
      }
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

    let newQueue: QueueItem[] = [];
    let newUnavailableList: QueueItem[] = [];

    // Remove from unavailable patients
    setUnavailablePatients((prev) => {
      newUnavailableList = prev.filter((p) => p.id !== patientId);
      return newUnavailableList;
    });

    // Add to queue at position 1 (next up) and shift others
    setQueue((prevQueue) => {
      newQueue = [...prevQueue];
      newQueue.splice(1, 0, restoredPatient); // Insert at position 1
      return newQueue;
    });

    // Update current patient if queue was empty
    if (queue.length === 0) {
      setCurrentPatient(restoredPatient);
    }

    // Save to localStorage after state updates
    setTimeout(() => {
      saveQueuesToLocalStorage(newQueue, completedPatients, newUnavailableList);
    }, 0);
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
      <style jsx>{`
        @keyframes slideOutRight {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutLeft {
          0% {
            transform: translateX(0);
            opacity: 0.8;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }

        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 0.8;
          }
        }

        .queue-transition {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .skip-button-pulse {
          animation: pulse 0.3s ease-in-out;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
      {loading ? (
        <PageFull>
          <PageLoading title="Getting Queue" />
        </PageFull>
      ) : (queue ||
        completedPatients ||
        unavailablePatients) &&
        (queue.length > 0 ||
        unavailablePatients.length > 0 ||
        completedPatients.length > 0) ? (
        <>
          <div>
            <DashboardPageHeader
              title="Queue Dashboard"
              subtitle="Manage and monitor patient queue"
            />

            {/* In Progress - First item */}
            <div
              className={`grid grid-cols-2 gap-4 queue-transition ${
                isSkipping ? "transform scale-[0.99]" : ""
              }`}
            >
              {queue.length > 0 && (
                <div
                  key={queue[0].appointment_id}
                  className={`my-5 queue-transition ${
                    isSkipping
                      ? "transform translate-x-full opacity-0 scale-95"
                      : "transform translate-x-0 opacity-100 scale-100"
                  }`}
                >
                  <div className="p-4 border rounded-lg nf-glass-bg shadow-md queue-transition hover:shadow-lg">
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
                            {queue[0].visiting_status.split("_").join(" ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="font-semibold text-sm text-muted-foreground">
                        Medical Description:
                      </p>
                      <p
                        className={`queue-transition ${
                          isSkipping ? "opacity-60" : ""
                        }`}
                      >
                        {queue[0].medical_description}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="mr-auto">
                        <Button
                          onClick={skipPatient}
                          disabled={isSkipping || queue.length <= 1}
                          className={`cursor-pointer !bg-zinc-700 hover:!bg-zinc-500 !text-white queue-transition ${
                            isSkipping
                              ? "opacity-50 transform scale-95 skip-button-pulse"
                              : "hover:scale-105"
                          }`}
                          variant="outline"
                          size={"sm"}
                        >
                          {isSkipping ? (
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                              Skipping...
                            </span>
                          ) : (
                            "Skip Patient"
                          )}
                        </Button>
                      </div>

                      <Dialog
                        open={isUnavailableDialogOpen}
                        onOpenChange={setIsUnavailableDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            className="flex items-center justify-center gap-2 cursor-pointer !bg-red-900 hover:!bg-red-700 !text-white !transition-colors"
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
                            className="flex items-center justify-center gap-2 cursor-pointer !bg-green-700 hover:!bg-green-500 !text-white !transition-colors"
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
                <div
                  key={queue[1].appointment_id}
                  className={`my-auto opacity-80 queue-transition ${
                    isSkipping
                      ? "transform -translate-x-full opacity-0 scale-95"
                      : "transform translate-x-0 opacity-80 scale-100"
                  }`}
                >
                  <div className="p-4 border rounded-lg nf-glass-bg h-full shadow-md queue-transition hover:shadow-lg">
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
                            Visiting:{" "}
                            {queue[1].visiting_status.split("_").join(" ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="font-semibold text-sm text-muted-foreground">
                        Medical Description:
                      </p>
                      <p
                        className={`queue-transition ${
                          isSkipping ? "opacity-60" : ""
                        }`}
                      >
                        {queue[0].medical_description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Patients - First two items */}

            {/* Upcoming Patients - Rest of the items */}
            {queue.length > 2 && (
              <div
                className={`bg-white border rounded-lg shadow-sm p-4 mb-5 queue-transition ${
                  isSkipping
                    ? "transform translate-y-1 opacity-75"
                    : "hover:shadow-md"
                }`}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-3">
                  Upcoming Patients
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Gender & Age</TableHead>
                      <TableHead>Medical Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Visit Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.slice(2).map((item, index) => (
                      <TableRow
                        key={item.appointment_id}
                        className={`queue-transition hover:bg-gray-50 ${
                          isSkipping
                            ? "transform translate-y-0.5 opacity-80"
                            : ""
                        }`}
                        style={{
                          transitionDelay: isSkipping
                            ? `${index * 30}ms`
                            : "0ms",
                        }}
                      >
                        <TableCell className="font-medium">
                          {item.patient_first_name} {item.patient_last_name}
                        </TableCell>
                        <TableCell className="capitalize">
                          {item.patient_gender} • {item.patient_age} Years
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {item.medical_description}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell>{item.queue_position}</TableCell>
                        <TableCell>{item.priority_rank}</TableCell>
                        <TableCell>{item.severity_score}</TableCell>
                        <TableCell>
                          {item.visiting_status.replace("_", " ")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Served Patients - Completed patients */}
              {completedPatients.length > 0 && (
                <div>
                  <div className="nf-glass-bg p-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                      Served Patients
                    </h2>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient Name</TableHead>
                          <TableHead>Gender & Age</TableHead>
                          <TableHead>Completed Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedPatients.map((item) => (
                          <TableRow key={`completed-${item.appointment_id}`}>
                            <TableCell className="font-medium">
                              {item.patient_first_name} {item.patient_last_name}
                            </TableCell>
                            <TableCell>
                              {item.patient_gender} • Age {item.patient_age}
                            </TableCell>
                            <TableCell>
                              {item.completed_time
                                ? new Date(item.completed_time).toLocaleString()
                                : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Unavailable Patients */}
              {unavailablePatients.length > 0 && (
                <div>
                  <div className="nf-glass-bg p-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                      Unavailable Patients
                    </h2>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient Name</TableHead>
                          <TableHead>Queue No.</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unavailablePatients.map((item) => (
                          <TableRow key={`unavailable-${item.id}`}>
                            <TableCell className="font-medium">
                              {item.patient_first_name} {item.patient_last_name}
                            </TableCell>
                            <TableCell>{item.queue_position}</TableCell>
                            <TableCell className="p-0">
                              <Button
                                onClick={() => markAsAvailable(item.id)}
                                className="flex items-center justify-center gap-2 cursor-pointer"
                                variant="outline"
                                size="sm"
                              >
                                <PersonStanding className="h-4 w-4" />
                                Now Available
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="dashboard-page">
          <DashboardPageHeader
            title="Queue Dashboard"
            subtitle="Manage and monitor patient queue"
          />
          <div className="nf-glass-bg !py-36 flex flex-col items-center justify-center text-muted-foreground">
            <BrushCleaning size={70} />
            {/* <h2 className="text-2xl font-bold">Emtpy Queue</h2> */}
            <p className="text-muted-foreground mt-3">
              Queue Currently Empty
            </p>
            <p className="text-sm">There are currently no patients in the queue</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
