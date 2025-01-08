declare module '@orbisclub/orbis-sdk' {
  export class Orbis {
    /**
     * Connects to an EVM wallet and creates or connects to a Ceramic DID.
     * @param provider - The Ethereum provider (e.g., MetaMask, WalletConnect).
     * @param lit - Whether to connect to the Lit network (default: true).
     * @returns A promise that resolves to an object containing the connection status, DID, and details.
     */
    connect(provider?: any, lit?: boolean): Promise<{
      status: number;
      did: string;
      details: any;
      result: string;
    }>;

    /**
     * Creates a post in a specific forum context.
     * @param options - The post options, including the context and body.
     * @returns A promise that resolves to the created post.
     */
    createPost(options: { context: string; body: string }): Promise<any>;

    /**
     * Fetches posts for a specific forum context.
     * @param options - The fetch options, including the context.
     * @returns A promise that resolves to an object containing the fetched posts.
     */
    getPosts(options: { context: string }): Promise<{ data: any[] }>;
  }

  export default Orbis;
}