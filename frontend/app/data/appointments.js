const appointments = [
    {
        id: 1,
        patientName: "John Doe",
        created_at: "2024-06-01T10:00:00.000Z",
        updated_at: "2024-06-01T10:30:00.000Z",
        status: "pending",
        condition: "Flu",
    },
    {
        id: 2,
        patientName: "Jane Smith",
        created_at: "2024-06-01T11:00:00.000Z",
        updated_at: "2024-06-01T11:45:00.000Z",
        status: "approved",
        condition: "Cold",
    },
    {
        id: 3,
        patientName: "Henry Clark",
        created_at: "2024-06-01T10:30:00.000Z",
        updated_at: "2024-06-01T11:00:00.000Z",
        status: "rebooked",
        condition: "Sinus Infection",
    },
    {
        id: 4,
        patientName: "Alice Johnson",
        created_at: "2024-06-01T12:00:00.000Z",
        updated_at: "2024-06-01T12:30:00.000Z",
        status: "cancelled",
        condition: "Headache",
    },
];

export default appointments;
