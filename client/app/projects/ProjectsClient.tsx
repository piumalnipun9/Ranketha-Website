"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL, getProjects, type ProjectDto } from "@/lib/api";

export default function ProjectsClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectDto[]>([]);

  useEffect(() => {
    getProjects()
      .then((list) => setProjects(list))
      .finally(() => setLoading(false));
  }, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    imageUrl: "",
    name: "",
    email: "",
    whatsapp: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.name || !form.email) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/projects/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          tags: form.tags,
          imageUrl: form.imageUrl,
          name: form.name,
          email: form.email,
          whatsapp: form.whatsapp,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit project");
      // Success
      alert("Thanks! Your project was sent to RoboClub.");
      setIsModalOpen(false);
      setForm({
        title: "",
        description: "",
        tags: "",
        imageUrl: "",
        name: "",
        email: "",
        whatsapp: "",
      });
    } catch (err: any) {
      alert(err?.message || "Submission failed. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 drop-shadow">
            Our Electronic Projects
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Explore our portfolio of innovative electronics, embedded systems, and custom PCB design projects.
          </p>
          <Button
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold shadow hover:from-blue-500 hover:to-green-500 transition px-6 py-3 rounded-full text-lg"
            onClick={() => setIsModalOpen(true)}
          >
            Submit Your Project
          </Button>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-4 right-4 text-slate-500 hover:text-red-500 text-xl font-bold"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Submit Your Project</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block font-medium mb-1">Project Title</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="Project Title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      placeholder="Describe your project"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Tags</label>
                    <input
                      value={form.tags}
                      onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="e.g. IoT, PCB, Robotics"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Image URL</label>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      placeholder="Link to project image"
                    />
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-2 text-blue-600">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium mb-1">Name</label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          type="text"
                          className="w-full border rounded px-3 py-2"
                          placeholder="Your Name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Email</label>
                        <input
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          type="email"
                          className="w-full border rounded px-3 py-2"
                          placeholder="Your Email"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block font-medium mb-1">WhatsApp Number</label>
                        <input
                          value={form.whatsapp}
                          onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                          type="tel"
                          className="w-full border rounded px-3 py-2"
                          placeholder="WhatsApp Number"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button
                      disabled={submitting}
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-2 rounded-lg"
                    >
                      {submitting ? "Submitting…" : "Submit Project"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading && (
            <div className="col-span-full text-center text-slate-600">Loading projects…</div>
          )}
          {!loading && projects.length === 0 && (
            <div className="col-span-full text-center text-slate-600">No projects yet.</div>
          )}
          {projects.map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden rounded-3xl shadow-xl bg-white/80 backdrop-blur-lg border border-blue-100 hover:scale-[1.03] transition-transform duration-300 group"
            >
              <CardHeader className="p-0">
                <div className="relative w-full h-48">
                  <Image
                    src={project.imageUrls?.[0] || "/placeholder.jpg"}
                    alt={project.name}
                    fill
                    className="object-cover rounded-t-3xl group-hover:brightness-95 transition duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                    {project.technologiesUsed?.[0] || "Project"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-2xl font-bold mb-2 text-blue-700 group-hover:text-purple-700 transition">
                  {project.name}
                </CardTitle>
                <p className="text-base text-slate-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologiesUsed?.map((tag) => (
                    <Badge key={tag} className="bg-blue-100 text-blue-700 border border-blue-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {project.projectUrl ? (
                  <Link href={project.projectUrl} target="_blank">
                    <Button
                      variant="default"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow hover:from-purple-500 hover:to-blue-500 transition"
                    >
                      View Details
                    </Button>
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
