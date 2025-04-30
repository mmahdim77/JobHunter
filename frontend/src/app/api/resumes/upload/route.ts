import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    // Forward the request to the backend
    const response = await fetch('http://localhost:5001/api/resumes/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
      body: formData, // Send the original formData directly
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload resume');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload resume' },
      { status: 500 }
    );
  }
} 