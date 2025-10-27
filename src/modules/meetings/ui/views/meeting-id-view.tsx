"use client"

import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { MeetingIdViewHeader } from '../components/meeting-id-view-header';
import { useRouter } from 'next/navigation';

import { useConfirm } from '@/hooks/use-confirms';
import { UpdateMeetingDialog } from '../components/update-meeting-dialog';
import { useState } from 'react';
import { UpcomingState } from '../components/upcoming-state';
import { ActiveState } from '../components/active-state';
import { CancelledState } from '../components/cancel-state';
import { ProcessingState } from '../components/processing-state';

interface Props {
    meetingId: string;
};
export const MeetingIdView = ({meetingId}: Props) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

    const [RemoveConfirmation, confirmRemoval] = useConfirm(
        "Are you sure?",
        "The Following action will remove this meeting"
    ); 

    const router = useRouter();
    const { data } = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({ id: meetingId})
    );

    const removeMeeting = useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}))
                //TODO: Invalidate free tier usage
                router.push("/meetings");
            }
        })
    );

    const handleRemoveMeeting = async () => {
        const ok = await confirmRemoval();

        if (!ok) return;

        await removeMeeting.mutateAsync({ id: meetingId });
    }

    const isActive = data.status === "active";
    const isUpcoming = data.status === "upcoming";
    const isCancelled = data.status === "cancelled";
    const isCompleted = data.status === "completed";
    const isProcessing = data.status === "processing";

  return (
    <>
    <RemoveConfirmation />
    <UpdateMeetingDialog 
       open={updateMeetingDialogOpen}
       onOpenChange={setUpdateMeetingDialogOpen}
       initialValue={data}
    />
    <div className='flex-1 px-4 py-4 md:px-8 flex flex-col gap-y-4'>
        <MeetingIdViewHeader 
         meetingId={meetingId}
         meetingName={data.name}
         onEdit={() => setUpdateMeetingDialogOpen(true)}
         onRemove={handleRemoveMeeting}
        />
        {isCancelled && <CancelledState />}
        {isProcessing && <ProcessingState />}
        {isCompleted && <div>Completed</div>}
        {isActive && <ActiveState meetingId={meetingId}/>}
        {isUpcoming && (<UpcomingState 
           meetingId={meetingId}
           onCancelMeeting={() => {}}
           isCancelling={false}
        />)}
    </div>
    </>
  );
}

export const MeetingIdViewLoading = () => {
  return (
    <LoadingState
      title="Loading Meeting"
      description="This may take a few seconds"
    />
  );
};

export const MeetingIdViewError = () => {
  return (
    <ErrorState
      title="Error Loading Meeting"
      description="Please try again later"
    />
  );
};
