// src/hooks/usePermission.js
import { useSelector } from "react-redux";

export const usePermission = () => {
  const { user } = useSelector((state) => state.auth);
  // Assuming user object contains permissions array from your 'role_has_permission' table
  const permissions = user?.permissions || [];

  const checkPermission = (moduleName, action = 'is_read') => {
    const modulePerm = permissions.find(p => p.module_name === moduleName);
    return modulePerm ? modulePerm[action] : false;
  };

  return { checkPermission };
};