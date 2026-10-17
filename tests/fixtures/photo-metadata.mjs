// Small generated metadata fixtures, independent of a user's photographs.
export const xmp = Buffer.from(`<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:exif="http://ns.adobe.com/exif/1.0/" xmlns:tiff="http://ns.adobe.com/tiff/1.0/" xmlns:aux="http://ns.adobe.com/exif/1.0/aux/" exif:DateTimeOriginal="1998-06-12T23:30:00-07:00" exif:ExposureTime="1/125" exif:FNumber="28/10" exif:ISOSpeedRatings="400" exif:FocalLength="50/1" tiff:Make="Nikon" tiff:Model="Nikon F3" aux:Lens="50mm f/1.4"><dc:title><rdf:Alt><rdf:li xml:lang="x-default">Summer on film</rdf:li></rdf:Alt></dc:title><dc:description><rdf:Alt><rdf:li xml:lang="x-default">An evening in June.</rdf:li></rdf:Alt></dc:description></rdf:Description></rdf:RDF></x:xmpmeta>`);

export function jpegWithXmp(image = Buffer.from([0xff, 0xd8, 0xff, 0xd9])) {
  const payload = Buffer.concat([Buffer.from("http://ns.adobe.com/xap/1.0/\0"), xmp]);
  const marker = Buffer.from([0xff, 0xe1, 0, 0]);
  marker.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([image.subarray(0, 2), marker, payload, image.subarray(2)]);
}

// A RIFF chunk: four-character name, little-endian size, data, and a pad byte to an even length.
export function riffChunk(name, data, size = data.length) {
  const header = Buffer.alloc(8);
  header.write(name); header.writeUInt32LE(size, 4);
  return Buffer.concat([header, data, Buffer.alloc(data.length % 2)]);
}

export function webp(...chunks) {
  const body = Buffer.concat([Buffer.from("WEBP"), ...chunks]);
  const riff = Buffer.alloc(8);
  riff.write("RIFF"); riff.writeUInt32LE(body.length, 4);
  return Buffer.concat([riff, body]);
}

export const webpWithXmp = () => webp(riffChunk("XMP ", xmp));

// A minimal little-endian TIFF whose first IFD holds only Make and Model.
export function tiffWithCamera(make, model) {
  const strings = [Buffer.from(`${make}\0`), Buffer.from(`${model}\0`)];
  const ifd = Buffer.alloc(2 + 2 * 12 + 4);
  ifd.writeUInt16LE(2, 0);
  let offset = 8 + ifd.length;
  [0x010f, 0x0110].forEach((tag, index) => {
    const entry = 2 + index * 12;
    ifd.writeUInt16LE(tag, entry); ifd.writeUInt16LE(2, entry + 2);
    ifd.writeUInt32LE(strings[index].length, entry + 4); ifd.writeUInt32LE(offset, entry + 8);
    offset += strings[index].length;
  });
  return Buffer.concat([Buffer.from([0x49, 0x49, 0x2a, 0, 8, 0, 0, 0]), ifd, ...strings]);
}
