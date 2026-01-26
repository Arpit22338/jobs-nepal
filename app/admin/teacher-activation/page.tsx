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

interface ActivationRequest {
  id: string;
  status: string;
  paymentPhone: string;
  paymentScreenshotUrl: string;
  createdAt: string;
  teacher: {
    name: string | null;
    email: string | null;
  };
}

export default function TeacherActivationPage() {
  const [requests, setRequests] = useState<ActivationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/teacher-activation");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/teacher-activation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: `Request ${status.toLowerCase()}.`,
        });
        fetchRequests();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update request status.",
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
        <h1 className="text-2xl font-bold text-foreground">Teacher Activation Requests</h1>
        <p className="text-muted-foreground text-sm">{requests.length} requests</p>
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Payment Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <div className="font-medium text-foreground">{req.teacher.name || "Unknown"}</div>
                  <div className="text-sm text-muted-foreground">{req.teacher.email}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-foreground">Phone: {req.paymentPhone}</div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                        <Eye className="w-3 h-3 mr-1" /> View Screenshot
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Payment Screenshot</DialogTitle>
                      </DialogHeader>
                      <div className="relative w-full h-[600px]">
                        <Image
                          src={req.paymentScreenshotUrl}
                          alt="Payment Screenshot"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      req.status === "APPROVED"
                        ? "default"
                        : req.status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                    }
                    className={
                      req.status === "APPROVED" ? "bg-green-600 hover:bg-green-700" : ""
                    }
                  >
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground">
                  {new Date(req.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {req.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate(req.id, "APPROVED")}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No activation requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
