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

// POST - 切换点赞状态
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

    await client.connect();
    const db = client.db('lyratech');
    
    const post = await db.collection('blogPosts').findOne({ _id: new ObjectId(postId) });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const likes = post.likes || [];
    const isLiked = likes.includes(user.id);
    
    let updateOperation;
    if (isLiked) {
      // 取消点赞
      updateOperation = { $pull: { likes: user.id } };
    } else {
      // 添加点赞
      updateOperation = { $addToSet: { likes: user.id } };
    }

    await db.collection('blogPosts').updateOne(
      { _id: new ObjectId(postId) },
      updateOperation
    );

    const updatedPost = await db.collection('blogPosts').findOne({ _id: new ObjectId(postId) });
    
    return NextResponse.json({
      likes: updatedPost.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 