-- Create contact_submissions table for storing booking inquiries
CREATE TABLE public.contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    preferred_date DATE,
    preferred_time TIME,
    party_size INTEGER,
    event_type VARCHAR(100),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow staff and admins to view all submissions
CREATE POLICY "Staff and admins can view contact submissions" ON public.contact_submissions
    FOR SELECT USING (public.is_staff_or_admin());

-- Allow staff and admins to update submissions (for status changes)
CREATE POLICY "Staff and admins can update contact submissions" ON public.contact_submissions
    FOR UPDATE USING (public.is_staff_or_admin());

-- Allow anyone to insert contact submissions (for the contact form)
CREATE POLICY "Anyone can create contact submissions" ON public.contact_submissions
    FOR INSERT WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX idx_contact_submissions_email ON public.contact_submissions(email);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_submissions_updated_at 
    BEFORE UPDATE ON public.contact_submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
