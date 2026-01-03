"use server";

import { getAdminAuth } from "@/lib/firebase-admin";

export async function getUser(uid: string) {
  try {
    const auth = getAdminAuth();
    const user = await auth.getUser(uid);
    // Return a plain object, serializable by Next.js
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      disabled: user.disabled,
      customClaims: user.customClaims,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function updateUser(uid: string, data: any) {
  try {
    const auth = getAdminAuth();
    const updateData: any = {};
    
    if (data.email) updateData.email = data.email;
    if (data.displayName) updateData.displayName = data.displayName; // Use Name field for displayName
    if (data.name) updateData.displayName = data.name; 
    
    // Role management via custom claims
    if (data.role) {
        await auth.setCustomUserClaims(uid, { role: data.role });
    }

    const user = await auth.updateUser(uid, updateData);
    return { success: true, uid: user.uid };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

export async function deleteUser(uid: string) {
    try {
        const auth = getAdminAuth();
        await auth.deleteUser(uid);
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("Failed to delete user");
    }
}
