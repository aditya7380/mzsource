# Product images

Every product can show a photo instead of the coloured box. If a product has no image
(or the link is broken), the original coloured box is shown, so nothing ever looks empty.

## Add or change a photo (no code, no redeploy)
1. Sign in as admin -> **Products**.
2. Click **Edit** on a product (or **+ Add Product**).
3. Paste a direct image link into **Image URL (optional)**. A preview appears.
4. **Save Changes**. Buyers see it straight away.
To go back to the coloured box, clear the field and save.

## What counts as a good link
- A *direct* link to the picture, starting with `https://` (usually ends in .jpg, .png or .webp).
  Open the link in a new tab: you should see only the photo, not a web page.
- Page links (for example a Google Drive "share" link or an Instagram post) are not direct
  image links and will show the coloured box.
- Square pictures with a white or plain background look best (about 800 x 800 px). Photos are
  shown whole (never cropped) on a white background.

## Using your own files instead of a website
Put the files in `public/product-images/` and use `/product-images/<file name>` as the Image URL.
These go live the next time the frontend is deployed.

## How it works (for developers)
The backend already stored and returned an `imageUrl` for every product, and the API already
accepted it. This change is frontend-only: `components/common/ProductImage.tsx` (used on product
cards, the product page, the request cart and the admin product cards) plus an Image URL field
in `pages/admin/AdminProducts.tsx`. Only `https://`, `http://` and site-relative `/` links are
accepted; anything else is ignored.
