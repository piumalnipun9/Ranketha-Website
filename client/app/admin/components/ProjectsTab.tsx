'use client'

import { Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import type { UIProject } from '../types'

interface ProjectsTabProps {
    projects: UIProject[]
    selectedProjects: string[]
    setSelectedProjects: (value: string[] | ((prev: string[]) => string[])) => void
    projectSearch: string
    setProjectSearch: (value: string) => void
    handleAddProject: () => void
    handleEditProject: (project: UIProject) => void
    handleDeleteProject: (id: string) => void
    handleBulkDeleteProjects: () => void
}

export function ProjectsTab({
    projects,
    selectedProjects,
    setSelectedProjects,
    projectSearch,
    setProjectSearch,
    handleAddProject,
    handleEditProject,
    handleDeleteProject,
    handleBulkDeleteProjects,
}: ProjectsTabProps) {
    return (
        <div className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Project Management</CardTitle>
                        <div className="flex items-center gap-2">
                            <Input
                                value={projectSearch}
                                onChange={(e) => setProjectSearch(e.target.value)}
                                placeholder="Search projects..."
                                className="w-48 md:w-72"
                            />
                            {projectSearch && (
                                <Button variant="outline" size="sm" onClick={() => setProjectSearch("")}>Clear</Button>
                            )}
                            <Button onClick={handleAddProject}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Project
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedProjects.length > 0 && (
                                <Button variant="destructive" onClick={handleBulkDeleteProjects}>Delete Selected</Button>
                            )}
                            <input
                                type="checkbox"
                                className="w-4 h-4 mt-1"
                                checked={selectedProjects.length === projects.length && projects.length > 0}
                                onChange={(e) => {
                                    if (e.target.checked) setSelectedProjects(projects.map(p => p.id))
                                    else setSelectedProjects([])
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {projects.length === 0 ? (
                            <p className="text-slate-600">No projects yet.</p>
                        ) : (
                            projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg"
                                >
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4"
                                        checked={selectedProjects.includes(project.id)}
                                        onChange={(e) => {
                                            setSelectedProjects((prev) => {
                                                if (e.target.checked) {
                                                    return prev.includes(project.id) ? prev : [...prev, project.id]
                                                }
                                                return prev.filter(id => id !== project.id)
                                            })
                                        }}
                                    />
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <Image
                                            src={project.imageUrls[0] || "/placeholder.svg"}
                                            alt={project.name}
                                            width={64}
                                            height={64}
                                            className="object-cover rounded-lg"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{project.name}</p>
                                        <p className="text-xs text-slate-500 truncate mt-1">
                                            {project.technologiesUsed.join(", ")}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Order: {project.displayOrder}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEditProject(project)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDeleteProject(project.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
