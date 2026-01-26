"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TalentMetadata {
  yearsExperience?: string;
  currentStatus?: string;
  availability?: string[];
  preferredJobTypes?: string[];
}

interface TalentPost {
  id: string;
  title: string;
  bio: string;
  skills: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

interface DraftPost {
  id: string;
  title: string;
  bio: string;
  skills: string;
  lastEdited: string;
  completion: number;
}

export default function TalentPostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<TalentPost[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "drafts" | "archived">("active");
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "views" | "saves">("newest");
  
  // Mock stats - in production these would come from API
  const [stats] = useState({
    totalViews: 156,
    activePosts: 0,
    savedByEmployers: 23,
    messagesReceived: 8
  });

  // Mock drafts from localStorage
  const [drafts, setDrafts] = useState<DraftPost[]>([]);
  const [archivedPosts, setArchivedPosts] = useState<TalentPost[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    if (status === "authenticated" && session?.user?.role !== "JOBSEEKER") {
      router.push("/");
      return;
    }

    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/talent/my-posts");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error("Failed to fetch talent posts", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchPosts();
      
      // Load drafts from localStorage
      const savedDraft = localStorage.getItem("talentPostDraft");
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          const completion = calculateCompletion(draft);
          setDrafts([{
            id: "draft-1",
            title: draft.title || "Untitled Draft",
            bio: draft.bio || "",
            skills: draft.skills || "",
            lastEdited: draft.savedAt || new Date().toISOString(),
            completion
          }]);
        } catch { /* ignore */ }
      }
      
