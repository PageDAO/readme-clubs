import { orbis, createPost } from './services/orbisClient';

const createTestPosts = async () => {
  const forumId = 'kjzl6cwe1jw1493t92y0tygz2bh5fxa28b0j32sw21d72q0lcqccnh0zyxtbrpv';
  
  // Add type assertion for isConnected call
  const connectionStatus = await (orbis as any).isConnected();
  if (!connectionStatus || connectionStatus.status !== 200) {
    console.error('Not connected to Orbis. Please connect first.');
    return;
  }

  const testPosts = [
    { body: 'This is the first test post for the forum.' },
    { body: 'Here is another post to check how the forum looks.' },
    { body: 'Lets see if multiple posts are displayed correctly.' },
  ];

  // Rest of the code...
};

export default createTestPosts;