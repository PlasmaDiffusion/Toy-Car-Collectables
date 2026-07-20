import type { ReactNode } from "react";

interface HelpPage {
  title: string;
  icon: string;
  content: ReactNode;
}

export const PAGES: HelpPage[] = [
  {
    title: "Adding a Listing",
    icon: "➕",
    content: (
      <div className="flex flex-col gap-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Use the{" "}
          <span className="font-semibold text-white">Add Collectable</span> form
          to list a new toy car. The only required field is the{" "}
          <span className="font-semibold text-brand-400">Name</span> —
          everything else is optional and can be filled in later.
        </p>
        <p>
          That said, the more detail you add upfront the better the listing
          looks to buyers. Try to fill in at minimum:
        </p>
        <ul className="flex flex-col gap-1.5 pl-4">
          {[
            "Name — the full model name",
            "Price — leave blank to show 'Price on Request', set to 0 to mark as Sold",
            "Condition — buyers rely on this heavily",
            "Photos — ideally all 5 sides (see next page)",
            "Facebook Marketplace URL — key to enter when the listing is live on the marketplace for customers to buy",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>Once submitted you'll get a link to view the item on this site.</p>
        <p className="text-brand-400">
          Remember to always enter the marketplace URL in the field when it's
          ready and put on the facebook marketplace. If it's not ready yet, an
          edit button will appear on the car's page to add the link in later.
        </p>
      </div>
    ),
  },
  {
    title: "Uploading & Ordering Photos",
    icon: "📷",
    content: (
      <div className="flex flex-col gap-3 text-sm text-gray-300 leading-relaxed">
        <p>
          Click or drag files onto the{" "}
          <span className="font-semibold text-white">Images</span> dropzone —
          uploads start automatically. You can add up to{" "}
          <span className="font-semibold text-white">8 photos</span> per
          listing.
        </p>
        <p>
          Photos are shown to buyers in the order you upload them, and the AR
          preview maps each slot to a specific side of the car. The recommended
          order is:
        </p>
        <ol className="flex flex-col gap-1.5 pl-4">
          {["Left side", "Front", "Right side", "Back", "Top", "Bottom"].map(
            (side, i) => (
              <li key={side} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-900 text-[10px] font-bold text-brand-300">
                  {i + 1}
                </span>
                <span>{side}</span>
              </li>
            )
          )}
        </ol>
        <p>
          If you upload out of order, just{" "}
          <span className="font-semibold text-white">drag the thumbnails</span>{" "}
          to rearrange them. Each thumbnail shows its current slot label at the
          bottom so you can see at a glance whether the order is correct.
        </p>
        <div className="rounded-md border border-amber-800/50 bg-amber-900/20 px-3 py-2 text-amber-300">
          <b className="text-amber-300">Best Practices:</b>
          <br />
          <p className="text-amber-300">
            {" "}
            Note that it's best to have the car take up as much of the photo as
            possible, otherwise the preview's 3d rectangle might show a lot of
            the background on certain faces.
          </p>
          <br />
          <p className="text-amber-300">
            {" "}
            It's also nice to make sure the top and bottom face photos of the
            car <i>have the front of the car near the top of the image</i>,
            otherwise the face will be flipped in the wrong direction in the
            preview.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Scale & Extra Fields",
    icon: "⚙️",
    content: (
      <div className="flex flex-col gap-3 text-sm text-gray-300 leading-relaxed">
        <p>
          <span className="font-semibold text-white">Scale</span> is a core
          field — always visible in the form. It powers the AR to-scale preview,
          so set it for every listing. A 1:64 Hot Wheels is ~7 cm; a 1:18 is ~25
          cm.
        </p>
        <p>
          The{" "}
          <span className="font-semibold text-white">Show Extra fields</span>{" "}
          toggle reveals extra metadata:
        </p>
        <ul className="flex flex-col gap-2 pl-4">
          {[
            {
              label: "Brand",
              detail: "e.g. Hot Wheels, Matchbox, Corgi — used for filtering.",
            },
            {
              label: "Vehicle Type",
              detail:
                "Muscle Car, Race Car, etc. — drives the 'Related listings' section on the detail page.",
            },
            {
              label: "Production & Model Year",
              detail:
                "Production year is when the toy was made; Model year is the real car being modelled. Both show in the spec table.",
            },
          ].map(({ label, detail }) => (
            <li key={label} className="flex items-start gap-2">
              <span className="mt-0.5 text-brand-400">•</span>
              <span>
                <span className="font-semibold text-white">{label}</span> —{" "}
                {detail}
              </span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    title: "Editing an Existing Listing",
    icon: "✏️",
    content: (
      <div className="flex flex-col gap-3 text-sm text-gray-300 leading-relaxed">
        <p>
          To edit a car that's already been added, navigate to its detail page
          from the shop or by searching for it.
        </p>
        <p>
          When you're signed in as an admin, an{" "}
          <span className="inline-flex items-center gap-1 rounded-md border border-brand-700 bg-brand-900/40 px-2 py-0.5 text-xs font-semibold text-brand-300">
            ✏️ Edit listing
          </span>{" "}
          button will appear in the breadcrumb bar at the top of the page — it's
          hidden from regular visitors.
        </p>
        <p>
          Clicking it opens the same form pre-filled with the car's current
          data. Make your changes and hit{" "}
          <span className="font-semibold text-white">Save Changes</span>. The
          listing updates immediately. Buyers should see the new version within
          seconds.
        </p>
        <p className="rounded-md border border-amber-800/50 bg-amber-900/20 px-3 py-2 text-amber-300">
          💡 Tip — if you need to swap out a photo, remove the old thumbnail
          first, then upload the replacement and drag it into the correct
          position.
        </p>
      </div>
    ),
  },
  {
    title: "Deleting a Listing",
    icon: "🗑️",
    content: (
      <div className="flex flex-col gap-3 text-sm text-gray-300 leading-relaxed">
        <p>
          To delete a car, go to its detail page and click the Edit Form button.
          You will see a Delete button at the top of the form. Click it and
          confirm to remove the listing permanently.
        </p>
        <p className="rounded-md border border-amber-800/50 bg-amber-900/20 px-3 py-2 text-amber-300">
          💡 To make sure you don't accidentally do this, you need to click confirm multiple times.
        </p>
      </div>
    ),
  },
];
