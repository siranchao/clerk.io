import { User } from "lucide-react";
import Image from "next/image";

export const Icons = {
    user: User,
    logo: () => (
        <Image 
        src="/icon.png" 
        alt="logo" 
        width={100} 
        height={100}
        className="h-full w-full p-0.5"
        />
    )
}