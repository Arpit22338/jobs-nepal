"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Target, Upload, User, MapPin, DollarSign, Sparkles,
  CheckCircle, AlertCircle, ArrowRight, Loader2, Filter,
  BookOpen, Building2
} from "lucide-react";

interface MatchedJob {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  whyMatch: string;
  growthAreas: string[];
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    description: string;
  };
}

interface MatchResult {
  matches: MatchedJob[];
  recommendations: string[];
  skillsToLearn: string[];
}

export default function JobMatcherPage() {
  const [step, setStep] = useState<"input" | "results">("input");
  const [isMatching, setIsMatching] = useState(false);
  const [results, setResults] = useState<MatchResult | null>(null);
  const [filterScore, setFilterScore] = useState(0);

  // Input form
  const [inputMode, setInputMode] = useState<"manual" | "upload">("manual");
  const [profileData, setProfileData] = useState({
    currentTitle: "",
    desiredTitle: "",
    skills: "",
    experience: "",
    education: "",
    preferredLocations: "",
    jobTypes: [] as string[],
    salaryExpectation: ""
  });

  const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

  const handleJobTypeToggle = (type: string) => {
    setProfileData({
      ...profileData,
      jobTypes: profileData.jobTypes.includes(type)
        ? profileData.jobTypes.filter(t => t !== type)
        : [...profileData.jobTypes, type]
    });
  };

  const findMatchingJobs = async () => {
    if (!profileData.skills) return;
    
    setIsMatching(true);
    try {
      const response = await fetch("/api/ai/job-matcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileData: {
            ...profileData,
            skills: profileData.skills.split(",").map(s => s.trim())
          },
          filters: {
            location: profileData.preferredLocations,
            type: profileData.jobTypes.length === 1 ? profileData.jobTypes[0] : undefined
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setResults(data);
        setStep("results");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error matching jobs:", error);
      alert("Failed to find matching jobs. Please try again.");
    } finally {
      setIsMatching(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const filteredMatches = results?.matches.filter(m => m.matchScore >= filterScore) || [];

  return (
    <div className="max-w-5xl mx-auto p-6 pb-20">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-foreground mb-2">
          <span className="text-primary">AI</span> Job Matcher
        </h1>
        <p className="text-muted-foreground text-lg">Find jobs that match your skills and experience</p>
      </div>

      {/* Step 1: Input */}
      {step === "input" && (
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50">
          {/* Input Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border border-border p-1 bg-accent/30">
              <button
                onClick={() => setInputMode("manual")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  inputMode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User size={16} /> Fill Profile
              </button>
              <button
                onClick={() => setInputMode("upload")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  inputMode === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload size={16} /> Upload Resume
              </button>
            </div>
          </div>

          {inputMode === "upload" && (
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center mb-8 hover:border-primary/50 transition-colors">
              <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-medium text-foreground mb-2">Drop your resume here or click to upload</p>
              <p className="text-sm text-muted-foreground mb-4">PDF, DOC, DOCX (Max 5MB)</p>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" id="resume-upload" />
              <label
                htmlFor="resume-upload"
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors"
              >
                <Upload size={18} /> Choose File
              </label>
              <p className="text-xs text-muted-foreground mt-4">
                Coming soon! For now, please use the manual input option.
              </p>
            </div>
          )}

          {inputMode === "manual" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Job Title</label>
                  <input
                    type="text"
                    value={profileData.currentTitle}
                    onChange={(e) => setProfileData({ ...profileData, currentTitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="e.g., Junior Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Desired Job Title(s)</label>
                  <input
                    type="text"
                    value={profileData.desiredTitle}
                    onChange={(e) => setProfileData({ ...profileData, desiredTitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="e.g., Full Stack Developer, Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Skills *</label>
                <textarea
                  value={profileData.skills}
                  onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="JavaScript, React, Node.js, Python, SQL, Git, AWS..."
                />
                <p className="text-sm text-muted-foreground mt-1">Separate skills with commas</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Years of Experience</label>
                  <select
                    value={profileData.experience}
                    onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="">Select...</option>
                    <option value="0-1">0-1 years (Entry Level)</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Education Level</label>
                  <select
                    value={profileData.education}
                    onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="">Select...</option>
                    <option value="High School">High School</option>
                    <option value="Associate">Associate Degree</option>
                    <option value="Bachelor">Bachelor&apos;s Degree</option>
                    <option value="Master">Master&apos;s Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Self-taught">Self-taught / Bootcamp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preferred Locations</label>
                <input
                  type="text"
                  value={profileData.preferredLocations}
                  onChange={(e) => setProfileData({ ...profileData, preferredLocations: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="e.g., Kathmandu, Remote, Pokhara"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Job Types</label>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleJobTypeToggle(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        profileData.jobTypes.includes(type)
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:border-primary/50 hover:bg-accent"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Salary Expectation (Optional)</label>
                <input
                  type="text"
                  value={profileData.salaryExpectation}
                  onChange={(e) => setProfileData({ ...profileData, salaryExpectation: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="e.g., Rs. 50,000 - 80,000 / month"
                />
              </div>
            </div>
          )}

          <button
            onClick={findMatchingJobs}
            disabled={!profileData.skills || isMatching}
            className="w-full mt-8 py-4 bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isMatching ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Analyzing Your Profile...
              </>
            ) : (
              <>
                <Target size={24} />
                Find Matching Jobs
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Results */}
      {step === "results" && results && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-6 border border-border/50 text-center">
              <Target className="mx-auto text-primary mb-2" size={32} />
              <p className="text-3xl font-black text-foreground">{results.matches.length}</p>
              <p className="text-muted-foreground">Jobs Matched</p>
            </div>
            <div className="glass-card rounded-xl p-6 border border-border/50 text-center">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
              <p className="text-3xl font-black text-foreground">
                {results.matches.filter(m => m.matchScore >= 75).length}
              </p>
              <p className="text-muted-foreground">Strong Matches (75%+)</p>
            </div>
            <div className="glass-card rounded-xl p-6 border border-border/50 text-center">
              <BookOpen className="mx-auto text-yellow-500 mb-2" size={32} />
              <p className="text-3xl font-black text-foreground">{results.skillsToLearn.length}</p>
              <p className="text-muted-foreground">Skills to Develop</p>
            </div>
          </div>

          {/* Filters & New Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Filter size={16} /> Filter by match:
              </span>
              <div className="flex gap-2">
                {[0, 50, 75, 90].map((score) => (
                  <button
                    key={score}
                    onClick={() => setFilterScore(score)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      filterScore === score
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {score === 0 ? "All" : `>${score}%`}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setStep("input")}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
            >
              New Search
            </button>
          </div>

          {/* Skills to Learn */}
          {results.skillsToLearn && results.skillsToLearn.length > 0 && (
            <div className="glass-card rounded-xl p-6 border border-primary/30 bg-primary/5">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <BookOpen size={20} className="text-primary" />
                Skills to Develop for More Matches
              </h3>
              <div className="flex flex-wrap gap-2">
                {results.skillsToLearn.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary hover:underline"
              >
                Browse our skill courses <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Job Matches */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">
              {filteredMatches.length} Matching Jobs
            </h3>

            {filteredMatches.length === 0 ? (
              <div className="glass-card rounded-xl p-12 border border-border/50 text-center">
                <Target size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">No jobs match your filter</p>
                <p className="text-muted-foreground">Try lowering the match threshold or update your skills</p>
              </div>
            ) : (
              filteredMatches.map((match, idx) => (
                <div key={idx} className="glass-card rounded-xl p-6 border border-border/50 hover:border-primary/30 transition-all">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Match Score */}
                    <div className="md:w-24 shrink-0">
                      <div className={`w-20 h-20 mx-auto md:mx-0 rounded-full border-4 ${getScoreBg(match.matchScore)} border-opacity-30 flex items-center justify-center`}>
                        <span className={`text-2xl font-black ${getScoreColor(match.matchScore)}`}>
                          {match.matchScore}%
                        </span>
                      </div>
                      <p className="text-center text-xs text-muted-foreground mt-1">Match</p>
                    </div>

                    {/* Job Details */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-foreground">{match.job.title}</h4>
                          <p className="text-muted-foreground flex items-center gap-2">
                            <Building2 size={14} /> {match.job.company}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-accent text-foreground rounded-full text-xs font-medium flex items-center gap-1">
                            <MapPin size={12} /> {match.job.location}
                          </span>
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            {match.job.type}
                          </span>
                        </div>
                      </div>

                      {match.job.salary && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                          <DollarSign size={14} /> {match.job.salary}
                        </p>
                      )}

                      {/* Why Match */}
                      {match.whyMatch && (
                        <p className="text-sm text-foreground mb-3">{match.whyMatch}</p>
                      )}

                      {/* Skills */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {match.matchingSkills && match.matchingSkills.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-green-500 mb-1 flex items-center gap-1">
                              <CheckCircle size={12} /> Matching Skills
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {match.matchingSkills.slice(0, 5).map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                              {match.matchingSkills.length > 5 && (
                                <span className="text-xs text-muted-foreground">+{match.matchingSkills.length - 5} more</span>
                              )}
                            </div>
                          </div>
                        )}
                        {match.missingSkills && match.missingSkills.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-yellow-500 mb-1 flex items-center gap-1">
                              <AlertCircle size={12} /> Skills to Develop
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {match.missingSkills.slice(0, 3).map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                              {match.missingSkills.length > 3 && (
                                <span className="text-xs text-muted-foreground">+{match.missingSkills.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          href={`/jobs/${match.job.id}`}
                          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          View Full Job
                        </Link>
                        <Link
                          href={`/jobs/${match.job.id}#apply`}
                          className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors text-sm font-medium"
                        >
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recommendations */}
          {results.recommendations && results.recommendations.length > 0 && (
            <div className="glass-card rounded-xl p-6 border border-border/50">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                AI Recommendations
              </h3>
              <ul className="space-y-2">
                {results.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                    <ArrowRight size={16} className="text-primary mt-1 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
