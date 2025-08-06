"use client";
import store from "@/store/store";
import axiosInstance from "@/lib/axiosInstance";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { getPatientData, setPatientData } from "@/store/features/patientReducer";
import { toast } from "sonner";

const ReduxProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const patient = store.getState().patient;

  useEffect(() => {
    /*
        fetch patient data from db
        this is a one time fetch to populate the store
        remember to declare types for res
    */
    const user = store.dispatch(getPatientData());
    // axiosInstance
    //   .get("/patient")
    //   .then((res: any) => {
    //     store.dispatch(setPatientData(res.data));
    //   })
    //   .catch((err: any) => {
    //     toast.error("Error fetching patient data", { richColors: true });
    //     console.log("Error fetching patient data:", err);
    //   });
  }, []);
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
