import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const client = new MongoClient(process.env.MONGODB_URI);

async function getUser(token) {
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

// POST - 添加评论
export async function POST(request, { params }) {
  try {
    const authorization = request.headers.get('authorization');
    const user = await getUser(authorization);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { postId } = params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db('lyratech');
    
    // 获取用户信息
    const userData = await db.collection('users').findOne({ _id: new ObjectId(user.id) });
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const comment = {
      id: new ObjectId().toString(),
      content: content.trim(),
      author: {
        userId: user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.avatar || null
      },
      createdAt: new Date()
    };

    const result = await db.collection('blogPosts').updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: comment } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 