// @ts-nocheck
'use client'

import React from 'react'
import ProjectBanner from './ProjectBanner'
import ProjectIntroduction from './ProjectIntroduction'
import ProjectOverview from './ProjectOverview'
import ProjectLocation from './ProjectLocation'
import ProjectPhotos from './ProjectPhotos'
import ProjectProduct from './ProjectProduct'
// import ProjectMainDescription from './ProjectMainDescription'
import ProjectVideo from './ProjectVideo'
import RelatedProjects from './RelatedProjects'
import ProjectTOC from './ProjectTOC'

export default function ProjectDetailClient({ project }: { project: Record<string, unknown> }) {
  if (!project) return null

  return (
    <div className="bg-white min-h-screen">
      {/* Project Banner needs to stay outside to span full width initially if it does */}
      <ProjectBanner data={project} />

      <ProjectTOC project={project} />

      <div className="relative pt-8 pb-16">

        {/* Main Content */}
        <div className="w-full">
          <ProjectIntroduction data={project} />
          {/* <ProjectMainDescription projectData={project} /> */}
          <ProjectOverview projectData={project} />
          <ProjectLocation projectData={project} />
          <ProjectPhotos projectData={project} />
          <ProjectProduct projectData={project} />
          <ProjectVideo projectData={project} />
        </div>
      </div>

      {/* Related Projects Section */}
      <RelatedProjects
        currentCategoryId={(project?.category as any)?._id || project?.category}
        currentProjectId={project?._id}
        currentProjectData={project}
      />
    </div>
  )
}





