import * as Incident from "./models/incident";

export const system = {
  DENIED_PERMISSION: "denied.permission",
  FAILED: "failed",
  INVALID_PAGE: "invalid.page",
  INVALID_REQUEST: "invalid.request",
  INVALID_SESSION: "invalid.session",
  INVALID_TOKEN: "invalid.token",
  NO_RECORD: "no.record",
  NOT_FOUND: "not.found",
  ERROR_SERVER: "error.server",
  SUCCESS: "success",
};

export const user = {
  INVALID_USER: "invalid.user",
  INVALID_PERMISSION: "invalid.permission",
  EMPTY_USERNAME: "empty.username",
  EMPTY_PASSWORD: "empty.password",
};

export const incident = {
  EMPTY_ASSIGN_TO: "empty.assignedTo",
  EMPTY_DESCRIPTION: "empty.description",
  EMPTY_ID: "empty.id",
  EMPTY_ORDER: "empty.orderBy",
  EMPTY_SORT: "empty.sort",
  EMPTY_TITLE: "empty.title",
  EMPTY_TYPE: "empty.type",
  EXIST_TITLE: "exist.title",
  INVALID_TYPE: "invalid.type",
};

export const permission = {
  ADMIN: "admin",
  USER: "user",
};

export const sortTypes = {
  ASCENDING: "ascending",
  DESCENDING: "descending",
};

export const orderTypes = {
  DATE_CREATED: "dateCreated",
  DATE_UPDATED: "dateUpdated",
};

export const incidentTypes = {
  BUG: Incident.ITypeIncident.BUG,
  FEATURED: Incident.ITypeIncident.FEATURE,
  TECHNICAL: Incident.ITypeIncident.TECHNICAL,
};
