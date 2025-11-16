import type { Incident } from "./incident_types";

export type { Incident, IncidentState } from "./incident_types";

export type Action = "view" | "create" | "update" | "delete";
export type Role = "reporter" | "admin" | "attendant";

export type User = {
  tenant: string;
  id: string; // duplicate of email
  email: string;
  passwordHash?: string;
  salt: string;
  roles: Role[];
  fullName?: string;
  phone?: string;
  notes?: string;
  status?: string;
  searchKey?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Token = {
  tenant: string;
  id: string; // user.id#token
  token: string;
  user: User;
  expiresAt: string;
};

export type WebSocket = {
  tenant: string;
  id: string;
  user: string;
};

export type Permissions = {
  incidents: {
    dataType: Incident;
    action: Action;
  };
  users: {
    dataType: User;
    action: Action;
  };
};
