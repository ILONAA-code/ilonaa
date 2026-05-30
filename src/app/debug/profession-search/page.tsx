import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProfessionSearchDebugPage } from "@/components/debug/ProfessionSearchDebugPage";

export const metadata: Metadata = {
  title: "Profession Search Debug",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DebugProfessionSearchRoute() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <ProfessionSearchDebugPage />;
}
