import { sp } from "@pnp/sp/presets/all";

export const isCurrentUserIsadmin = async (
  groupName: string
): Promise<boolean> => {
  try {
    // Get current user's ID
    const currentUser = await sp.web.currentUser.get();
    const userId = currentUser.Id;

    // Get the group's users
    const group = await sp.web.siteGroups.getByName(groupName);
    const users = await group.users.get();

    // Check if the current user is in the group
    return users.some((user: any) => user.Id === userId);
  } catch (error) {
    console.error("Error checking user group membership:", error);
    return false;
  }
};
