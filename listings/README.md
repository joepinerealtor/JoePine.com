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

Homes.com sync helper

- Run `node scripts/sync-homes-listings.js` for a dry-run comparison against Joe's Homes.com profile.
- If Homes.com blocks profile discovery, pass one or more direct property pages with `--no-discovery --property-url`.
- Review the printed missing listing objects before writing anything.
- Run `node scripts/sync-homes-listings.js --apply` only after the dry run looks correct.
- The helper only imports Homes.com-visible facts and Homes.com-hosted image URLs for new listing objects.
