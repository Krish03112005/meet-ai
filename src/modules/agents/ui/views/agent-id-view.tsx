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
import { useState } from "react";
import { UpdateAgentDialog } from "../components/update-agent-dialog copy";

interface Props {
    agentId: string;
}

export const AgentIdView = ({ agentId }: Props) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [updateAgentDialogOpen, setUpdateAgentDialogOpen] = useState(false);
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

    // --- Chat state and functions ---
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");

    async function sendMessage() {
        if (!input.trim()) return;
        const persona = data.instructions || ""; // Use your agent's system prompt
        setMessages(prev => [...prev, { role: "user", content: input }]);
        setInput("");

        // Add this for debugging:
        console.log("Sending POST to /chat", {
            agentname: data.name,
            message: input,
            persona: persona
    });

    const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        agentname: data.name,
        message: input,
        persona: persona,
        }),
    });

    const { response } = await res.json();

    // Optional: log what comes back from backend
    console.log("Backend replied:", response);

    setMessages(prev => [...prev, { role: "assistant", content: response }]);
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
                    <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5 ">
                        <div className="flex item-center gap-x-3">
                            <GeneratedAvatar
                                variant="botttsNeutral"
                                seed={data.name}
                                className="size-10"
                            />
                            <h2 className="text-2xl font-medium ">{data.name}</h2>
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

                        {/* Chat UI Starts Here */}
                        <div className="flex flex-col gap-y-2 mt-6">
                            <div
                                className="chat-history"
                                style={{
                                    minHeight: 120,
                                    border: "1px solid #eee",
                                    borderRadius: "8px",
                                    padding: "10px",
                                    marginBottom: 10,
                                    background: "#fafafa",
                                }}
                            >
                                {messages.map((m, i) => (
                                    <div
                                        key={i}
                                        className={m.role === "user" ? "text-right" : "text-left"}
                                        style={{
                                            marginBottom: 8,
                                            color: m.role === "user" ? "#087ea4" : "#333",
                                        }}
                                    >
                                        <b>{m.role === "user" ? "You" : data.name}:</b> {m.content}
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") sendMessage();
                                    }}
                                    className="flex-1 border rounded px-2 py-1"
                                    placeholder="Type your message"
                                    style={{ flex: 1 }}
                                />
                                <button
                                    onClick={sendMessage}
                                    className="bg-blue-500 text-white rounded px-4 py-1"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                        {/* Chat UI Ends Here */}

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
