export function getFolderUrl(folderId: string): string {
  return `/projetos/${folderId}`
}

export function getProjectUrl(
  project: { id: string; folderId?: string | null },
  tab: "dashboard" | "medicoes" | "equipe" = "dashboard"
): string {
  if (project.folderId) {
    return `/projetos/${project.folderId}/${project.id}/${tab}`
  }
  return `/projetos/${project.id}/${tab}`
}
