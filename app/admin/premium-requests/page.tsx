"use client";

import { useEffect, useState } from "react";

interface PremiumRequest {
  id: string;
  user: {
    name: string;
    email: string;
  };
  planType: string;
  amount: number;
  screenshotUrl: string;
  phoneNumber?: string;
  status: string;
  createdAt: string;
}

export default function PremiumRequestsPage() {
  const [requests, setRequests] = useState<PremiumRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/premium-requests");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (!confirm(`Are you sure you want to ${status} this request?`)) return;
    
    try {
      const res = await fetch("/api/admin/premium-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      
      if (res.ok) {
        fetchRequests();
      } else {
        alert("Action failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error performing action");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading requests...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Premium Requests</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 text-left text-sm font-semibold text-gray-600">User</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Plan</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Amount</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Phone</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Screenshot</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">No requests found</td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium">{req.user.name}</div>
                    <div className="text-sm text-gray-500">{req.user.email}</div>
                  </td>
                  <td className="p-4 text-sm">{req.planType}</td>
                  <td className="p-4 text-sm">Rs. {req.amount}</td>
                  <td className="p-4 text-sm font-mono">{req.phoneNumber || "N/A"}</td>
                  <td className="p-4 text-sm">
                    <a 
                      href={req.screenshotUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      View Image
                    </a>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      req.status === "APPROVED" ? "bg-green-100 text-green-800" :
                      req.status === "REJECTED" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {req.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAction(req.id, "APPROVED")} 
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, "REJECTED")} 
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
