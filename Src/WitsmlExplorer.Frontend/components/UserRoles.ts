import { UserRole } from "contexts/operationStateReducer";
import { useOperationState } from "hooks/useOperationState";
import { FC, ReactNode } from "react";

export function isUserRoleAdvanced(userRole: UserRole): boolean {
  return userRole === UserRole.Advanced || userRole === UserRole.Expert;
}

export function isUserRoleExpert(userRole: UserRole): boolean {
  return userRole === UserRole.Expert;
}

export function hasRequiredRole(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  return requiredRole === UserRole.Expert
    ? isUserRoleExpert(userRole)
    : requiredRole === UserRole.Advanced
    ? isUserRoleAdvanced(userRole)
    : true;
}

type RoleLimitedAccessProps = {
  requiredRole: UserRole;
  children: ReactNode;
};

export const RoleLimitedAccess: FC<RoleLimitedAccessProps> = ({
  requiredRole,
  children
}) => {
  const {
    operationState: { userRole }
  } = useOperationState();

  if (!hasRequiredRole(userRole, requiredRole)) {
    return null;
  }

  return children;
};
