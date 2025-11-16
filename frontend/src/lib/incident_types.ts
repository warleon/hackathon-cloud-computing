export type IncidentState = "PENDING" | "ATTENDING" | "FINISHED";

export type Incident = {
  tenant: string;
  id: string;
  media: string;
  title: string;
  creator: string;
  location: string;
  state: IncidentState;
  description?: string;
  createdAt: string;
  updatedAt: string;
  searchKey?: string;
};
