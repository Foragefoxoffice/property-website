// @ts-nocheck
'use client'

import React from 'react'
import ProjectBanner from './ProjectBanner'
import ProjectIntroduction from './ProjectIntroduction'
import ProjectOverview from './ProjectOverview'
import ProjectLocation from './ProjectLocation'
import ProjectPhotos from './ProjectPhotos'
import ProjectProduct from './ProjectProduct'
import ProjectMainDescription from './ProjectMainDescription'
import ProjectVideo from './ProjectVideo'
import RelatedProjects from './RelatedProjects'

export default function ProjectDetailClient({ project }: { project: Record<string, unknown> }) {
  if (!project) return null

  return (
    <div className="bg-white min-h-screen">
      {/* Main Project Banner */}
      <ProjectBanner data={project} />

      {/* Project Introduction Section */}
      <ProjectIntroduction data={project} />

      {/* Project Main Description Section (Table of Content) */}
      <ProjectMainDescription projectData={project} />

      {/* Project Overview Section */}
      <ProjectOverview projectData={project} />

      {/* Project Location Section */}
      <ProjectLocation projectData={project} />

      {/* Project Photos Gallery Section */}
      <ProjectPhotos projectData={project} />

      {/* Project Products Section */}
      <ProjectProduct projectData={project} />

      {/* Project Video Section */}
      <ProjectVideo projectData={project} />

      {/* Related Projects Section */}
      <RelatedProjects 
        currentCategoryId={(project?.category as any)?._id || project?.category} 
        currentProjectId={project?._id} 
        currentProjectData={project}
      />
    </div>
  )
}





