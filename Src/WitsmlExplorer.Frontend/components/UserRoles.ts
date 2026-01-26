import { UserRole } from "contexts/operationStateReducer";

export function IsUserRoleAdvanced(userRole: UserRole): boolean {
  if (userRole == UserRole.Advanced || userRole == UserRole.Expert) return true;
  return false;
}

export function IsUserRoleExpert(userRole: UserRole): boolean {
  if (userRole == UserRole.Expert) return true;
  return false;
}
