import { Router, Request, Response } from 'express';

type AuthenticatedRequest = Request;

// Helper function to check admin role
const isAdmin = (req: AuthenticatedRequest, res: Response): boolean => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'User not authenticated.' });
    return false;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Forbidden: Admins only.' });
    return false;
  }

  return true;
};

export default function createAdminProjectsRoutes(prisma: any, authenticateToken: any) {
  const router = Router();

  // @route   GET /admin/projects
  // @desc    Get all projects for admin
  // @access  Private (Admin only)
  router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { search } = req.query;
      
      // Build where clause based on filters
      const where: any = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { technologiesUsed: { has: search as string } }
        ];
      }

      const projects = await prisma.project.findMany({
        where,
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      console.log(`[ADMIN] Fetched ${projects.length} projects:`, projects);
      
      // Directly return the array without wrapping it in an object
      // Use special format for debugging
      res.json({
        source: "admin.projects.ts",
        directArray: projects,
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   GET /admin/projects/:id
  // @desc    Get project by ID
  // @access  Private (Admin only)
  router.get("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;
      
      const project = await prisma.project.findUnique({
        where: { id }
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   POST /admin/projects
  // @desc    Create a new project
  // @access  Private (Admin only)
  router.post("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { 
        name, 
        description, 
        imageUrls,
        projectUrl,
        technologiesUsed,
        displayOrder
      } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({ message: "Project name is required" });
      }

      // Create project
      const project = await prisma.project.create({
        data: {
          name,
          description: description || "",
          imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
          projectUrl,
          technologiesUsed: Array.isArray(technologiesUsed) ? technologiesUsed : [],
          displayOrder: typeof displayOrder === 'number' ? displayOrder : 0
        }
      });

      console.log("[ADMIN] Created new project:", project);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   PUT /admin/projects/:id
  // @desc    Update a project
  // @access  Private (Admin only)
  router.put("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;
      const { 
        name, 
        description, 
        imageUrls,
        projectUrl,
        technologiesUsed,
        displayOrder
      } = req.body;

      // Check if project exists
      const existingProject = await prisma.project.findUnique({
        where: { id }
      });

      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Prepare update data
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (imageUrls !== undefined) updateData.imageUrls = Array.isArray(imageUrls) ? imageUrls : [];
      if (projectUrl !== undefined) updateData.projectUrl = projectUrl;
      if (technologiesUsed !== undefined) updateData.technologiesUsed = Array.isArray(technologiesUsed) ? technologiesUsed : [];
      if (displayOrder !== undefined) updateData.displayOrder = typeof displayOrder === 'number' ? displayOrder : 0;

      // Update project
      const updatedProject = await prisma.project.update({
        where: { id },
        data: updateData
      });

      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // @route   DELETE /admin/projects/:id
  // @desc    Delete a project
  // @access  Private (Admin only)
  router.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!isAdmin(req, res)) return;

      const { id } = req.params;

      // Check if project exists
      const project = await prisma.project.findUnique({
        where: { id }
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Delete project
      await prisma.project.delete({
        where: { id }
      });

      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  return router;
}
