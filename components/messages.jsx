"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClerkSupabaseClient } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { Check } from "lucide-react";
import Loading from "../app/loading";

export default function Messages() {
    const { isLoaded, user } = useUser();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const supabaseClient = createClerkSupabaseClient();
    const channelRef = useRef(null);

    const formatMessage = useCallback((msg) => ({
        ...msg,
        is_from_me: msg.user_id === user?.id
    }), [user?.id]);

    const fetchMessages = useCallback(async () => {
        if (!user) return;
        
        try {
            const { data, error } = await supabaseClient
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true });
            
            if (error) throw error;

            const formattedMessages = (data || []).map(formatMessage);
            setMessages(formattedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to load messages. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [supabaseClient, user, formatMessage]);

    useEffect(() => {
        if (!isLoaded || !user) return;

        // Set up real-time subscription
        if (!channelRef.current) {
            channelRef.current = supabaseClient
                .channel('messages')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'messages' },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            const newMessage = formatMessage(payload.new);
                            setMessages(prev => [...prev, newMessage]);
                        } else if (payload.eventType === 'DELETE') {
                            setMessages(prev => 
                                prev.filter(message => message.id !== payload.old.id)
                            );
                        } else if (payload.eventType === 'UPDATE') {
                            setMessages(prev => 
                                prev.map(message => 
                                    message.id === payload.new.id 
                                        ? formatMessage(payload.new)
                                        : message
                                )
                            );
                        }
                    }
                )
                .subscribe();
        }

        // Initial fetch
        fetchMessages();

        return () => {
            if (channelRef.current) {
                channelRef.current.unsubscribe();
                channelRef.current = null;
            }
        };
    }, [isLoaded, user, supabaseClient, formatMessage, fetchMessages]);

    if (!isLoaded || !user) {
        return <Loading />;
    }

    if (error) {
        return <div className="text-red-500 p-4 text-center">{error}</div>;
    }

    if (isLoading && messages.length === 0) {
        return <div className="flex justify-center p-4">Loading messages...</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            {messages.map((msg) => (
                <div key={msg.id} className={msg.is_from_me ? "text-right" : "text-left"}>
                    <span className={`${
                        msg.is_from_me 
                            ? "bg-blue-500 text-white rounded-2xl rounded-tr-none" 
                            : "bg-gray-200 dark:bg-neutral-700 rounded-2xl rounded-tl-none"
                        } p-3 inline-block max-w-[80%] relative`}>
                        {msg.message}
                        <div className={`text-xs ${msg.is_from_me ? "text-blue-200" : "text-gray-500"} mt-1 flex items-center ${msg.is_from_me ? "justify-end" : "justify-start"} gap-1`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {msg.is_from_me && <Check className="w-4 h-4 inline" />}
                        </div>
                    </span>
                </div>
            ))}
        </div>
    );
}
