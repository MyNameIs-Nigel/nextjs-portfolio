// Small generated metadata fixtures, independent of a user's photographs.
export const xmp = Buffer.from(`<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:exif="http://ns.adobe.com/exif/1.0/" xmlns:tiff="http://ns.adobe.com/tiff/1.0/" xmlns:aux="http://ns.adobe.com/exif/1.0/aux/" exif:DateTimeOriginal="1998-06-12T23:30:00-07:00" exif:ExposureTime="1/125" exif:FNumber="28/10" exif:ISOSpeedRatings="400" exif:FocalLength="50/1" tiff:Make="Nikon" tiff:Model="Nikon F3" aux:Lens="50mm f/1.4"><dc:title><rdf:Alt><rdf:li xml:lang="x-default">Summer on film</rdf:li></rdf:Alt></dc:title><dc:description><rdf:Alt><rdf:li xml:lang="x-default">An evening in June.</rdf:li></rdf:Alt></dc:description></rdf:Description></rdf:RDF></x:xmpmeta>`);

export function jpegWithXmp(image = Buffer.from([0xff, 0xd8, 0xff, 0xd9])) {
  const payload = Buffer.concat([Buffer.from("http://ns.adobe.com/xap/1.0/\0"), xmp]);
  const marker = Buffer.from([0xff, 0xe1, 0, 0]);
  marker.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([image.subarray(0, 2), marker, payload, image.subarray(2)]);
}

export function webpWithXmp() {
  const chunk = Buffer.alloc(8);
  chunk.write("XMP "); chunk.writeUInt32LE(xmp.length, 4);
  const body = Buffer.concat([Buffer.from("WEBP"), chunk, xmp, Buffer.alloc(xmp.length % 2)]);
  const riff = Buffer.alloc(8);
  riff.write("RIFF"); riff.writeUInt32LE(body.length, 4);
  return Buffer.concat([riff, body]);
}
