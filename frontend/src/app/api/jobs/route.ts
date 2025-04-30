import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const endpoint = pathSegments[pathSegments.length - 1] || 'my-jobs';

  try {
    const response = await fetch(`http://localhost:5001/jobs/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await fetch('http://localhost:5001/jobs/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to search jobs');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json({ error: 'Failed to search jobs' }, { status: 500 });
  }
} 