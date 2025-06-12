-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create function to get chat participants
CREATE OR REPLACE FUNCTION get_chat_participants(user_id UUID)
RETURNS TABLE (
  participant_id UUID,
  participant_name TEXT,
  participant_avatar TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH chat_users AS (
    SELECT DISTINCT
      CASE 
        WHEN sender_id = user_id THEN receiver_id
        ELSE sender_id
      END as participant_id
    FROM messages
    WHERE sender_id = user_id OR receiver_id = user_id
  ),
  last_messages AS (
    SELECT 
      DISTINCT ON (
        CASE 
          WHEN sender_id = user_id THEN receiver_id
          ELSE sender_id
        END
      )
      CASE 
        WHEN sender_id = user_id THEN receiver_id
        ELSE sender_id
      END as participant_id,
      content as last_message,
      created_at as last_message_time
    FROM messages
    WHERE sender_id = user_id OR receiver_id = user_id
    ORDER BY participant_id, created_at DESC
  ),
  unread_messages AS (
    SELECT 
      sender_id,
      COUNT(*) as unread_count
    FROM messages
    WHERE receiver_id = user_id AND read_at IS NULL
    GROUP BY sender_id
  )
  SELECT 
    cu.participant_id,
    p.name as participant_name,
    p.avatar_url as participant_avatar,
    lm.last_message,
    lm.last_message_time,
    COALESCE(um.unread_count, 0) as unread_count
  FROM chat_users cu
  JOIN profiles p ON p.id = cu.participant_id
  LEFT JOIN last_messages lm ON lm.participant_id = cu.participant_id
  LEFT JOIN unread_messages um ON um.sender_id = cu.participant_id
  ORDER BY lm.last_message_time DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql; 