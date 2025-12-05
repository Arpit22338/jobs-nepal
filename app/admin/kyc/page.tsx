"use client";

// Force refresh
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { useToast } from "../../../components/ui/use-toast";
import { Loader2, Check, X, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import Image from "next/image";

interface KycRecord {
  id: string;
  status: string;
  documentType: string;
  frontImageUrl: string;
  backImageUrl: string;
  createdAt: string;
  teacher: {
    name: string | null;
    email: string | null;
  };
}

export default function AdminKycPage() {
  const [records, setRecords] = useState<KycRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/admin/kyc");
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Failed to fetch KYC records", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: `KYC ${status.toLowerCase()}.`,
        });
        fetchRecords();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update KYC status.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Teacher KYC Requests</h1>
      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="font-medium">{record.teacher.name || "Unknown"}</div>
                  <div className="text-sm text-gray-500">{record.teacher.email}</div>
                </TableCell>
                <TableCell className="capitalize">
                  {record.documentType.replace("_", " ")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" /> Front
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Front Document</DialogTitle>
                        </DialogHeader>
                        <div className="relative w-full h-[600px]">
                          <Image
                            src={record.frontImageUrl}
                            alt="Front Document"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" /> Back
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Back Document</DialogTitle>
                        </DialogHeader>
                        <div className="relative w-full h-[600px]">
                          <Image
                            src={record.backImageUrl}
                            alt="Back Document"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      record.status === "APPROVED"
                        ? "default"
                        : record.status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                    }
                    className={
                      record.status === "APPROVED" ? "bg-green-600 hover:bg-green-700" : ""
                    }
                  >
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(record.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {record.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate(record.id, "APPROVED")}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(record.id, "REJECTED")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No KYC requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
