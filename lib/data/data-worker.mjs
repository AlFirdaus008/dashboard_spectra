import {validateCollection} from './validate.mjs';

self.onmessage = async event => {
  const {url, metadata, scope} = event.data;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Data peta yang diminta gagal dimuat.');
    const data = validateCollection(await response.json(), metadata, scope);
    self.postMessage({ok: true, data});
  } catch (error) {
    self.postMessage({ok: false, error: error.message});
  }
};
