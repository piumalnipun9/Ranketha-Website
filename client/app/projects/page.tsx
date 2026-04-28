import { Navigation } from "@/components/home/Navigation";
import { Footer } from "@/components/home/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import type { Metadata } from "next";
import ProjectsClient from "./ProjectsClient";

export const metadata: Metadata = {
  title: "Projects | RoboClub",
  description:
    "Explore our portfolio of electronics, embedded systems, IoT, and custom PCB design projects at RoboClub.",
  alternates: { canonical: "https://roboclub.lk/projects" },
  openGraph: {
    title: "Projects | RoboClub",
    description:
      "Explore our portfolio of electronics, embedded systems, IoT, and custom PCB design projects at RoboClub.",
    url: "https://roboclub.lk/projects",
    images: ["/roboclub-logo.png"],
  },
};

export default function ProjectsPage() {
  return (
    <div>
      <Navigation />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Projects", url: "/projects" },
        ]}
      />
      <ProjectsClient />
      <Footer />
    </div>
  );
}