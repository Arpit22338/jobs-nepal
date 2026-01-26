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

interface Enrollment {
  id: string;
  status: string;
  paymentPhone: string | null;
  paymentScreenshotUrl: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
  course: {
    title: string;
    price: number | null;
    priceNpr: number | null;
  };
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEnrollments = async () => {
    try {
      const res = await fetch("/api/admin/enrollments");
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error("Failed to fetch enrollments", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: `Enrollment ${status.toLowerCase()}.`,
        });
        fetchEnrollments();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update enrollment status.",
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
        <h1 className="text-2xl font-bold text-foreground">Course Enrollments</h1>
        <p className="text-muted-foreground text-sm">{enrollments.length} enrollments</p>
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Payment Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => (
              <TableRow key={enrollment.id}>
                <TableCell>
                  <div className="font-medium text-foreground">{enrollment.user.name || "Unknown"}</div>
                  <div className="text-sm text-muted-foreground">{enrollment.user.email}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{enrollment.course.title}</div>
                  <div className="text-sm text-muted-foreground">
                    NPR {enrollment.course.price || enrollment.course.priceNpr || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-foreground">Phone: {enrollment.paymentPhone || "N/A"}</div>
                  {enrollment.paymentScreenshotUrl && (
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
                            src={enrollment.paymentScreenshotUrl}
                            alt="Payment Screenshot"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      enrollment.status === "APPROVED"
                        ? "default" // "success" variant doesn't exist in default shadcn, using default (primary) or secondary
                        : enrollment.status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                    }
                    className={
                      enrollment.status === "APPROVED" ? "bg-green-600 hover:bg-green-700" : ""
                    }
                  >
                    {enrollment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(enrollment.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {enrollment.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate(enrollment.id, "APPROVED")}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(enrollment.id, "REJECTED")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {enrollments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No enrollment requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
