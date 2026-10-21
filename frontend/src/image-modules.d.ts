// Static imports of images are typed by Next's generated `next-env.d.ts`, which is
// gitignored and only created by `next dev`/`next build`. CI runs `tsc` first, so
// declare the extensions here as well.
declare module "*.png" {
  const image: import("next/image").StaticImageData;
  export default image;
}
