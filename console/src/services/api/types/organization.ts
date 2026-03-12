export interface OrganizationUnit {
  id: string;
  handle: string;
  name: string;
  description?: string;
}

export interface OrganizationUnitsResponse {
  organizations: OrganizationUnit[];
}
