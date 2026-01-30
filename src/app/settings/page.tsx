import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import SettingsClient from "./SettingsClient";
import Image from "next/image";

export const metadata = {
  title: "Settings | FragView",
  description: "Manage your account settings",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      email: true,
      image: true,
      bio: true,
      location: true,
      isWardrobePublic: true,
      isActivityPublic: true,
      // 🆕 Email notification preferences (only 2 fields now)
      emailNotifWeeklyDigest: true,
      unsubscribedFromAll: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  return (
    <div className="bg-white">
      <section
        className="relative w-full py-9 flex items-center"
        //  style={{
        //   background: `linear-gradient(90deg, rgba(33, 31, 28, 0.6) 20.81%, rgba(33, 31, 28, 0.4) 88.57%), url('/set/bg.png')`,
        //   backgroundSize: "cover",
        //   backgroundPosition: "center",
        // }}
      >
                <Image src="/set/bg.png" alt="perfumes-hero" width={1440} height={853} className="absolute w-full h-full object-cover " />
             <div className="absolute inset-0 bg-[#211F1C] opacity-50" />

        <div className="mx-auto max-w-[1440px] w-full px-4 sm:px-6 lg:px-[72px] z-20">
          <div className="max-w-[775px] flex flex-col gap-3 lg:gap-4 p-4 lg:p-0">
            {/* Title */}
            <h1 className="font-hedvig font-normal text-[32px] leading-[40px] sm:text-[44px] sm:leading-[52px] lg:text-[56px] lg:leading-[64px] text-white">
              Manage your account preferences
            </h1>
            {/* Description */}
            <p className="font-hedvig font-normal text-[16px] leading-[24px] sm:text-[20px] sm:leading-[28px] lg:text-[24px] lg:leading-[32px] text-white">
              Control the settings that guide your experience and keep
              everything aligned with your preferences.
            </p>
          </div>
        </div>
      </section>{" "}
      <SettingsClient user={user} />
    </div>
  );
}
