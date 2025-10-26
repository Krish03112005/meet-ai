"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { AgentIdViewHeader } from "../components/agent-id-view-header";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirms";
import React, { useState } from "react";
import { UpdateAgentDialog } from "../components/update-agent-dialog";
import { VoiceChat } from "../components/voice-chat";
import { CHAT_API_URL } from "@/config/constants";

interface Props {
  agentId: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AgentIdView = ({ agentId }: Props) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [updateAgentDialogOpen, setUpdateAgentDialogOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const { data } = useSuspenseQuery(trpc.agents.getOne.queryOptions({ id: agentId }));

  const removeAgent = useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
        router.push("/agents");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const [Removeconfirmation, confirmRemove] = useConfirm(
    "Are you sure?",
    `The following action will remove ${data.meetingCount} associate meetings`,
  );

  const handleRemoveAgent = async () => {
    const ok = await confirmRemove();
    if (!ok) return;
    await removeAgent.mutateAsync({ id: agentId });
  };

  async function sendMessage() {
    if (!input.trim()) return;

    try {
      const persona = data.instructions || "";
      setMessages((prev) => [...prev, { role: "user", content: input }]);
      setInput("");

      const res = await fetch(`${CHAT_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentname: data.name,
          message: input,
          persona: persona,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const { response } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Chat error:", error);
    }
  }

  return (
    <>
      <Removeconfirmation />
      <UpdateAgentDialog
        open={updateAgentDialogOpen}
        onOpenChange={setUpdateAgentDialogOpen}
        initialValues={data}
      />
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <AgentIdViewHeader
          agentId={agentId}
          agentName={data.name}
          onEdit={() => setUpdateAgentDialogOpen(true)}
          onRemove={handleRemoveAgent}
        />
        <div className="bg-white rounded-lg border">
          <div className="px-4 py-5 gap-y-5 flex flex-col">
            <div className="flex items-center gap-x-3">
              <GeneratedAvatar
                variant="botttsNeutral"
                seed={data.name}
                className="size-10"
              />
              <h2 className="text-2xl font-medium">{data.name}</h2>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-x-2 [&>svg]:size-4"
            >
              <VideoIcon className="text-green-500" />
              {data.meetingCount} {data.meetingCount === 1 ? "meeting" : "meetings"}
            </Badge>
            <div className="flex flex-col gap-y-4">
              <p className="text-lg font-medium">Instructions</p>
              <p className="text-neutral-800">{data.instructions}</p>
            </div>

            <div className="flex flex-col gap-y-2 mt-6">
              <div className="chat-history min-h-[120px] border rounded-lg p-4 bg-neutral-50">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`mb-2 ${m.role === "user" ? "text-right text-blue-600" : "text-left text-neutral-800"}`}
                  >
                    <strong>{m.role === "user" ? "You" : data.name}:</strong> {m.content}
                  </div>
                ))}
              </div>
              <div className="flex gap-x-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Type your message"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
              </div>
              <VoiceChat agentName={data.name} agentPersona={data.instructions} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const AgentsIdViewLoading = () => (
  <LoadingState title="Loading Agents" description="This may take a few seconds." />
);

export const AgentsIdViewError = () => (
  <ErrorState title="Error Loading Agents" description="Something went wrong" />
);
