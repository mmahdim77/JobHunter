import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`http://localhost:5001/api/resumes/${params.id}/primary`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to set primary resume');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error setting primary resume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to set primary resume' },
      { status: 500 }
    );
  }
} 