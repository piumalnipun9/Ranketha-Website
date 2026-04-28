'use client'

import { useState, useCallback } from 'react'
import { UIProject, ProjectForm } from '../types'
import { authenticatedFetch } from '@/lib/api'

export function useProjects() {
    const [projects, setProjects] = useState<UIProject[]>([])
    const [selectedProjects, setSelectedProjects] = useState<string[]>([])
    const [editingProject, setEditingProject] = useState<UIProject | null>(null)
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
    const [projectSearch, setProjectSearch] = useState("")
    const [projectForm, setProjectForm] = useState<ProjectForm>({
        name: "",
        description: "",
        imageUrls: [""],
        projectUrl: "",
        technologiesUsed: "",
        displayOrder: "0"
    })

    const fetchProjects = useCallback(async (search?: string) => {
        try {
            const qs = search && search.length > 0 ? `?search=${encodeURIComponent(search)}` : ""
            const res = await authenticatedFetch(`/admin/projects${qs}`)

            let projectsArray: any[] = []

            if (Array.isArray(res)) {
                projectsArray = res
            } else if (res && typeof res === 'object') {
                if (Array.isArray(res.projects)) {
                    projectsArray = res.projects
                } else if (Array.isArray(res.directArray)) {
                    projectsArray = res.directArray
                } else if (res.data && Array.isArray(res.data)) {
                    projectsArray = res.data
                } else {
                    const arrayProps = Object.entries(res)
                        .find(([_, value]) => Array.isArray(value) && (value as any[]).length > 0)
                    if (arrayProps) {
                        projectsArray = arrayProps[1] as any[]
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
            return uiProjects
        } catch (error) {
            console.error("Error fetching projects:", error)
            setProjects([])
            return []
        }
    }, [])

    const handleAddProject = useCallback(() => {
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
    }, [])

    const handleEditProject = useCallback((project: UIProject) => {
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
    }, [])

    const handleDeleteProject = useCallback(async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return false

        try {
            await authenticatedFetch(`/admin/projects/${id}`, {
                method: "DELETE",
            })
            await fetchProjects()
            return true
        } catch (error) {
            console.error("Failed to delete project:", error)
            alert("Failed to delete project")
            return false
        }
    }, [fetchProjects])

    const handleBulkDeleteProjects = useCallback(async () => {
        if (selectedProjects.length === 0) return false
        if (!confirm(`Delete ${selectedProjects.length} selected project(s)?`)) return false
        try {
            for (const id of selectedProjects) {
                await authenticatedFetch(`/admin/projects/${id}`, { method: "DELETE" })
            }
            setSelectedProjects([])
            await fetchProjects(projectSearch.trim() || undefined)
            return true
        } catch (err: any) {
            alert(err?.message || "Failed to delete selected projects")
            return false
        }
    }, [selectedProjects, projectSearch, fetchProjects])

    const handleSaveProject = useCallback(async () => {
        if (!projectForm.name) {
            alert("Project name is required")
            return false
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
                })
            } else {
                await authenticatedFetch(`/admin/projects`, {
                    method: "POST",
                    body: JSON.stringify(formData),
                })
            }

            setIsProjectDialogOpen(false)
            setTimeout(() => {
                fetchProjects()
            }, 500)
            return true
        } catch (error) {
            console.error("Failed to save project:", error)
            alert("Failed to save project")
            return false
        }
    }, [projectForm, editingProject, fetchProjects])

    return {
        // State
        projects,
        setProjects,
        selectedProjects,
        setSelectedProjects,
        editingProject,
        isProjectDialogOpen,
        setIsProjectDialogOpen,
        projectSearch,
        setProjectSearch,
        projectForm,
        setProjectForm,
        // Actions
        fetchProjects,
        handleAddProject,
        handleEditProject,
        handleDeleteProject,
        handleBulkDeleteProjects,
        handleSaveProject,
    }
}
