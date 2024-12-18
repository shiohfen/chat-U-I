// import { ModeToggle } from "@/components/mode-toggle";
import { Globe } from "@/components/globe";
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from "next/navigation";
export default async function Home() {
  const user = await currentUser()
  if (user) redirect('/chats')
  return (
    <div className="h-screen">
      {/* <div className="z-50 absolute bottom-0 left-0"><ModeToggle /></div> */}
      <Globe />
    </div>
  );
}
