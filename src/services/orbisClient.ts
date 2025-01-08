import { Orbis } from '@orbisclub/orbis-sdk';
import { usePublicClient, useAccount, useConnect } from 'wagmi';

// Add type definitions
interface OrbisConnectResponse {
  status: number;
  did: string;
  details?: any;
}

interface OrbisResponse {
  status: number;
  doc?: any;
  data?: any;
  error?: string;
}

// Initialize Orbis SDK
const orbis = new Orbis();

// Use your actual context ID
const FORUM_CONTEXT_ID = 'kjzl6cwe1jw1493t92y0tygz2bh5fxa28b0j32sw21d72q0lcqccnh0zyxtbrpv';

// Function to connect the user to Orbis
export const connectUser = async () => {
  try {
    const publicClient = usePublicClient();
    const { address } = useAccount();
    const { connectAsync, connectors } = useConnect();
    
    if (!publicClient) {
      throw new Error('No compatible Ethereum client found');
    }

    // If not connected, connect first
    if (!address && connectors.length > 0) {
      await connectAsync({ connector: connectors[0] });
    }

    // Create a provider wrapper that Orbis can understand
    const provider = {
      provider: publicClient,
      enable: async () => {
        return address ? [address] : [];
      }
    };

    const res = await orbis.connect(provider, true);
    if (res.status === 200) {
      console.log('User connected successfully:', res.did);
      return res.did;
    } else {
      console.error('Error connecting user:', res);
      return null;
    }
  } catch (error) {
    console.error('Error in connectUser:', error);
    return null;
  }
};

// Function to create a post in a specific forum context
export const createPost = async (forumId: string, content: string) => {
  try {
    // Check connection status before attempting to post
    const connectionStatus = await (orbis as any).isConnected() as OrbisConnectResponse;
    if (!connectionStatus || connectionStatus.status !== 200) {
      console.error('User not connected to Orbis. Please connect first.');
      return null;
    }

    const res = await orbis.createPost({
      context: forumId,
      body: content,
    }) as OrbisResponse;

    if (res.status === 200) {
      console.log('Post created:', res.doc);
      return res.doc;
    } else {
      console.error('Error creating post:', res);
      return null;
    }
  } catch (error) {
    console.error('Error in createPost:', error);
    return null;
  }
};

// Function to fetch posts for a specific forum context
export const fetchPosts = async (forumId: string): Promise<any[]> => {
  try {
    const response = await orbis.getPosts({
      context: forumId,
    });

    // Handle both array and object responses
    const posts = Array.isArray(response) ? response : response?.data || [];
    return posts;
  } catch (error) {
    console.error('Error in fetchPosts:', error);
    return []; // Return an empty array if there's an error
  }
};

export { orbis };