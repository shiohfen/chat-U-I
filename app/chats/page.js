"use client";
import { useState, useRef, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
    // ArrowLeft,
    // CircleUser,
    // Settings,
    // Layout,
    Search,
    Send,
    Check,
    ArrowDown,
    Plus
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import Loading from "./loading";
import Messages from "@/components/messages";
import { createClerkSupabaseClient } from "@/utils/supabase/client";

export default function Chats() {
    const { isLoaded, user } = useUser();
    const [open, setOpen] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const supabase = createClerkSupabaseClient();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
    };

    useEffect(() => {
        scrollToBottom();
    }, []);

    if (!isLoaded) {
        return <Loading />;
    }

    async function handleSendMessage() {
        if (!messageInput.trim() || isSending) return;

        try {
            setIsSending(true);

            const { error } = await supabase
                .from('messages')
                .insert([
                    {
                        message: messageInput.trim(),
                        user_id: user?.id,
                        message_type: "private",
                        updated_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;

            setMessageInput("");
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    }

    return (
        (<div
            className={cn(
                "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
                "h-screen"
            )}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ?
                            <Link
                                href="#"
                                className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
                                <div
                                    className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-medium text-black dark:text-white whitespace-pre">
                                    Chat U & I
                                </motion.span>
                            </Link>
                            : <Link
                                href="#"
                                className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
                                <div
                                    className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
                            </Link>}
                        {/* <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div> */}
                    </div>
                    <div>
                        <SignedIn>
                            <div className="flex items-center gap-2">
                                <UserButton />
                                {open && <p>{user.fullName}</p>}
                            </div>
                        </SignedIn>
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className="flex flex-1">
                <div className="p-2 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex gap-2 w-full h-full">
                    <div className="h-full w-1/3 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-y-auto">
                        <div className="p-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search chats..."
                                        className="w-full p-2 pl-8 rounded-lg bg-gray-200 dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Search className="w-4 h-4 absolute left-2 top-3 text-gray-500" />
                                </div>
                                <button
                                    className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                                    onClick={() => {/* Add new chat logic here */ }}
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="p-3 flex gap-3 items-center bg-blue-500/10 border-l-4 border-blue-500 cursor-pointer hover:bg-blue-500/20">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">SP</div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-100 dark:border-neutral-800"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold">Sarah Parker</h3>
                                    <p className="text-sm text-gray-500 truncate">Perfect timing! I just wrapped up a similar project.</p>
                                </div>
                            </div>

                            <div className="p-3 flex gap-3 items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">JD</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold">John Doe</h3>
                                    <p className="text-sm text-gray-500 truncate">Thanks for the help with the React components!</p>
                                </div>
                            </div>

                            <div className="p-3 flex gap-3 items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">AW</div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-100 dark:border-neutral-800"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold">Alice Wilson</h3>
                                    <p className="text-sm text-gray-500 truncate">Let's catch up on the API integration later</p>
                                </div>
                            </div>

                            <div className="p-3 flex gap-3 items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold">MB</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold">Mike Brown</h3>
                                    <p className="text-sm text-gray-500 truncate">The new design looks great!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 flex flex-col relative">
                        <div className="border-b border-neutral-700 p-3">
                            <h1 className="font-semibold">Sarah Parker</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="text-sm text-gray-500">Online</p>
                            </div>
                        </div>
                        <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto" ref={messagesContainerRef} onScroll={handleScroll}>
                            <div className="text-center text-sm text-gray-500 my-2">December 17, 2024</div>
                            <Messages />
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-neutral-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="w-full p-2 rounded-full bg-gray-200 dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    disabled={isSending}
                                />
                                <button
                                    className={cn(
                                        "p-2 rounded-full bg-blue-500 text-white transition-colors",
                                        isSending ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                                    )}
                                    onClick={handleSendMessage}
                                    disabled={isSending}
                                >
                                    <Send className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        {showScrollButton && (
                            <button
                                onClick={scrollToBottom}
                                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all z-10"
                            >
                                <ArrowDown className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    {/* <div className="h-full w-1/3 rounded-lg  bg-gray-100 dark:bg-neutral-800"></div> */}
                </div>
            </div>
        </div>)
    );
}
