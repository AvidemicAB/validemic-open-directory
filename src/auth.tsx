/** The open build has no accounts. Workspace links go to validemic.com. */
export function useAuth(): { user: null; logout: () => void } {
  return { user: null, logout: () => {} }
}
