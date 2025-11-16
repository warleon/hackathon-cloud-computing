export type Action = "view" | "create" | "update" | "delete";
export type Role = "reporter" | "admin" | "attendant";
export type IncidentState = "PENDING" | "ATTENDING" | "FINISHED";
export type Incident = {
  tenant: string;
  id: string;
  media: string;
  title: string;
  creator: string;
  location: string;
  state: IncidentState;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  tenant: string;
  id: string; // duplicate of email
  email: string;
  passwordHash?: string;
  salt: string;
  roles: Role[];
};

export type Token = {
  tenant: string;
  id: string;
  user: string;
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
