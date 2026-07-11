import { put, del, list } from '@vercel/blob';

export async function uploadFile(file, filename) {
  const blob = await put(filename, file, {
    access: 'public',
  });
  return blob;
}

export async function deleteFile(url) {
  await del(url);
}

export async function listFiles() {
  const { blobs } = await list();
  return blobs;
}