      // Load archived from localStorage
      const archived = localStorage.getItem("archivedTalentPosts");
      if (archived) {
        try {
          setArchivedPosts(JSON.parse(archived));
        } catch { /* ignore */ }
      }
    }
  }, [status, session, router]);

  const calculateCompletion = (draft: any): number => {
    let filled = 0;
    const total = 5;
    if (draft.title) filled++;
    if (draft.bio && draft.bio.length > 20) filled++;
    if (draft.skills && draft.skills.length > 0) filled++;
    if (draft.yearsExperience) filled++;
    if (draft.availability && draft.availability.length > 0) filled++;
    return Math.round((filled / total) * 100);
  };

  const parseMetadata = (metadataStr?: string): TalentMetadata => {
    if (!metadataStr) return {};
    try {
      return JSON.parse(metadataStr);
    } catch {
      return {};
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const res = await fetch(`/api/talent/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== postId));
        setShowDeleteModal(null);
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting post");
    }
  };

  const handleArchive = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      const newArchived = [...archivedPosts, { ...post, archivedAt: new Date().toISOString() }];
      setArchivedPosts(newArchived as TalentPost[]);
      localStorage.setItem("archivedTalentPosts", JSON.stringify(newArchived));
      setPosts(posts.filter(p => p.id !== postId));
    }
  };

  const handleReactivate = (postId: string) => {
    const post = archivedPosts.find(p => p.id === postId);
    if (post) {
      setPosts([...posts, post]);
      setArchivedPosts(archivedPosts.filter(p => p.id !== postId));
      localStorage.setItem("archivedTalentPosts", JSON.stringify(archivedPosts.filter(p => p.id !== postId)));
    }
  };

  const handleDeleteDraft = (draftId: string) => {
    localStorage.removeItem("talentPostDraft");
    setDrafts(drafts.filter(d => d.id !== draftId));
  };

  const handleDeleteArchived = (postId: string) => {
    setArchivedPosts(archivedPosts.filter(p => p.id !== postId));
    localStorage.setItem("archivedTalentPosts", JSON.stringify(archivedPosts.filter(p => p.id !== postId)));
  };

  const copyShareLink = (postId: string) => {
    const link = `${window.location.origin}/talent/${postId}`;
    navigator.clipboard.writeText(link);
    setShowShareModal(null);
    alert("Link copied to clipboard!");
  };

  const getStatusBadge = (post: TalentPost) => {
    const daysSinceUpdate = Math.floor((Date.now() - new Date(post.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate > 30) {
      return { color: "bg-red-500", text: "Expired", icon: "bx-x-circle" };
    }
    return { color: "bg-green-500", text: "Active", icon: "bx-check-circle" };
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground">My Talent Posts</h1>
          <p className="text-muted-foreground mt-1">Manage how employers see you</p>
        </div>
        <Link href="/talent/new" className="px-6 py-3 rounded-xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2">
          <i className="bx bx-plus-circle text-xl"></i> Create New Post
        </Link>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <i className="bx bx-show text-2xl text-blue-500"></i>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stats.totalViews}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <i className="bx bx-file text-2xl text-green-500"></i>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{posts.length}</p>
              <p className="text-xs text-muted-foreground">Active Posts</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <i className="bx bx-bookmark text-2xl text-yellow-500"></i>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stats.savedByEmployers}</p>
              <p className="text-xs text-muted-foreground">Saved by Employers</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <i className="bx bx-message-rounded-dots text-2xl text-purple-500"></i>
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stats.messagesReceived}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-4">
        <button onClick={() => setActiveTab("active")} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === "active" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
          <i className="bx bx-check-circle mr-2"></i> Active Posts
          {posts.length > 0 && <span className="ml-2 bg-primary-foreground/20 px-2 py-0.5 rounded-full text-xs">{posts.length}</span>}
        </button>
        <button onClick={() => setActiveTab("drafts")} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === "drafts" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
          <i className="bx bx-edit mr-2"></i> Drafts
          {drafts.length > 0 && <span className="ml-2 bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-xs">{drafts.length}</span>}
        </button>
        <button onClick={() => setActiveTab("archived")} className={`px-4 py-2 rounded-xl font-medium transition-all ${activeTab === "archived" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
          <i className="bx bx-archive mr-2"></i> Archived
          {archivedPosts.length > 0 && <span className="ml-2 bg-muted px-2 py-0.5 rounded-full text-xs">{archivedPosts.length}</span>}
        </button>
      </div>

      {/* Sort & Filter */}
      {activeTab === "active" && posts.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">{posts.length} active post{posts.length !== 1 ? "s" : ""}</p>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/50">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      )}

      {/* Active Posts */}
      {activeTab === "active" && (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bx bx-file-blank text-4xl text-muted-foreground"></i>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No talent posts yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Create your first talent post to showcase your skills to employers.
              </p>
              <Link href="/talent/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
                <i className="bx bx-plus-circle"></i> Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPosts.map(post => {
                const status = getStatusBadge(post);
                const metadata = parseMetadata(post.metadata);
                
                return (
                  <div key={post.id} className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-foreground truncate">{post.title}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${status.color}`}>
                            <i className={`bx ${status.icon} text-xs`}></i> {status.text}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          Posted {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.skills.split(",").slice(0, 5).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">{skill.trim()}</span>
                          ))}
                          {post.skills.split(",").length > 5 && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">+{post.skills.split(",").length - 5}</span>
                          )}
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><i className="bx bx-show"></i> 42 views</span>
                          <span className="flex items-center gap-1"><i className="bx bx-bookmark"></i> 5 saves</span>
                          {metadata.yearsExperience && <span className="flex items-center gap-1"><i className="bx bx-briefcase"></i> {metadata.yearsExperience} yrs exp</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Link href={`/talent/${post.id}/edit`} className="px-3 py-2 rounded-lg bg-accent text-foreground text-sm font-medium hover:bg-accent/80 transition-colors flex items-center gap-1">
                          <i className="bx bx-edit"></i> Edit
                        </Link>
                        <Link href={`/profile/${session?.user?.id}`} className="px-3 py-2 rounded-lg bg-accent text-foreground text-sm font-medium hover:bg-accent/80 transition-colors flex items-center gap-1">
                          <i className="bx bx-show"></i> Preview
                        </Link>
                        <button onClick={() => setShowShareModal(post.id)} className="px-3 py-2 rounded-lg bg-accent text-foreground text-sm font-medium hover:bg-accent/80 transition-colors flex items-center gap-1">
                          <i className="bx bx-share-alt"></i> Share
                        </button>
                        <button onClick={() => handleArchive(post.id)} className="px-3 py-2 rounded-lg bg-accent text-foreground text-sm font-medium hover:bg-accent/80 transition-colors flex items-center gap-1">
                          <i className="bx bx-archive-in"></i> Archive
                        </button>
                        <button onClick={() => setShowDeleteModal(post.id)} className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1">
                          <i className="bx bx-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Drafts */}
      {activeTab === "drafts" && (
        <>
          {drafts.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bx bx-edit text-4xl text-muted-foreground"></i>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No saved drafts</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Start creating a post and save it as a draft to continue later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map(draft => (
                <div key={draft.id} className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground mb-1">{draft.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Last edited: {new Date(draft.lastEdited).toLocaleDateString()}
                      </p>
                      
                      {/* Completion Progress */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${draft.completion}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-foreground">{draft.completion}% complete</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <Link href="/talent/new" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-1">
                        <i className="bx bx-edit"></i> Continue Editing
                      </Link>
                      <button onClick={() => handleDeleteDraft(draft.id)} className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1">
                        <i className="bx bx-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Archived */}
      {activeTab === "archived" && (
        <>
          {archivedPosts.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bx bx-archive text-4xl text-muted-foreground"></i>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No archived posts</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Archive posts you want to hide from employers but keep for later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {archivedPosts.map(post => (
                <div key={post.id} className="bg-card rounded-2xl border border-border p-6 opacity-75">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-foreground">{post.title}</h3>
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">Archived</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Originally posted: {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleReactivate(post.id)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-1">
                        <i className="bx bx-revision"></i> Reactivate
                      </button>
                      <button onClick={() => handleDeleteArchived(post.id)} className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1">
                        <i className="bx bx-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bx bx-trash text-3xl text-red-500"></i>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Delete Post?</h3>
              <p className="text-muted-foreground">This action cannot be undone. Your post will be permanently removed.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-accent transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Share Your Profile</h3>
              <button onClick={() => setShowShareModal(null)} className="p-2 hover:bg-accent rounded-lg">
                <i className="bx bx-x text-xl"></i>
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Share this link with employers to show your talent profile.</p>
            <div className="flex gap-2">
              <input type="text" readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/profile/${session?.user?.id}`} className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm" />
              <button onClick={() => copyShareLink(showShareModal)} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
                <i className="bx bx-copy"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
