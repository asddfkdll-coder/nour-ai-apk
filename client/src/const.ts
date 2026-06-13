export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * @description Local auth URLs - no external OAuth portal
 * @security-note Prevents redirect to undefined external URLs
 */
export const getLoginUrl = () => "/login";
export const getRegisterUrl = () => "/register";
