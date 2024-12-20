"use client";
import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@clerk/nextjs";
import { Check } from "lucide-react";
import Loading from "../app/loading";

export default function Messages() {
    const { isLoaded,user } = useUser();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchMessages() {
            try {
                setIsLoading(true);
                const { data: messages, error } = await supabase
                    .from('messages')
                    .select('*')
                    .order('created_at', { ascending: true });
                
                if (error) throw error;

                setMessages(messages || []);
            } catch (error) {
                console.error('Error fetching messages:', error);
                setError('Failed to load messages. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('messages')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'messages' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setMessages(prev => [...prev, payload.new]);
                    } else if (payload.eventType === 'DELETE') {
                        setMessages(prev => prev.filter(message => message.message_id !== payload.old.message_id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (isLoading) {
        return <div className="flex justify-center p-4">Loading messages...</div>;
    }
    if (!isLoaded) {
        return <Loading />;
    }else if (user) {
        messages.map((msg) => {
            if (msg.user_id === user.id) {
                msg.is_from_me = true;
            }
        });
    }

    if (error) {
        return <div className="text-red-500 p-4 text-center">{error}</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            {messages.map((msg) => (
                <div key={msg.message_id} className={msg.is_from_me ? "text-right" : "text-left"}>
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
