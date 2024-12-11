import { ModeToggle } from "@/components/mode-toggle";
import { Globe } from "@/components/globe";

export default function Home() {
  return (
    <div className="h-screen">
      <div className="z-50 absolute bottom-0 left-0"><ModeToggle /></div>
      <Globe />
    </div>
  );
}
