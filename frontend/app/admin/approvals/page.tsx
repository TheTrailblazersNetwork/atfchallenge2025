// app/admin/approvals/page.tsx
// "use client";
// import { Button } from "@/components/ui/button";
// import { DataTable } from "@/components/ui/data-table";
// import { ColumnDef } from "@tanstack/react-table";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import { Badge } from "@/components/ui/badge";

// type User = {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   status: string;
// };

// const columns: ColumnDef<User>[] = [
//   {
//     accessorKey: "firstName",
//     header: "First Name",
//   },
//   {
//     accessorKey: "lastName",
//     header: "Last Name",
//   },
//   {
//     accessorKey: "email",
//     header: "Email",
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => {
//       const status = row.getValue("status");
//       return (
//         <Badge variant={status === "approved" ? "default" : "secondary"}>
//           {status}
//         </Badge>
//       );
//     },
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => {
//       const user = row.original;
      
//       return (
//         <div className="flex space-x-2">
//           <Button
//             size="sm"
//             onClick={() => handleApprove(user.id)}
//             disabled={user.status === "approved"}
//           >
//             Approve
//           </Button>
//         </div>
//       );
//     },
//   },
// ];

// export default function ApprovalPage() {
//   const { data: users, isLoading } = useQuery({
//     queryKey: ["pending-users"],
//     queryFn: async () => {
//       const response = await axios.get("/api/admin/users/pending");
//       return response.data;
//     },
//   });

//   const handleApprove = async (userId: string) => {
//     await axios.put(`/api/admin/users/${userId}/approve`);
//     // Add refetch logic here
//   };

//   return (
//     <div className="container mx-auto py-10">
//       <h1 className="text-2xl font-bold mb-6">Pending Approvals</h1>
//       <DataTable columns={columns} data={users || []} />
//     </div>
//   );
// }