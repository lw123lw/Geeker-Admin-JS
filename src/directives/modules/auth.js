/**
 * v-auth
 * 按钮权限指令
 */
import { useAuthStore } from "@/stores/modules/auth";

const auth = {
  mounted(el, binding) {
    const { value } = binding;
    const authStore = useAuthStore();
    const currentPageRoles = authStore.authButtonListGet[authStore.routeName] ?? [];
    if (value instanceof Array && value.length) {
      const hasPermission = value.every(item => currentPageRoles.includes(item));
      if (!hasPermission) el.remove();
    } else {
      if (!currentPageRoles.includes(value)) el.remove();
    }
  }
};

export default auth;
