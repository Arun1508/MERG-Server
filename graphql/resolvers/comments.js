const { UserInputError, AuthenticationError } = require('apollo-server')

const Post = require('../../models/Post');
const checkAuth = require('../../utils/check-auth');

module.exports = {
    Mutation: {
        deleteComment: async (_, {postId, commentId}, context) => {
            const user = checkAuth(context);
            try{
                const post = await Post.findById(postId);
                //if(post.username === user.username){
                const commentIndex = await post.comments.findIndex(c => c.id === commentId);
                post.comments.splice(commentIndex, 1);
                await post.save()
                return post
               // }
              // throw new AuthenticationError('Action not allowed');
            }catch(err) {throw new Error(err)};
        },
        createComment: async (_, {postId, body}, context) => {

            const {username} = checkAuth(context);
            if(body.trim() === ''){
                throw new UserInputError('Empty comment', {
                    errors:{
                        body: 'comment body must not be empty'
                    }
                });
            }
            try{
                const post = await Post.findById(postId);
                if(post){
                    post.comments.unshift({
                        body,
                        username,
                        createdAt: new Date().toISOString()
                    });
                    await post.save();
                    return post;
                }else throw new UserInputError('Post not found');

            }catch(err){ throw new Error(err)}
            

        },
    
    }
}