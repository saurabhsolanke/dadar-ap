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
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateUser(uid: string, data: { email?: string; displayName?: string; name?: string; role?: string }) {
  try {
    const auth = getAdminAuth();
    const updateData: { email?: string; displayName?: string } = {};
    
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
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteUser(uid: string) {
    try {
        const auth = getAdminAuth();
        await auth.deleteUser(uid);
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}
export async function listUsers() {
  try {
    const auth = getAdminAuth();
    const listResult = await auth.listUsers();
    
    return listResult.users.map(user => ({
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.customClaims?.role || "user",
      createdAt: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
    }));
  } catch (error) {
    console.error("Error listing users:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
