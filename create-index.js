// create-index.js
const client = require('./utils/elasticsearchClient');

(async () => {
  try {
    const exists = await client.indices.exists({ index: 'posts' });
    if (!exists.body) {
      await client.indices.create({
        index: 'posts',
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              username: { type: 'text' },
              content: { type: 'text' },
              created_at: { type: 'date' }
            }
          }
        }
      });
      console.log('✅ Created index: posts');
    } else {
      console.log('ℹ️ Index posts already exists');
    }
  } catch (err) {
    console.error('❌ Lỗi khi tạo index:', err.meta?.body?.error || err);
  }
})();
