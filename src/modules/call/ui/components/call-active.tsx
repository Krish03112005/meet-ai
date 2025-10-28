import Link from"next/link";
import Image from "next/image";
import {
    CallControls,
    SpeakerLayout,
} from "@stream-io/video-react-sdk";


interface Props {
    onLeave: () => void;
    meetingName: String;
};


export const CallActive = ({ onLeave, meetingName}: Props) => {
    return (
        <div className="flex flex-col justify-between p-4 h-screen text-white">
            <div className="bg-[#282f33] rounded-full p-4 flex items-center gap-4">
               <Link href="/" className="flex items-center justify-center p-1 bg-white/10 rounded-full w-fit">
                  <Image src="/logo.svg" width={24} height={22} alt="Logo"/>
               </Link>
                    <h4 className="text-base">
                            {meetingName}
                    </h4>
            </div>
            <SpeakerLayout />
            <div className="bg-[#282f33] rounded-full px-4">
                <CallControls onLeave={onLeave}/>
            </div>
        </div>
    )
}