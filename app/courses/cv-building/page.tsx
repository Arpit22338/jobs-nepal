import Link from "next/link";
import { ArrowLeft, CheckCircle, FileText, PenTool, Layout } from "lucide-react";

export default function CVCoursePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/courses" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Back to Courses
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-8">
          <div className="border-b pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">CV Building Masterclass</h1>
            <p className="text-gray-600 text-lg">
              A comprehensive written guide to crafting a professional CV that gets you hired. 
              Follow this step-by-step manual to build a resume that stands out.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Course Content</h2>
              
              {/* Module 1 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
                  <Layout className="mr-2" size={20} />
                  1. Structure & Formatting
                </h3>
                <div className="bg-gray-50 p-5 rounded-lg border text-gray-700 space-y-3">
                  <p>
                    <strong>Keep it concise:</strong> Your CV should ideally be 1-2 pages long. Recruiters spend an average of 7 seconds scanning a resume.
                  </p>
                  <p>
                    <strong>Use a clean layout:</strong> Stick to standard fonts like Arial, Calibri, or Helvetica (size 10-12). Use bold headings to separate sections clearly.
                  </p>
                  <p>
                    <strong>Reverse Chronological Order:</strong> Always list your most recent experience first. This is what employers care about most.
                  </p>
                  <p>
                    <strong>File Format:</strong> Always save and send your CV as a PDF unless specifically asked for a Word document. This ensures formatting stays consistent across devices.
                  </p>
                </div>
              </div>

              {/* Module 2 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
                  <PenTool className="mr-2" size={20} />
                  2. Essential Sections
                </h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-1">
                    <h4 className="font-bold text-gray-900">Header (Contact Info)</h4>
                    <p className="text-gray-600 text-sm">Full Name, Phone Number, Professional Email (firstname.lastname@email.com), LinkedIn URL, and Location (City, Country).</p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4 py-1">
                    <h4 className="font-bold text-gray-900">Professional Summary</h4>
                    <p className="text-gray-600 text-sm">A 2-3 sentence elevator pitch. Example: &quot;Motivated Sales Associate with 3+ years of experience in retail management, proven track record of exceeding sales targets by 20%.&quot;</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-1">
                    <h4 className="font-bold text-gray-900">Work Experience</h4>
                    <p className="text-gray-600 text-sm">List roles with: Job Title, Company Name, Dates. Use bullet points starting with action verbs (e.g., &quot;Managed&quot;, &quot;Developed&quot;, &quot;Increased&quot;) to describe achievements, not just duties.</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-1">
                    <h4 className="font-bold text-gray-900">Education</h4>
                    <p className="text-gray-600 text-sm">Degree Name, University/College, Graduation Year. You can include GPA if it is exceptionally high or if you are a fresh graduate.</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-1">
                    <h4 className="font-bold text-gray-900">Skills</h4>
                    <p className="text-gray-600 text-sm">Hard Skills (e.g., Python, SEO, Accounting) and Soft Skills (e.g., Leadership, Communication). Tailor these to the job description.</p>
                  </div>
                </div>
              </div>

              {/* Module 3 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
                  <FileText className="mr-2" size={20} />
                  3. Pro Tips for Success
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Tailor your CV:</strong> Don&apos;t send the same generic CV to every job. Adjust your summary and skills to match keywords in the job description.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Quantify achievements:</strong> Use numbers. Instead of &quot;Improved sales&quot;, say &quot;Increased sales by 15% in Q3&quot;.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Proofread:</strong> Spelling errors are a major red flag. Use tools like Grammarly or ask a friend to review it.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span><strong>Avoid clutter:</strong> Do not include personal details like marital status, religion, or full home address unless specifically required by local laws.</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-blue-50 p-6 rounded-lg sticky top-24">
                <h3 className="font-semibold text-lg mb-4 text-blue-800">Course Overview</h3>
                <div className="space-y-4 text-sm text-blue-900">
                  <div className="flex justify-between border-b border-blue-200 pb-2">
                    <span>Format:</span>
                    <span className="font-medium">Written Guide</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-200 pb-2">
                    <span>Level:</span>
                    <span className="font-medium">Beginner</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-200 pb-2">
                    <span>Read Time:</span>
                    <span className="font-medium">15 Mins</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-200 pb-2">
                    <span>Price:</span>
                    <span className="font-medium">Free</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-bold mb-2 text-blue-800">Action Items:</h4>
                  <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                    <li>Draft your professional summary</li>
                    <li>List top 5 achievements</li>
                    <li>Select a clean font</li>
                    <li>Export as PDF</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
