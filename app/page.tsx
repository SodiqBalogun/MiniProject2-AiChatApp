import { ChatRoom } from "@/components/ChatRoom";
import { redirect } from "next/navigation";
import { authServer } from "@/lib/supabase/server-auth";

export default async function Home() {
  const { user } = await authServer.getUser();

  if (!user) {
    redirect("/login");
  }

  return <ChatRoom />;
}
