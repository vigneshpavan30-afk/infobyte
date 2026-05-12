import { supabase } from './supabaseClient'

export async function listConversations({ userId }) {
  // In a real app, you might have a 'conversations' table.
  // For now, we'll fetch unique senders/receivers from the messages table.
  const { data, error } = await supabase
    .from('messages')
    .select('sender_id, receiver_id')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  const participants = new Set();
  data.forEach(m => {
    if (m.sender_id !== userId) participants.add(m.sender_id);
    if (m.receiver_id !== userId) participants.add(m.receiver_id);
  });

  return Array.from(participants);
}

export async function getMessages({ userId, otherId }) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function sendMessage({ senderId, receiverId, content }) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function subscribeToMessages(userId, onMessage) {
  return supabase
    .channel('public:messages')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages',
      filter: `receiver_id=eq.${userId}`
    }, (payload) => {
      onMessage(payload.new);
    })
    .subscribe();
}
