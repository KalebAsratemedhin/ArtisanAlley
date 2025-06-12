-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Add RLS policies
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Allow users to follow/unfollow others
CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Allow users to view follows
CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true); 