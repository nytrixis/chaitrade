import axios from 'axios';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
  console.warn('Pinata API keys not configured');
}

const pinataApi = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: {
    'pinata_api_key': PINATA_API_KEY,
    'pinata_secret_api_key': PINATA_SECRET_KEY,
  },
});

/**
 * Upload file to Pinata IPFS
 * @param file File to upload
 * @param metadata Optional metadata
 * @returns IPFS CID
 */
export async function uploadToPinata(
  file: File,
  metadata?: Record<string, string>
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  if (metadata) {
    formData.append(
      'pinataMetadata',
      JSON.stringify({
        name: file.name,
        keyvalues: metadata,
      })
    );
  }

  try {
    const response = await pinataApi.post('/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

/**
 * Retrieve file from Pinata IPFS
 * @param cid IPFS CID
 * @returns IPFS gateway URL
 */
export function getIPFSUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

/**
 * Upload JSON metadata to Pinata
 * @param metadata Object to upload
 * @param name Name for metadata
 * @returns IPFS CID
 */
export async function uploadMetadataToPinata(
  metadata: Record<string, any>,
  name: string
): Promise<string> {
  try {
    const response = await pinataApi.post('/pinning/pinJSONToIPFS', {
      pinataMetadata: {
        name,
      },
      pinataContent: metadata,
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    throw error;
  }
}
