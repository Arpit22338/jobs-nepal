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
  faceImageUrl: string;
  createdAt: string;
  teacher: {
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
    qrCodeUrl: string | null;
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Teacher KYC Requests</h1>
        <p className="text-muted-foreground text-sm">{records.length} requests</p>
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Face Verification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="font-medium text-foreground">{record.teacher.name || "Unknown"}</div>
                  <div className="text-sm text-muted-foreground">{record.teacher.email}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-foreground">{record.teacher.phoneNumber || "N/A"}</div>
                </TableCell>
                <TableCell className="capitalize text-foreground">
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
                  {record.faceImageUrl ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" /> View Face
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Face Verification Photo</DialogTitle>
                        </DialogHeader>
                        <div className="relative w-full h-[400px]">
                          <Image
                            src={record.faceImageUrl}
                            alt="Teacher Face"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not uploaded</span>
                  )}
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
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
