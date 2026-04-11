Listings workflow

- Shared listing data lives in `listings/listings-data.js`.
- The homepage featured listing is rendered from that data.
- The listings hub at `listings/index.html` is rendered from that data.
- Property detail pages use the shared template at `listings/property/index.html?slug=...`.
- If an old pretty URL already exists, it can redirect into the shared property template.

For a new listing, add one new object to `listings/listings-data.js` with:

- address and slug
- status and featured flag
- price, beds, baths, square footage, lot size
- summary, highlights, and detail sections
- image array
- Homes.com link and 3D tour link if available
- open house info if available
