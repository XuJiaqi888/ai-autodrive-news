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

// DELETE - 删除评论
export async function DELETE(request, { params }) {
  try {
    const authorization = request.headers.get('authorization');
    const user = await getUser(authorization);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { postId, commentId } = params;

    await client.connect();
    const db = client.db('lyratech');
    
    // 查找帖子
    const post = await db.collection('blogPosts').findOne({ _id: new ObjectId(postId) });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // 查找评论并验证作者
    const comment = post.comments?.find(c => c.id === commentId);
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // 检查是否是评论作者
    if (comment.author.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // 删除评论
    await db.collection('blogPosts').updateOne(
      { _id: new ObjectId(postId) },
      { $pull: { comments: { id: commentId } } }
    );
    
    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 