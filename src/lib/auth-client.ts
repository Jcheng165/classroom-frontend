/**
 * Better-Auth React client wrapper.
 *
 * Refine uses this client to perform sign-in/sign-up calls and to fetch the
 * currently authenticated session user.
 */
import { createAuthClient } from "better-auth/react";
import { BACKEND_BASE_URL, USER_ROLES } from "../constants";

/**
 * Auth client configured for our backend.
 * - `baseURL` targets the backend auth endpoints.
 * - `additionalFields` feeds extra user metadata (role/department/image pub id).
 */
export const authClient = createAuthClient({
  baseURL: `${BACKEND_BASE_URL}auth`,
  user: {
    additionalFields: {
      role: {
        type: USER_ROLES,
        required: true,
        defaultValue: "student",
        input: true,
      },
      department: {
        type: "string",
        required: false,
        input: true,
      },
      imageCldPubId: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});
