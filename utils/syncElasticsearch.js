//file untils/syncElasticsearch.js
const client = require('./elasticsearchClient');

async function indexPostToES(post) {
  await client.index({
    index: 'posts',
    id: post.id.toString(),
    body: post
  });
}

async function deletePostFromES(postId) {
  await client.delete({
    index: 'posts',
    id: postId.toString()
  });
}

module.exports = { indexPostToES, deletePostFromES };
