
import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { sendInviteEmail } from "@/lib/sendInviteEmail";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {

  try {
    const { email, orgId, invitedBy, role } = await req.json();
    if (!email || !orgId || !role) {
      return NextResponse.json({ error: "Missing email, orgId or role" }, { status: 400 });
    }
    // Get logged-in userId from Clerk
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "No authenticated user found" }, { status: 401 });
    }
    // Check if user already exists in the organization
    const memberships = await clerkClient.organizations.getOrganizationMembershipList({ organizationId: orgId });
    const exists = memberships.some((m: any) => m.publicUserData?.identifier?.toLowerCase() === email.toLowerCase() || m.publicUserData?.emailAddress?.toLowerCase() === email.toLowerCase());
    if (exists) {
      return NextResponse.json({ error: "El usuario ya existe en la organización." }, { status: 409 });
    }
    // Get org info for email
    const org = await clerkClient.organizations.getOrganization({ organizationId: orgId });
    // Try to create invitation in Clerk
    let invitation;
    try {
      invitation = await clerkClient.organizations.createOrganizationInvitation({
        organizationId: orgId,
        emailAddress: email,
        inviterUserId: userId,
        role,
      });
      // Log the invitation response for debugging
      console.log('Clerk invitation response:', invitation);
    } catch (err: any) {
      // Clerk error: invitation already exists
      if (err?.errors && Array.isArray(err.errors)) {
        const alreadyExists = err.errors.find((e: any) =>
          e.code === "duplicate_record" ||
          (typeof e.message === "string" && e.message.toLowerCase().includes("duplicate invitation"))
        );
        if (alreadyExists) {
          return NextResponse.json({ error: "Ya existe una invitación activa para este usuario." }, { status: 409 });
        }
      }
      // Other Clerk errors
      return NextResponse.json({ error: err?.message || "Error al invitar usuario" }, { status: 500 });
    }
    return NextResponse.json({ success: true, invitation });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to send invitation" }, { status: 500 });
  }
}
