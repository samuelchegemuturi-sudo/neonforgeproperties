export type PlanLimits = {
  properties: number;
  staff: number;
  storage_gb: number;
  api_keys: number;
  branches: number;
};

export type PlanFeatures = string[];

export const DEFAULT_PLAN_LIMITS: PlanLimits = {
  properties: 5,
  staff: 5,
  storage_gb: 5,
  api_keys: 3,
  branches: 1,
};

export function canAddProperty(currentCount: number, limits?: PlanLimits): boolean {
  if (!limits) return currentCount < DEFAULT_PLAN_LIMITS.properties;
  return currentCount < limits.properties;
}

export function canAddStaff(currentCount: number, limits?: PlanLimits): boolean {
  if (!limits) return currentCount < DEFAULT_PLAN_LIMITS.staff;
  return currentCount < limits.staff;
}

export function hasFeature(feature: string, features?: PlanFeatures): boolean {
  if (!features) return false;
  return features.includes(feature) || features.includes("unlimited_everything");
}
