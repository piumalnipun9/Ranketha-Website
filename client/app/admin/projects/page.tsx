"use client"

import { useEffect, useState, useRef } from "react"
import { authenticatedFetch } from "@/lib/api"
import { getCache, setCache } from '../hooks/useAdminCache'
import { ProjectsTab } from '../components'
import type { UIProject } from '../types'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2 } from "lucide-react"

export default function ProjectsPage() {
    const [projects, setProjects] = useState<UIProject[]>([])
    const [selectedProjects, setSelectedProjects] = useState<string[]>([])
    const [projectSearch, setProjectSearch] = useState("")

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const initialLoadDone = useRef(false)

    // Project form state
    const [editingProject, setEditingProject] = useState<UIProject | null>(null)
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
    const [projectForm, setProjectForm] = useState({
        name: "",
        description: "",
        imageUrls: [""],
        projectUrl: "",
        technologiesUsed: "",
        displayOrder: "0"
    })

    // Helper: fetch projects
    const fetchProjects = async (search?: string) => {
        try {
            const qs = search && search.length > 0 ? `?search=${encodeURIComponent(search)}` : ""
            const res = await authenticatedFetch(`/admin/projects${qs}`)

            // Handle all possible response formats
            let projectsArray = [];

            // Check response format to extract projects array
            if (Array.isArray(res)) {
                projectsArray = res;
            } else if (res && typeof res === 'object') {
                if (Array.isArray(res.projects)) {
                    projectsArray = res.projects;
                } else if (Array.isArray(res.directArray)) {
                    projectsArray = res.directArray;
                } else if (res.data && Array.isArray(res.data)) {
                    projectsArray = res.data;
                } else {
                    // Try to find any array property in the response
                    const arrayProps = Object.entries(res)
                        .find(([_, value]) => Array.isArray(value) && value.length > 0);

                    if (arrayProps) {
                        projectsArray = arrayProps[1] as any[];
                    }
                }
            }

            const uiProjects: UIProject[] = (projectsArray || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                description: p.description || "",
                imageUrls: Array.isArray(p.imageUrls) ? p.imageUrls : [],
                projectUrl: p.projectUrl || "",
                technologiesUsed: Array.isArray(p.technologiesUsed) ? p.technologiesUsed : [],
                displayOrder: p.displayOrder || 0,
                createdAt: p.createdAt || "",
                updatedAt: p.updatedAt || "",
            }))
            setProjects(uiProjects)
        } catch (error) {
            console.error("Error fetching projects:", error)
            setProjects([])
        }
    }

    // Debounce project search
    useEffect(() => {
        if (!initialLoadDone.current) return
        const t = setTimeout(() => {
            const q = projectSearch.trim()
            fetchProjects(q || undefined)
        }, 300)
        return () => clearTimeout(t)
    }, [projectSearch])

    // Initial load
    useEffect(() => {
        const loadAll = async () => {
            try {
                setError(null)
                const cached = getCache()
                if (cached && cached.projects) {
                    setProjects(cached.projects)
                    setLoading(false)
                    initialLoadDone.current = true
                } else {
                    setLoading(true)
                }

                await fetchProjects()

            } catch (e: any) {
                console.error(e)
                setError(e?.message || "Failed to load projects")
            } finally {
                setLoading(false)
                initialLoadDone.current = true
            }
        }
        loadAll()
    }, [])

    // Cache update
    useEffect(() => {
        if (!initialLoadDone.current) return
        const currentCache = getCache() || {}
        setCache({
            ...currentCache,
            projects,
        })
    }, [projects])

    const handleAddProject = () => {
        setEditingProject(null)
        setProjectForm({
            name: "",
            description: "",
            imageUrls: [""],
            projectUrl: "",
            technologiesUsed: "",
            displayOrder: "0"
        })
        setIsProjectDialogOpen(true)
    }

    const handleEditProject = (project: UIProject) => {
        setEditingProject(project)
        setProjectForm({
            name: project.name,
            description: project.description || "",
            imageUrls: project.imageUrls.length ? project.imageUrls : [""],
            projectUrl: project.projectUrl || "",
            technologiesUsed: project.technologiesUsed.join(", "),
            displayOrder: project.displayOrder.toString()
        })
        setIsProjectDialogOpen(true)
    }

    const handleDeleteProject = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return

        try {
            await authenticatedFetch(`/admin/projects/${id}`, {
                method: "DELETE",
            })
            fetchProjects()
        } catch (error) {
            console.error("Failed to delete project:", error)
            alert("Failed to delete project")
        }
    }

    const handleBulkDeleteProjects = async () => {
        if (selectedProjects.length === 0) return
        if (!confirm(`Delete ${selectedProjects.length} selected project(s)?`)) return
        try {
            for (const id of selectedProjects) {
                await authenticatedFetch(`/admin/projects/${id}`, { method: "DELETE" })
            }
            setSelectedProjects([])
            await fetchProjects(projectSearch.trim() || undefined)
        } catch (err: any) {
            alert(err?.message || "Failed to delete selected projects")
        }
    }

    const handleSaveProject = async () => {
        if (!projectForm.name) {
            alert("Project name is required")
            return
        }

        try {
            const formData = {
                name: projectForm.name,
                description: projectForm.description,
                imageUrls: projectForm.imageUrls.filter(url => url.trim() !== ""),
                projectUrl: projectForm.projectUrl || undefined,
                technologiesUsed: projectForm.technologiesUsed
                    .split(",")
                    .map(tag => tag.trim())
                    .filter(tag => tag !== ""),
                displayOrder: parseInt(projectForm.displayOrder) || 0
            }

            if (editingProject) {
                await authenticatedFetch(`/admin/projects/${editingProject.id}`, {
                    method: "PUT",
                    body: JSON.stringify(formData),
                });
            } else {
                await authenticatedFetch(`/admin/projects`, {
                    method: "POST",
                    body: JSON.stringify(formData),
                });
            }

            setIsProjectDialogOpen(false)

            setTimeout(() => {
                fetchProjects()
            }, 500);
        } catch (error) {
            console.error("Failed to save project:", error)
            alert("Failed to save project")
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
                    <p className="text-slate-600">Showcase your portfolio projects</p>
                </div>
            </div>

            <ProjectsTab
                projects={projects}
                selectedProjects={selectedProjects}
                setSelectedProjects={setSelectedProjects}
                projectSearch={projectSearch}
                setProjectSearch={setProjectSearch}
                handleAddProject={handleAddProject}
                handleEditProject={handleEditProject}
                handleDeleteProject={handleDeleteProject}
                handleBulkDeleteProjects={handleBulkDeleteProjects}
            />

            {/* Project Dialog */}
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                <DialogContent className="max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto z-[60]">
                    <DialogHeader>
                        <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="projectName">Project Name</Label>
                            <Input
                                id="projectName"
                                value={projectForm.name}
                                onChange={(e) => setProjectForm((prev) => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="projectDescription">Description</Label>
                            <Textarea
                                id="projectDescription"
                                value={projectForm.description}
                                onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))}
                                rows={4}
                            />
                        </div>

                        <div>
                            <Label>Images</Label>
                            {projectForm.imageUrls.map((url, index) => (
                                <div key={index} className="flex items-center gap-2 mt-2">
                                    <Input
                                        value={url}
                                        onChange={(e) => {
                                            const newUrls = [...projectForm.imageUrls];
                                            newUrls[index] = e.target.value;
                                            setProjectForm((prev) => ({ ...prev, imageUrls: newUrls }));
                                        }}
                                        placeholder="Image URL"
                                    />
                                    {index === projectForm.imageUrls.length - 1 ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                setProjectForm((prev) => ({
                                                    ...prev,
                                                    imageUrls: [...prev.imageUrls, ""],
                                                }));
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                const newUrls = projectForm.imageUrls.filter((_, i) => i !== index);
                                                setProjectForm((prev) => ({ ...prev, imageUrls: newUrls }));
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div>
                            <Label htmlFor="projectUrl">Project URL (optional)</Label>
                            <Input
                                id="projectUrl"
                                value={projectForm.projectUrl}
                                onChange={(e) => setProjectForm((prev) => ({ ...prev, projectUrl: e.target.value }))}
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="technologiesUsed">Technologies Used</Label>
                            <Input
                                id="technologiesUsed"
                                value={projectForm.technologiesUsed}
                                onChange={(e) => setProjectForm((prev) => ({ ...prev, technologiesUsed: e.target.value }))}
                                placeholder="IoT, PCB, Arduino (comma-separated)"
                            />
                        </div>

                        <div>
                            <Label htmlFor="displayOrder">Display Order</Label>
                            <Input
                                id="displayOrder"
                                type="number"
                                value={projectForm.displayOrder}
                                onChange={(e) => setProjectForm((prev) => ({ ...prev, displayOrder: e.target.value }))}
                                placeholder="0"
                            />
                            <p className="text-xs text-slate-500 mt-1">Lower numbers appear first</p>
                        </div>

                        <div className="flex space-x-4 pt-2">
                            <Button type="button" className="flex-1" onClick={handleSaveProject}>
                                {editingProject ? "Update Project" : "Add Project"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
