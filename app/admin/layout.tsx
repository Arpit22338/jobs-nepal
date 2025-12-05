import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <nav className="flex gap-6 overflow-x-auto">
            <Link href="/admin/dashboard" className="py-4 text-sm font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 whitespace-nowrap">
              Dashboard
            </Link>
            <Link href="/admin/premium-requests" className="py-4 text-sm font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 whitespace-nowrap">
              Premium Requests
            </Link>
            <Link href="/admin/teacher-activation" className="py-4 text-sm font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 whitespace-nowrap">
              Teacher Activation
            </Link>
            <Link href="/admin/kyc" className="py-4 text-sm font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 whitespace-nowrap">
              KYC
            </Link>
            <Link href="/admin/users" className="py-4 text-sm font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 whitespace-nowrap">
              Users & Bans
            </Link>
            <Link href="/admin/support" className="py-4 text-sm font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 whitespace-nowrap">
              Support Tickets
            </Link>
            <Link href="/admin/reports" className="py-4 text-sm font-medium text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 whitespace-nowrap">
              Reports
            </Link>
          </nav>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-10">
        {children}
      </div>
    </div>
  );
}
