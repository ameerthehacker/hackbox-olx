import { Volume } from 'memfs';

function bundle(files: Record<string, string | null>) {
  const vol = Volume.fromJSON(files);

  console.log(vol.toJSON());
}

export { bundle };
