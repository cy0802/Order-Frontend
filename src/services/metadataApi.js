import axios from 'axios';
import Metadata from '@/types/Metadata';

const apiClient = axios.create({
  baseURL: `http://${window.location.hostname}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getMetadata = async () => {
  let err = null;
  let metadata = null;
  try {
    const response = await apiClient.get('/api/metadata');
    metadata = new Metadata(response.data.id, response.data.name, response.data.hostname, response.data.table_num);
  } catch (error) {
    err = error;
  }
  return { err, metadata };
}