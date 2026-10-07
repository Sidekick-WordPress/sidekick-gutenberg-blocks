# Building pages with Sidekick Columns

Use this guide to turn a content document or an existing website page into an editable Gutenberg page built from **`sgb/columns`, `sgb/column`, and WordPress core blocks**. Choose a layout to fit the content, then apply the destination site's design language. A custom hero, card, testimonial, profile, or process block is usually unnecessary.

This guide combines an audit of **119 published interior pages** on three local sites with the plugin source at **1.2.0, commit `70e74f5`**, inspected on October 1, 2026, and rechecked against commit `326b86e` (parent margins and border radius) on October 6, 2026. The homepages were excluded. The authoring rules also incorporate the subsequent Bell Oral Surgery work on `localhost:10016`: the Dental Implants review, the user-edited Patient Information reference and nine polished child pages, and the 28-page Oral Surgery Services collection, verified through October 5, 2026. Documentation was reconciled on October 6, 2026. These later lessons do not change the historical three-site audit. The audit's page inventory and the separate capability reference are not included in this repository; the authoritative attribute names and defaults are in the block source: [`sgb/columns` attributes](../src/blocks/columns/attributes.ts), [margin handling](../src/blocks/columns/margins.ts), [`sgb/columns` renderer](../src/blocks/columns/save.php), [`sgb/column` attributes](../src/blocks/columns/column/attributes.ts), and [`sgb/column` renderer](../src/blocks/columns/column/save.php). Recheck the installed plugin and core block registry when using this guide on another site or after an upgrade.

## Start here

1. Read the supplied article, the current saved destination content, and any user-edited reference page. Inspect the destination template, live Full Site Editor wide width, header gutters, typography, colors, buttons, and representative interiors. Use the live wide width as the default section cap; preserve newer manual edits and the reference page.
2. Map each piece of article content to a job: introduction, explanation, parallel choices, evidence, process, practical information, questions, or next action. For a page collection, inventory its complete navigation hierarchy and prepare a separate section-specific menu and template.
3. Choose an appropriate page sequence below. Replicate the exact supplied visible copy; do not add or rewrite headings, eyebrows, captions, labels, explanations, CTA copy, or other content without editorial authorization. Omit recipe elements for which no copy was supplied.
4. Build the alternating Sidekick hierarchy. Give each additional nesting level a purpose such as a card surface, a separate grid, a supplied media caption, or a different content measure. Use the native YouTube embed for supplied YouTube videos.
5. Set mobile widths and spacing first, then tablet and desktop overrides. Vertically center shorter text beside taller media at each side-by-side tier. Set the final text item and Buttons block to zero bottom margin so the wrapper supplies the bottom inset.
6. Serialize with the destination site's registered Gutenberg blocks. Save through the authorized workflow, reopen the actual saved page in the editor, and inspect its frontend at real responsive widths. Generated or staged files are not evidence that a page or template was saved.

The pattern trees in this document are **composition recipes**, not HTML to paste into the Code editor. The serialization section contains a real Gutenberg example and a builder example. Values described as observed belong to the reference site; suggested adaptations are identified separately.

## Scope and dependencies

The direct children of `sgb/columns` must be `sgb/column`. Inside a column, use registered `core/*` blocks or another `sgb/columns`. For the article body, recursively reject other plugin block types even though Sidekick itself allows them. A section navigation block may be a separately authorized template feature: Bell uses a native WordPress Navigation menu rendered by `sgb/nav-menu` outside `core/post-content`. That template dependency does not expand the article allowlist.

Core headings, paragraphs, lists, images, buttons, groups, quotes, tables, separators, spacers, and supported embeds are appropriate content tools. Availability of newer blocks, including the core accordion, depends on the destination WordPress installation. A `core/html` or `core/shortcode` wrapper around a plugin widget or script does not make that widget a portable core-only pattern. Avoid these escape hatches for page composition.

Resolve `core/block` synced-pattern references before deciding that a tree is eligible. The audited references were verified: Smiles by Shields CTA `7359`, and Artistic Touch booking layout `9441` and gradient divider `9443`, contain only Sidekick and core blocks. Those IDs are local to their source sites. On another site, expand their structures into independent blocks or create an explicitly requested local pattern. Never transplant the numeric reference.

Eligibility describes **block types**, not independence from the theme. A core button can depend on a theme's style variation, and a Sidekick column can carry theme-specific glass CSS. Preserve the structure; map its appearance to the destination theme. Custom navigation inside article patterns, forms, sliders, the Smiles numbered tiles, the tooth-chart script, and Artistic Touch's custom accordions/icon boxes are excluded. Eligible sibling sections and nested subtrees remain useful.

## The layout grammar

```text
sgb/columns                         section background, outer padding, row gap, content width
  sgb/column                        width, card/background, inner measure, content placement
    core/heading
    core/paragraph
    sgb/columns                     a purposeful nested composition
      sgb/column
        core/heading
        core/paragraph
      sgb/column
        core/image
```

The section's background covers its outer wrapper; `mobileMaxWidth` and its overrides constrain the **inner row**. Full width means the containing element's width, so the page template must also permit the intended section width. A child's `innerMaxWidth` constrains only its **content box**, leaving its background and border across the whole column.

Parent `horizontalAlignment` positions the constrained row. Child `contentHAlign` positions the constrained content box. Neither aligns the text: set text alignment on the core heading/paragraph and button alignment on `core/buttons`.

Rows wrap. One parent can contain a full-width heading, three third-width cards, and a full-width CTA. Its `columns` attribute is the count of actual immediate column children, not the number of cards per visual row. A title plus three cards means four children.

### Settings agents must get right

| Intent | Correct attributes or behavior |
| --- | --- |
| Mobile, tablet, desktop gap | `mobileGap`, `tabletGap`, **`gap`**; numbers in pixels |
| Mobile, tablet, desktop padding on either block | `mobilePadding`, `tabletPadding`, **`padding`**; full objects with `top`, `right`, `bottom`, `left` CSS strings |
| Child width | `width`, `tabletWidth`, `desktopWidth`; numbers, usually `100` at mobile |
| Three equal columns | `33.333333` each; current source also normalizes integer `33` |
| Auto width | `0`; shares remaining space, does not hide the column |
| Default breakpoints | Tablet `768`, desktop `1024`; viewport width, including nested rows |
| Responsive inheritance | Base/mobile → tablet → desktop; absent overrides inherit |
| Section content measure | `mobileMaxWidth`, `tabletMaxWidth`, `desktopMaxWidth`; normally match the site's live Full Site Editor wide width |
| Child content measure | `innerMaxWidth`, `tabletInnerMaxWidth`, `desktopInnerMaxWidth` |
| Vertical placement | `vAlign`, `tabletVAlign`, `desktopVAlign`: `flex-start`, `center`, `space-between`, `flex-end` |
| Outer margins (parent only) | `sgb/columns`: `mobileMargin`, `tabletMargin`, `desktopMargin`; objects with any of `top`, `right`, `bottom`, `left` CSS strings. `sgb/column` has no margin attributes |
| Rounded corners | `borderRadius`, `tabletBorderRadius`, `desktopBorderRadius` on **both** `sgb/columns` and `sgb/column`; object with `topLeft`, `topRight`, `bottomRight`, `bottomLeft` |
| Card shadow | Native WordPress `style.shadow`, using a supported preset or CSS shadow |
| Anchor | `htmlId`; choose a unique, stable value |
| Advanced desktop overlap | `deskExtendTop`, `deskExtendBottom`, `deskTranslateX`, `deskTranslateY`, and `desktopZIndex` |

Do not invent `desktopGap`, `desktopPadding`, `minHeight`, `hideOnMobile`, or `boxShadow` Sidekick attributes. A maximum-height setting is not a minimum-height setting. Background images do not establish height. Empty decorative columns need intentional content, padding, or a core Spacer if they must remain visible when stacked.

Use complete padding objects, including explicit `"0px"` sides. A higher-tier partial padding object does not inherit its missing sides individually. Blank image/video overrides inherit too; clearing an override is not a hide-on-this-device control.

Margins and radius cascade differently from padding:

- **Margins inherit per side.** `tabletMargin: {"bottom":"40px"}` changes only the bottom; the other sides keep their mobile values. A side left unset at every tier is not written at all, so the theme's ordinary block spacing still applies. An explicit `"0"` is written with `!important` and beats WordPress block-gap margins, so set zero deliberately on structural rows. Numeric values become pixels, and `var:preset|spacing|40` presets are accepted.
- **Horizontal margins change the row's width.** A non-zero left or right margin switches the section to `width:auto` at that tier so the margin shares the available width; a later zero override restores full width. Prefer padding for gutters unless you need space outside the background.
- **Legacy margins.** Older saved content may store margins in native `style.spacing.margin`. It is read only when `mobileMargin` is absent; an empty `mobileMargin: {}` clears it.
- **Radius inherits per tier, not per corner.** An absent tablet/desktop radius inherits the tier below. Within a radius object, any missing corner becomes `0px`, so always supply all four corners. The radius applies to the block's wrapper and its background image/video layer; it does not clip foreground content such as a core Image.

For background focal points, borders, ordering, motion, and other advanced settings, read the attribute files and renderers linked in the introduction.

### Required content, media, alignment, and spacing rules

These authoring rules apply to every pattern below, including adaptations of the historical examples.

- **Align section widths with the header:** in most scenarios, the section-level `sgb/columns` wrapping the individual `sgb/column` blocks should use the destination site's Full Site Editor **Wide width** as its max width. Read the active Site Editor setting, including saved Global Styles overrides, rather than copying a reference site's number or substituting the narrower Content width. Match the header's horizontal gutters and verify the visible left/right edges on the frontend. This is the default for ordinary sections; use a different width only for an intentional composition. Keep narrower reading measures inside child columns with `innerMaxWidth`, and let nested rows fit their containing column instead of assigning them independent page widths.
- **Keep repeated patterns on shared guides:** reuse the same column ratios, gaps, horizontal insets, and content alignment at each breakpoint whenever a label-and-content or other split pattern repeats. Neighboring labels should begin on one vertical guide and their body text on another. Do not introduce arbitrary centered 760px/780px reading measures that shift those starts. Constrain line length inside the established body column, keeping its starting edge; reserve a different alignment for a deliberate composition.
- **Exact supplied copy:** replicate the provided visible content exactly. Layout may change, but do not write extra image/video captions, headings, eyebrows, labels, summaries, explanatory notes, or button text. Reuse supplied wording and destinations. A recipe's optional caption, introduction, context, or action is available only when supplied; omit it otherwise. Choose a different layout when a recipe would require invented copy. Preserve quotations, qualifications, and attribution exactly. Preserve descriptive accessibility metadata such as image alt text; if missing, use a factual description of the asset without adding claims. Accessibility metadata is not permission to add visible captions.
- **YouTube stays embedded:** use Gutenberg's YouTube variation of `core/embed` with the supplied video URL (`providerNameSlug:"youtube"`) and responsive aspect ratio. Do not replace it with a linked thumbnail or outbound YouTube button. If playback is blank or unavailable in the automated browser, retain the embed, verify the saved URL/block and frontend as far as possible, and report the playback limitation. Browser restrictions alone are not authorization to change the media treatment.
- **Center shorter text beside media:** when text and media are side by side and the text is shorter, set the text column to **Middle** vertical alignment. Use `tabletVAlign:"center"` when the split starts at tablet, or `desktopVAlign:"center"` when it starts at desktop; set an explicit desktop override if an existing value prevents inheritance. Mobile can retain `vAlign:"flex-start"` for the stacked flow. The Dental Implants page's “Surgical Advances” text beside its video is the reference correction. Apply this rule again at every tier where those columns share a row.
- **Zero the trailing content margins:** in each column, card, and nested content group, give the terminal text item (paragraph, heading, or list) **0 bottom margin**, including when only Buttons follows it. A heading or paragraph followed by a table or media still needs the ordinary inter-block gap; it is not the terminal item in that flow. Follow the content flow into nested Quote/Group blocks to find that last item; keep intermediate heading margins where later text follows. Give the `core/buttons` wrapper **0 bottom margin** too, and clear any trailing margin on its button block if the theme adds one. On core content blocks, use native `style.spacing.margin.bottom:"0"` and the destination serializer; Sidekick's margin attributes exist only on `sgb/columns`, and `sgb/column` has none. Do not replace per-block spacing controls with a blanket theme CSS override. Keep deliberate space between copy and buttons through the Buttons wrapper's top margin or the containing layout gap. When Buttons is the first or only item in a separate column, its top margin is zero as well. The surrounding wrapper's padding should establish the bottom inset, without an extra last-block margin. Inspect the first block's top margin as well so equal top/bottom padding looks equal.
- **Make wrapper spacing explicit:** set all four margins on core blocks and figure wrappers where supported; retain only intentional internal spacing. Clear the first item's top margin and the final item's bottom margin. Reset structural-wrapper margins too: on `sgb/columns`, set `mobileMargin` to explicit zeros (at least `top` and `bottom`) so theme block gaps do not add space between sections; `sgb/column` spacing comes only from its padding and the parent row's gap. Inspect rendered figure, Group, Buttons, and nested row wrappers for inherited offsets; a zero margin on the inner image or text alone does not clear its wrapper.

### Plan for the width available to the content

Start with full-width columns and source reading order on phones. At the default **768px tablet** tier, introduce halves only where the actual text/media measure stays comfortable. At **1024px desktop**, remeasure the content area: Bell's sidebar occupies an **18.5rem (296px) grid track with zero grid gap**, so a desktop viewport does not mean there is room for three article cards. The visible card is narrower than its track because its own margins and header-gutter correction consume space. Keep dense nested grids stacked or in halves longer, or intentionally delay the relevant Sidekick row's desktop breakpoint to **1200px**. This is a content decision, not an instruction to shift every row's breakpoint.

Check just below and at each applicable breakpoint, including 768/1024 and any custom value. A nested row still follows the viewport, not its parent column's width. Make mobile/tablet/desktop settings explicit where needed, then verify actual viewport dimensions and actual column bounding rectangles. Use the site's live wide cap, the shell's sidebar allocation, and the header gutters together; matching max-width numbers without matching the visible edges is incomplete.

## Turn content into a page plan

Create a short section plan before constructing blocks. For each section, record the content it must contain, its pattern, its headline level, its media, and its action. This keeps layout choices accountable to the source material.

| Content supplied | Useful treatment | Avoid |
| --- | --- | --- |
| Page promise plus introduction | P01, P02, or P03 | A large empty photo hero when no suitable image exists |
| Long explanation | P05 or P09 | Breaking every paragraph into a separate card |
| Three comparable options | P07 | Inventing a third option for symmetry |
| Four short benefits | P06 or P08 | Four cramped cards containing essay-length copy |
| Ordered stages | P09 or P10 | Using visual reordering to change the logical sequence |
| Evidence, quotations, credentials | P12 or P16 | Fabricated proof or rewritten quotation text |
| People or locations | P13 or P15 | A bespoke profile block for ordinary image and text |
| Questions with substantial answers | P17 | Copying a custom accordion because it looks like core |
| Contact details or opening hours | P18 | A form or interactive map invented with raw HTML |
| One next step | P19, P20, or P21 | Different competing primary actions in every section |

For a batch of pages, select a content-led composition for each page before building. Vary the layouts through editorial splits, image/text relationships, nested grids, process sequences, reading measures, and restrained action treatments drawn from the library; do not apply the same stack of filled cards to every source section or page. Short resource pages can remain concise and open. Variety must follow the supplied content and preserve its exact visible copy, without invented headings, captions, labels, or filler.

Use the document's real distinctions. Three bullets about the same idea often belong in a list. Three independently meaningful services may deserve three cards. If one item is much longer, use an asymmetric split or stacked panels instead of forcing equal visual weight.

For an existing page, separate its reusable content from header/footer navigation, cookie banners, template-generated titles, archive listings, and widgets. Record existing URLs and downloads. Reuse a provided action destination instead of guessing a slug. Bring over the exact supplied visible copy and useful information architecture. Heading levels, block types, and spacing may change without changing the words.

### Extract the article and preserve its content

For the `ihboms.com` imports, **only `#contentMain` is the source boundary**, and its `#content` child contains the article. Do not scrape the whole page into the body. Exclude breadcrumbs, the source sidebar, global navigation/footer, tracking scripts, and proprietary player implementation chrome. Preserve supplied article headings, paragraphs, emphasis, lists and nesting, table cells, quotations, link labels, captions, and image alternatives. Keep repeated supplied content unless the user authorizes consolidation. On another source site, identify and record the equivalent article boundary before extracting.

Make an inventory of source sections, links, downloads, and media before building. Map an internal link to an existing or newly created local page only after its actual destination is known; preserve meaningful fragments and query parameters. Keep unrelated external destinations external. When media is moved into the destination library, record its original URL, local URL, and actual local attachment ID; never reuse a source site's numeric ID. Compare the final saved article text and meaningful link/media mapping against the source, with whitespace normalization and any documented WordPress typography transformations distinguished from editorial rewriting.

### Match the destination design language

Inspect live Global Styles as well as the theme files: saved Site Editor settings may override `theme.json`. Check the actual page template to see whether it inserts a title, constrains the content width, or offsets a fixed header. For the Bell interior workflow, the shared template contains no automatic Post Title block: the first Sidekick section owns the supplied H1 and its responsive spacing. Keep one H1, and use Sidekick padding/width controls at each breakpoint to align it with the article. Do not add a second title, template content inset, or fixed-header spacer. Other sites still require inspection of their actual title/header behavior.

Read **Styles → Layout → Wide width** in the Full Site Editor (the effective `settings.layout.wideSize`). Set the outer section's max width through `mobileMaxWidth` and any necessary tablet/desktop overrides; remove stale overrides that would replace the intended wide width. A base max width can inherit across all tiers; it remains a cap, so small screens still shrink within their gutters. For generated blocks, `var(--wp--style--global--wide-size)` can track the site's live value when that CSS variable is defined in both editor and frontend; otherwise use the verified CSS length from the setting. The inspector uses a UnitControl: enter the resolved length there if it does not accept the variable expression. Center the row with parent `horizontalAlignment:"center"`. Sidekick applies this cap to its inner row, inside the wrapper's padding. Equal max-width numbers alone do not guarantee matching edges if the header and section use different gutters or containing widths. Check the rendered edges and avoid adding a second gutter on transparent structural columns. In an already constrained sidebar template, an article row may use `100%` of its allotted content column; the surrounding shell still owns the site-wide cap. Do not force the article to the full page width beside an additional sidebar.

Use one heading family, body family, section-width system, corner treatment, and button hierarchy appropriate to the client. Prefer the theme's fluid font and spacing presets. Keep a readable body measure inside wide compositions; 600–750px was common for split-column copy, while centered statements used approximately 800–920px. These are observed starting points, not fixed requirements.

Use intentional white, dark, or palette-colored chapter backgrounds to give a long article clear changes of pace, while preserving shared text guides across those chapters. Group related content on each surface instead of coloring every paragraph separately. On Bell pages, retain the Bell Off White (`#E9E6E2`) template canvas. White, Deep Teal (`#0F2930`), and selective Mist Blue (`#9AB2B7`) panels create contrast within it, with appropriate text/link colors and shared insets. Do not replace the whole canvas with white or turn every heading into another filled rectangle.

| Reference site | Observed section rhythm | Transferable lesson |
| --- | --- | --- |
| Emergency Expert for You, port 10022 | Light editorial introductions, navy evidence/process bands, fine borders, compact radii, serif display headings; widths vary with content | A nested one-column callout can give an ordinary split strong hierarchy |
| Smiles by Shields, port 10034 | Typical max width 1436px; 20px mobile gutters; 40–60px vertical desktop padding; glass surfaces and restrained dark gradients | Nest cards and caption panels within larger article structures; map glass styles to the target theme |
| Artistic Touch Dentistry, port 10028 | Typical mobile max 500px and wider max 1400px; 40px mobile and 100px desktop vertical section padding; 20–60px gaps; rounded panels | Repeated hero, benefit-grid, process, and CTA structures can support many service pages |

For a new site without established spacing or an approved reference, a **proposed starting system** is 40px vertical / 20px horizontal section padding on mobile, 60px / 30px on tablet, 80px / 40px on desktop; 20–32px gaps; and 20–32px card padding. Adjust to the actual typography, content density, and template. Inner rows usually need zero section padding when their enclosing card already provides the inset.

### Polish from a user-approved page

When the user supplies a revised page as the design reference, inspect its saved blocks and rendered spacing before changing sibling pages. Preserve that page. Transfer its spacing ownership, corner treatment, and core-block rhythm while retaining each sibling's content-led composition; do not replace the batch with one uniform stack of cards. Read current page content before editing so newer manual changes are not overwritten by an older generator output.

**Assign each kind of space to the element that owns it:** the outer `sgb/columns` supplies section padding; a surface-bearing `sgb/column` supplies the panel inset; core block margins separate headings, paragraphs, lists, and actions. Transparent nested rows and structural columns normally have zero padding and margins. Avoid combining row bottom margins, section padding, and the next section's top margin to create the same gap several times. Clear stale tablet/desktop overrides when adopting a new spacing cascade.

For a rounded chapter that contains multiple columns, use the following structure. `sgb/columns` now has its own `borderRadius`, but its background and radius belong to the **outer wrapper**, which spans the full container width; `mobileMaxWidth` constrains only the inner row. A rounded, colored parent therefore produces a full-width rounded band, not a panel aligned to the wide cap. To get a surface that sits within the section's gutters and width cap, keep the surface and radius on a child column:

```text
sgb/columns [transparent; outer section padding; margin 0]
  sgb/column [100%; surface color; panel padding; radius token]
    sgb/columns [padding 0; margin 0; deliberate split gap]
      sgb/column [structural padding 0]
        core content
      sgb/column [structural padding 0]
        core content
```

Use the parent's own `borderRadius` when the whole section is intentionally a rounded surface, for example a band already inset by its container, or one given horizontal `mobileMargin` values so the rounded background sits inside the page edges.

Keep the page template's width constraint separate from content spacing. On a template where Gutenberg controls the content insets, preserve the existing centered Wide max-width but leave the post-content wrapper's padding and margins at zero. Give the sidebar its own spacing. At the breakpoint where the menu sits beside the content, its left edge should meet the header's left guide; remove an extra left menu margin instead of widening the whole template or offsetting article blocks. In the Bell Patient Information template, mobile navigation follows the content and keeps its surrounding margin. Other templates should follow their approved navigation order.

**Bell reference, observed October 5, 2026:** preserve the user-edited [Patient Information page](http://localhost:10016/patient-information/) (page 146) and inspect its current saved controls before adapting it. The reference and completed collection work establish the following Bell values. They override the generic starting system and historical recipe measurements for these Bell interiors; they are not universal Sidekick defaults.

| Element | Approved treatment |
| --- | --- |
| Site shell | Live FSE Wide width, verified as **1600px** in this work; content-wrapper padding/margins **0**; retain the centered width cap |
| Title row | **30px top / 20px right / 10px bottom / 20px left**; zero margins; H1 margin 0 |
| Ordinary outer section | **20px on all four sides**, zero margins; no additional row bottom-margin rhythm |
| Final outer section | **20px bottom on mobile / 40px bottom at tablet and desktop**; other sides retain ordinary 20px padding |
| Visible panel/card | Child-column padding **20px mobile / 40px tablet and desktop**; all four radius corners **8px**, matching the menu card; clear stale tier overrides |
| Exposed images | Core image radius **8px** where its edge is visible; column radius alone does not clip it |
| Structural nested rows/columns | Padding and margins **0**, except a deliberate shared horizontal inset needed to align a plain section with a surfaced neighbor |
| Ordinary row gap | **20px mobile / 20px tablet / 40px desktop**; CTA inner gap **20px**; compact definition rows **14px / 20px / 40px** |
| Repeated editorial split | **30/70** at its intended side-by-side tier, **40px** gap there, and identical horizontal insets; stack in source order below that tier |
| Core content rhythm | **16px** between content items (`var:preset|spacing|40` in this theme); first top margin 0; terminal text/list/heading and Buttons bottom margin 0 |
| Buttons | After text in the same column: **16px top / 0 bottom**; first/only item in its own column: **0 top and bottom** |

The latest user-polished reference governs new Bell interiors and subsequent polish passes, including the **40px final-row bottom padding at tablet and above**. Do not let an older batch generator's 20px ending silently replace this approved reference treatment.

Plain repeated editorial sections need the same **horizontal** panel inset as their white/teal neighbors so label and body starts line up. They do not need another card's full vertical padding. Keep real content widths, ratios, and gaps equal across repeated rows. Dense compositions may intentionally delay their split until **1200px** even though the template sidebar appears at 1024px; preserve that distinction.

The reference portrait's **250px mobile / 200px tablet vertical padding** establishes that particular background image's height. It is not a text-panel padding rule. Use the actual image's needs and preserve source media proportions. Recheck rendered edges, panel insets, terminal margins, and real viewport dimensions after applying any reference.

### Build a collection's sidebar and template

A collection such as Patient Information or Oral Surgery Services needs its **own WordPress Navigation menu and FSE template**, while its page bodies remain Sidekick/core-only. This is a shared shell task, not a reason to copy navigation into each article.

1. Inventory the source collection's full hierarchy, including nested pages. Reuse an existing destination page when it represents the same content. Maintain an explicit source URL → local page ID/permalink mapping before creating menu links.
2. Create the collection's separate native WordPress Navigation menu with native Page links, correct local IDs/URLs, original labels, and meaningful parent/child order. Reuse the approved `bell-interior` shell under a distinct template slug/title, give it the collection's sidebar label and nav reference, and assign it to every collection page. Register a file-based custom template if required by the destination theme. Do not replace another section's menu.
3. Keep `core/post-content` first and the sidebar second in DOM order. Below **1024px**, the menu follows the entire article and retains **16px outside margins**. At 1024px and above, CSS places the menu on the left using `grid-template-columns:18.5rem minmax(0,1fr)` and **zero grid gap**. The sidebar track is 296px at the installed 16px root size; the visible card measured 264px at 1024/1280px and 280px at 1800px after its own margin/gutter calculation. Do not mistake card width for track width. Reuse current shared shell behavior rather than inferring the sidebar breakpoint from a page's inner split breakpoint.
4. Preserve the **1600px live Wide cap** and Bell Off White canvas. The content wrapper and Post Content block have **zero padding and margins**. Omit the template Post Title block; let each page's first Sidekick section supply its H1. Keep the installed header behavior and avoid duplicate header-clearance spacers.
5. At the side-by-side breakpoint, set the menu card's **outer left margin to 0**. This breakpoint includes the tested tablet-sized 1024px view; do not key it to the inspector tab name. Align the actual menu left edge with the header logo through the shell's gutter calculation if necessary, without widening the shell or insetting the article. Preserve the mobile menu margins.

Bell's current header-gutter correction is scoped to `@media (min-width:1024px)`: `.bell-interior` establishes `container-type:inline-size`; the sidebar uses `margin-left:0`, `justify-self:end`, and a width reduced by `1rem` plus a clamped header offset. The offset is `clamp(0px, calc((var(--wp--style--global--wide-size, 1600px) + 2rem - 100cqw) / 2), 1rem)`. This is an observed fix for the installed shell, not portable CSS to paste indiscriminately. It aligned both sidebar and logo to 16px at 1024/1280px, and to 95px at 1800px in final verification. Recheck the actual header geometry after any shell change.

The verified local objects are Patient Information menu **144** / template `patient-information`, Oral Surgery Services menu **247** / template `oral-surgery-services-sidebar`, and Surgical Instructions menu **466** / template `surgical-instructions-sidebar` (a flat menu on the Patient Information shell, added October 6, 2026). Sections with only one child page (Meet Us, Referring Doctors, Contact Us) deliberately have no sidebar menu or header dropdown; they and the standalone pages (Disclaimer, Sitemap) use `bell-interior-full`: the same shell with the sidebar removed, plus a scoped Additional CSS rule that collapses the desktop grid to one column so the content does not sit in the empty sidebar track. These IDs belong only to this installation. The surgery menu has twelve primary entries and collapsible Dental Implants, Bone Grafting, and Wisdom Teeth families. Its `sgb/nav-menu` is a template dependency; article blocks remain unchanged in scope.

In the installed Sidekick navigation contract, **`ref` is the `wp_navigation` post ID, not a classic `nav_menu` taxonomy term ID**. Store the hierarchy as native `core/navigation-submenu` parent links containing `core/navigation-link` descendants, with additional nested submenus where the source requires them. Set the template renderer to `orientation:"vertical"` and `collapsibleSubMenus:true` for a collapsible hierarchy. The parent link remains navigable while a separate button toggles its children; the active ancestor opens to expose the current page. Verify these attributes in the installed registry, then test Enter/Space and `aria-expanded` in the final menu. Source contract: [navigation schema](../src/blocks/nav-menu/block.json), [renderer](../src/blocks/nav-menu/save.php), and [collapsible behavior](../src/blocks/nav-menu/collapsible.ts).

For nested menus, inspect the active descendant's **computed** colors as well as the top-level state. The installed Sidekick navigation reset sets anchor backgrounds to transparent with `!important`; Bell's narrowly scoped active-child rule therefore uses Mist Blue background with `!important`, Deep Teal text, and an amber inset accent. Check `aria-current`, visible keyboard focus, and that both Enter and Space toggle `aria-expanded` correctly. Do not infer adequate contrast from a declared background that loses the CSS cascade.

Read live FSE **Additional CSS** before changing shell styles. The final Bell gutter, active-menu, heading-wrap, and table-scroll refinements were saved there; some equivalent theme-source copies were only staged. Preserve the entire existing stylesheet when merging a change. If later moving these rules into theme source, verify equivalent frontend/editor behavior before removing the FSE duplicate. A source file or staged template alone is not proof of the active WordPress state.

## Pattern library

Notation: `R` is `sgb/columns`; `C` is `sgb/column`; other names are core blocks. `100/50/50` means mobile/tablet/desktop percentages. `pad 40×20` means 40px top/bottom and 20px left/right. Set text color and typography on core content. Unless stated otherwise, use the destination's ordinary section spacing, set transparent structural columns to zero padding, and stack content in meaningful reading order on mobile. The numbered recipes retain the original audit's observed values. On Bell, use the approved reference values above for padding, margins, and 8px corners while preserving the recipe's useful structure. Every text label in a recipe denotes supplied copy, not a writing prompt. Omit any missing optional content, center shorter text beside taller media, and set the final text item and Buttons block to zero bottom margin throughout the tree.

### P01 Compact title band

**Choose for:** articles, resource pages, policies, or a service page that does not need a large hero. **Observed:** [Smiles About](http://localhost:10034/about/) and its service/resource pages.

```text
R [constrained inner width; solid or restrained gradient background]
  C [100/100/100; pad 0]
    Heading H1
    optional Paragraph [brief orientation]
```

The observed Smiles treatment is a dark 135-degree gradient with a light H1 and an inner max of 1436px. Its 81px header spacer is site-specific. Include a header offset only after checking the destination template; do not put an unnecessary spacer in every title band.

### P02 Split introduction with photograph

**Choose for:** a service, person, or organization with an appropriate supporting image. **Observed:** [ATD Crowns](http://localhost:10028/general-dentistry/dental-crowns/), [The Wand](http://localhost:10028/gentle-anesthesia-the-wand/), [Dr. Mallory About](http://localhost:10022/about-dr-mallory/).

```text
R [ordinary section width and generous spacing]
  C [100/50/50; inner max about 600px; vAlign center]
    Paragraph [optional eyebrow]
    Heading H1
    Paragraph(s) OR nested P04 callout
    Buttons > Button
  C [100/50/50; radius about 20px; optional shadow]
    Image OR decorative background with an intentional height mechanism
```

ATD uses a background-photo column containing a 400px Spacer; EEFy often nests another one-column row around the photo. Use a core Image when the photograph conveys information needing alternative text. The 400px value is an observed media treatment, not a fixed height for the copy. For long introductions, shorten only with editorial authorization or move detailed paragraphs to P05. Use one natural H1 even when adapting EEFy's small-H1/large-H2 visual styling.

### P03 Background photograph with inset text panel

**Choose for:** a welcoming introduction where the setting is part of the story. **Observed:** [Smiles New Patients](http://localhost:10034/new-patients/) and [Holistic Facial Esthetics](http://localhost:10034/holistic-facial-esthetics/).

```text
R [background image; dark fallback; inner max 1436px observed; gap 0]
  C [100/60/50; pad 20px mobile and 40px desktop; radius 16px]
    Paragraph [eyebrow]
    Heading H1
    Paragraph(s)
    Buttons > Button(s)
```

Observed parent padding is 40×20 mobile, 60×20 tablet, and 120×20 desktop, with image opacity 60. The panel uses the theme's `is-style-shields-glass-light`. Sidekick does not itself supply backdrop blur. A portable adaptation uses an explicit translucent or solid column background with adequate contrast. The panel can occupy half the row without a blank second column. Verify that the image crop leaves the subject visible and the panel readable when it becomes full-width on mobile.

### P04 Nested summary or quotation callout

**Choose for:** an introductory statement, qualification, or short quotation that needs a different surface from nearby copy. **Observed:** EEFy [Plaintiff](http://localhost:10022/plaintiff-expert-witness/), [Defendant](http://localhost:10022/defendant-expert-witness/), and [Testimonials](http://localhost:10022/testimonials/).

```text
outer C
  Heading
  R [columns 1; gap 0; pad 0]
    C [100; light/dark surface; 1px border; 3px left border; radius 5px]
      Paragraph(s) [observed] OR Quote [semantic adaptation]
  optional Buttons
```

An observed inset is 20px top/right/bottom and 30px left. Use a per-side border object for the heavier left rule; do not mix a top-level shorthand border with side overrides. This nesting is useful because the highlighted passage has its own padding and border while the heading and button remain outside it. Preserve quotations exactly.

### P05 Reading section or editorial split

**Choose for:** detailed explanations that need reading comfort more than cards. **Observed:** [ATD Patient Reviews](http://localhost:10028/about/patient-reviews/), [Smiles Annual Events](http://localhost:10034/annual-events-in-jacksonville-florida/), EEFy Plaintiff/Defendant explanations.

```text
Reading variant:
  R [narrow inner max]
    C100 > Heading H2 + Paragraphs + List(s) + optional Buttons
Editorial split:
  R
    C100/50/50 > eyebrow + H2 + optional P04 summary
    C100/50/50 > Paragraphs and List(s)
```

Use normal block margins between paragraphs and headings, then set the final text item and any Buttons block to zero bottom margin. Avoid empty paragraphs as spacers. A single full-width column is a legitimate Sidekick section, useful for matching the page's background and gutters. For a long article, repeat supplied H2 sections rather than giving every paragraph another wrapper. Bell's repeated editorial variant uses 30/70 label/body columns with shared insets and 40px wider gaps. Combine open sections with a few white or dark chapters instead of giving every heading an identical card.

### P06 Explanation beside a nested benefit grid

**Choose for:** an explanation plus three or four short benefits. **Observed:** ATD Crowns and The Wand, second sections.

```text
R [subtle alternate surface]
  C100/50/50 [inner max about 600px; vAlign center]
    H2 + Paragraph(s)
  C100/50/50
    optional H3 [grid introduction]
    R [gap 20; pad 0]
      C ×4 [100/50/50; pad 30; white; radius 10]
        Heading [level appropriate to outline]
        Paragraph [short explanation]
```

This is a grid inside one half of another grid. Both tiers respond to the viewport in current source. Four short items suit it; long answers should use P09. At medium widths, inspect the actual text measure and delay the nested two-column layout until desktop if needed (`tabletWidth:100`, `desktopWidth:50`). That delay is a recommended adaptation, not the observed ATD setting.

### P07 Three parallel cards with optional accent edge

**Choose for:** three service categories, practical information items, or comparable choices. **Observed:** ATD Crowns and [Dental Health](http://localhost:10028/dental-health/); Smiles New Patients' forms, X-rays, and consultation cards.

```text
R
  C100
    H2 + optional introduction
    R [pad 0; gap 20]
      C ×3 [100/33.333333/33.333333; pad 20–40; radius 10]
        H3
        Paragraph(s)
        optional Buttons > Button
```

ATD's variant has a 5px colored left border and a native shadow preset. Smiles' variant uses theme glass styling. Both nest the card grid inside a full-width content column. The nested row gives the cards their own gap; a flattened heading-and-cards row is a possible simplification when separate spacing is unnecessary. For more comfortable tablet cards, adapt widths to `100/50/33.333333`; the third card wraps. Keep related actions and similar information density; do not manufacture matching copy lengths by removing necessary qualifications.

### P08 Heading tile within a four-item grid

**Choose for:** three concise benefits when a full-width heading row would feel oversized. **Observed:** [Smiles Exams and Cleanings](http://localhost:10034/general-dentistry/exams-and-cleanings/), the professional-cleaning benefits subtree.

```text
R [dark surface; gap 20]
  C100/50/50 [unframed] > eyebrow + H2
  C100/50/50 [padded, bordered panel] > H3 + Paragraph
  C100/50/50 [matching panel] > H3 + Paragraph
  C100/50/50 [matching panel] > H3 + Paragraph
```

The heading is the first cell; wider screens form a two-by-two composition and phones show a logical introduction followed by benefits. The surrounding reference page has a custom sidebar, which is excluded. Reuse this verified clean inner row independently.

### P09 Introduction beside stacked process panels

**Choose for:** steps or answers that need more than a sentence each. **Observed:** ATD Crowns and The Wand process sections.

```text
R
  C100/50/50 [inner max about 600px] > H2 + short introduction
  C100/50/50
    R [pad 0; gap 20]
      C100 ×N [pad 30; radius 10; distinct surface]
        H3 [step or question]
        Paragraph(s)
```

One longer article panel is also valid. Use separate panels only for real stages. Keep source order meaningful; responsive flex order must not reverse a process. A supplied numerical prefix belongs in the core heading or paragraph, not in an invented icon/badge block. Do not add visible numbering that was not supplied.

### P10 Full-width heading with wrapped process cards

**Choose for:** four concise sequential stages or principles. **Observed:** EEFy Defendant's four-step process and [Schedule a Consultation](http://localhost:10022/schedule-a-consultation/)'s eligible process section.

```text
R [often a dark contrasting section; gap 20]
  C100 > centered H2 + optional introduction
  C ×4 [100/50/50; pad 20 mobile, 30 desktop; radius 5]
    H3 [number and stage]
    Paragraph
  optional C100 > centered Buttons
```

The parent contains five or six actual children, even though the cards form two columns. No extra row wrapper is necessary for each pair. Use consistent numbers and headings, and verify that mobile order follows the same sequence.

### P11 Paired statements or alternating explanation modules

**Choose for:** mission/philosophy, two audience paths, inclusions/exclusions, or complementary explanations. **Observed:** [ATD The Practice](http://localhost:10028/about/the-practice/), EEFy [Contact](http://localhost:10022/contact/), and clean main-column sections of [Smiles Ozone Therapy](http://localhost:10034/integrative-dentistry/ozone-therapy/).

```text
R
  optional C100 > H2 + introduction
  C100/50/50 [light panel; border; radius] > H3 + Paragraph/List + optional Buttons
  C100/50/50 [dark or complementary panel] > H3 + Paragraph/List + optional Buttons
```

For a long article, alternate two such modules with restrained light/dark section backgrounds. Change colors to support grouping, not simply on every paragraph. Set core text and link colors deliberately in dark cards. EEFy's audience cards also use ordinary core Images for small illustrations; no icon block is needed.

### P12 Three credentials or compact factual statements

**Choose for:** genuine credentials, short evidence statements, or already-provided metrics. **Observed:** EEFy About, Plaintiff, and Consultation interior sections.

```text
R
  C100 > H2 + optional introduction
  C ×3 [100/33.333333/33.333333; thin border; modest radius]
    optional Paragraph [provided number or small label]
    Heading OR Paragraph [statement]
```

This is a compact variation of P07 with less card chrome and no forced action on each item. The pattern does not require statistics. Never invent a number because a large-number design looks attractive. For only two genuine facts, use halves.

### P13 Repeated profile rows

**Choose for:** people, locations, case profiles, or product introductions. **Observed:** [Smiles About](http://localhost:10034/about/) and [ATD Meet Our Team](http://localhost:10028/about/meet-our-team/).

```text
R
  C100 > H2 [collection introduction]
  C100 ×N [optional white rounded outer panel]
    R [pad 20–30; gap 20]
      C100/30/30 [portrait/name panel]
        H3 [name]
        Image
      C100/70/70 [pad 0]
        Paragraph(s) [biography]
```

Smiles supplies the 30/70 inset-card variant. ATD uses larger repeated 50/50 portrait/bio sections. Choose based on copy length and image proportions. Use one page H1 and subsequent H2/H3 names according to the outline; some references repeat H1 and should not be copied literally. Preserve names, roles, and credentials exactly.

### P14 Wide decorative image with constrained copy

**Choose for:** a visual pause within a long page when a decorative asset is available. **Observed:** ATD Crowns, The Wand, and The Practice.

```text
R [very wide inner max; one outer edge may have no gutter]
  C100/50/50 [decorative background; intentional image height]
  C100/50/50 [inner max about 700px; vAlign center]
    H2 + Paragraph(s) + optional Buttons
```

ATD uses a 3840px wider max and a large cropped brand mark, with substantial tablet image padding. Its saved `backgroundSize:"contain"` renders as `cover` in the older installed version. Use the current implementation and verify the desired crop. On mobile, collapse the image only if it is genuinely decorative; otherwise give it a supported height mechanism or replace it with a core Image. Do not use maximum height as a substitute.

### P15 Media panel with an attached caption or contact panel

**Choose for:** an explanatory video, an office tour, or a portrait with related details. **Observed:** Smiles New Patients' video panel, Smiles About, EEFy Contact's portrait/contact panel.

```text
outer C [often one half of a split]
  R [gap 0; pad 0]
    C100 [top corners rounded; suitable inset]
      Image or Embed
    C100 [bottom corners rounded; pad 10–20]
      Paragraph [caption] OR H3 + contact Paragraphs
```

For YouTube, use the native YouTube variation of `core/embed` with a responsive aspect ratio; do not substitute a linked thumbnail or outbound video button. Other supported video providers also use `core/embed`. Retain the embed and report a playback limitation if the automated browser cannot play it. Add the attached caption/contact panel only when that exact copy is supplied; otherwise omit the lower column. When this media panel sits beside shorter text, vertically center the text column at the side-by-side tiers. This is an external-media dependency, but not a custom block. EEFy's portrait variant uses a decorative background and Spacer in the upper column. A column's radius does not automatically clip a foreground Image: style that core Image separately when necessary.

### P16 Testimonial with supporting context

**Choose for:** supplied quotations and a factual explanation of their context. **Observed:** [EEFy Testimonials](http://localhost:10022/testimonials/).

```text
Featured variant:
  R
    C100/50/50 > H2 + nested P04 quote panel
    C100/50/50 > H3 [context] + Paragraph
Collection variant:
  R [contrasting section]
    C100 > H2
    C ×4 [100/50/50; outer panel pad 20–30]
      R [pad 0; one C100 with its own quote surface]
        C100 > Paragraph [quotation and attribution]
      Paragraph [case context outside the inset]
```

The observed quotes are styled core Paragraphs. A core Quote is a semantic adaptation if it fits the target design. Preserve quotation wording and attribution; include context or explanatory prose only when supplied, and keep it visibly separate. No carousel is required. Smiles' testimonial slider is custom and is not the source for this recipe.

### P17 Questions and answers using core blocks

**Choose for:** a real FAQ supplied in the content. **Observed:** [EEFy FAQs](http://localhost:10022/faqs/), with 16 items in the installed core accordion.

```text
R [comfortable reading measure]
  C100
    optional H2 [FAQ section introduction]
    core/accordion
      core/accordion-item ×N
        core/accordion-heading [question]
        core/accordion-panel
          Paragraph(s) / List(s)
```

Check that these names are registered in the destination WordPress version. On the audited installation, `core/accordion-heading` stores the question in `title`, not the ordinary heading's `content` attribute. Use the destination serializer and controls rather than inventing the accordion's button/ARIA markup. If unavailable, a supported core Details block or open H3-and-paragraph stack is a **proposed fallback**. Artistic Touch's `stgb/accordion` is custom even when the visible interaction looks similar. Test keyboard activation and the heading outline.

### P18 Contact details and hours

**Choose for:** a location, telephone/booking action, and provided opening hours. **Observed:** [ATD Contact](http://localhost:10028/contact/) and [Schedule](http://localhost:10028/patient-info/schedule/), including verified synced pattern 9441.

```text
R
  C100/50/50 [inner max about 500px]
    H1 or H2 [appropriate to page]
    Paragraph(s) [contact purpose]
    Group > Paragraph [label] + Paragraph [linked phone]
    Buttons > Button [existing booking destination]
  C100/50/50 [inner max about 500px; contentHAlign center]
    Image [static map or location photo]
    Paragraph [address]
R
  C100 > H2 [hours]
  C100
    R [pad 0; separate card gap]
      C ×N [responsive compact grid]
        H3 [day] + Paragraph [hours]
```

The map in the observed pattern is a core Image, not an interactive map block. Preserve the supplied address information; do not invent a visible caption or address label. Use supplied image alternative text when available, otherwise add only a factual accessible description rather than new visible copy. Verify a sensible tablet layout for all day cards. A core Table is a **semantic alternative** when it better expresses the schedule. Forms on EEFy and Smiles require Gravity Forms and remain outside this strict pattern library.

### P19 Two-column closing action band

**Choose for:** a concluding statement paired with a more prominent action panel. **Observed:** Smiles' verified shared CTA 7359, visible on [Holistic Facial Esthetics](http://localhost:10034/holistic-facial-esthetics/) and service pages.

```text
R [dark gradient; max 1436 observed; gap 20 mobile, 80 desktop]
  C100/50/60 [vAlign center]
    eyebrow + H2 + Paragraph
  C100/50/40 [pad 20 mobile, 40 desktop; radius 10]
    H3 + Paragraph + Buttons > Button
```

The second column's glass effect and the button's secondary style are theme dependencies. Native color, border, radius, and shadow can provide a portable adaptation. Keep the primary destination consistent with the page's earlier CTA. On a different site, recreate the blocks instead of copying reference 7359.

### P20 Inset gradient CTA panel

**Choose for:** one clear action at the end of a service page. **Observed:** ATD The Wand, Crowns, and The Practice.

```text
R [ordinary section gutter; neutral background]
  C100 [gradient; radius 20; padding; innerMaxWidth about 900px;
        contentHAlign center; optional native shadow]
    H2 [centered]
    Paragraph [centered]
    Buttons [centered] > Button
```

The background covers the full column while the content is constrained inside it. ATD's actual panel padding is 30px mobile, explicit 0px tablet, and 30px desktop. For a new adaptation, choose intentional padding at every tier rather than reproducing that tablet exception automatically. Use the exact supplied CTA copy and set the final text item and Buttons block to zero bottom margin. If the supplied paragraph is long, select a roomier pattern instead of shortening it.

### P21 Centered statement or photograph CTA

**Choose for:** a mission, policy summary, promise, or brief final invitation. **Observed:** Smiles About's Mission Statement, New Patients' Deposit band, and EEFy closing CTA sections.

```text
R [inner max around 800–920px; generous vertical padding;
   solid/gradient OR darkened decorative photograph]
  C100
    H2 [centered]
    Paragraph [centered]
    optional Buttons [centered]
```

The EEFy photo variant sometimes separates heading and copy into two full-width columns; either structure is valid. Check contrast across the entire crop and keep legal/policy qualifications intact. Background opacity affects the media/gradient layer, not the foreground text. A video background has separate layering behavior; read the [`sgb/columns`](../src/blocks/columns/save.php) or [`sgb/column`](../src/blocks/columns/column/save.php) renderer before substituting one.

### P22 Decorative gradient divider

**Choose for:** an existing brand treatment that uses a thin color transition between sections. **Observed:** ATD shared pattern 9443.

```text
R [columns 1; pad 0; mobileMargin top/bottom 0]
  C100 [empty; pad 20px all; background color and gradient]
```

Vertical padding supplies the observed 40px strip. It contains no content and should not be presented as a heading or meaningful information. It is optional; a core Separator within an appropriate column or a simple background transition may be sufficient. Do not add it mechanically to every new page.

### P23 Article with a core sidebar

**Choose for:** a long service article with a short related-links list. **Status: proposed core-only adaptation.** Smiles service pages demonstrate the outer proportions but use the excluded custom `sbs/sidebar-menu`.

```text
R [gap 20 mobile, 40 wider]
  C100/70/80
    P05 reading content and selected nested modules
  C100/30/20
    H2 or H3 [related information]
    List > linked List Items
```

On mobile, place the sidebar after the main content in the DOM. Do not claim sticky behavior: Sidekick has no sticky control. The core list replaces the custom menu and may not duplicate its automatic navigation behavior. Use supplied meaningful link labels and verify all destinations. For Bell's full collection navigation, use the separate template/menu workflow above; do not rebuild that shared menu as an article-side list.

### P24 Equal-height cards with actions at the bottom

**Choose for:** cards where consistent action placement materially helps comparison. **Status: source-supported composition, not a separately observed site recipe.**

```text
R [wrapping row, ordinary card widths]
  C ×N [vAlign space-between; card padding/background]
    Group [heading + paragraphs]
    Buttons > Button
```

`space-between` distributes the content wrapper's immediate children. Zero the last text item's bottom margin inside the Group and the Buttons wrapper's bottom margin; the card padding supplies the outside inset. The Group keeps the title and body together at the top, while Buttons is the second item. Equal-height peers in the flex row supply available height; this does not create a fixed-height grid across every wrapped row. Prefer this to stuffing short cards with empty paragraphs or fixed spacers.

### P25 Ruled resource directory

**Choose for:** a supplied overview containing links to many related pages. **Observed:** [Bell Oral Surgery Services](http://localhost:10016/surgery-services/), published October 5, 2026.

```text
R [title treatment] > C100 > supplied H1
R [ordinary outer padding]
  C100 [optional white panel; Bell 20/40px padding and 8px corners]
    supplied introduction
    R [structural padding 0; deliberate wrapping gap]
      C ×N [responsive widths; restrained divider/border]
        supplied linked Heading or Paragraph
        supplied description, only if present
```

Use the source's real grouping and verified local destinations. This makes a navigable directory without inventing blurbs, icons, or button labels, and avoids turning a long list into a stack of oversized promotional cards. Keep source order meaningful and clear each item's terminal margin. A collection's sidebar still belongs to its template.

### P26 Clinical illustration sequence or comparison grid

**Choose for:** a supplied sequence of clinical illustrations with associated captions, or genuine illustrated alternatives. **Observed:** Bell [Overview of Implant Placement](http://localhost:10016/dental-implants/overview-of-implant-placement/) and [Missing All Upper or Lower Teeth](http://localhost:10016/dental-implants/missing-all-upper-or-lower-teeth/). This combines P07's grid with P15's media/copy relationship.

```text
P05 [supplied heading and explanation, if present]
R [ordinary outer padding]
  C100 [optional shared panel surface]
    R [padding 0; gap appropriate to the actual available width]
      C ×N [100% mobile; halves/thirds only when readable]
        Image [preserve source proportions and alternative text]
        Paragraph or image caption [exact supplied caption, if present]
```

Keep each illustration paired with its own source caption and preserve clinical sequence order. Do not create step numbers or explanatory copy absent from the source. Use the caption's native core serialization; images without supplied captions remain uncaptioned. In Bell, use 16px between image and caption, zero terminal caption margin, and the shared 8px exposed-image radius. The observed wider three-image rows are not a mandate to squeeze thirds into a narrow sidebar article; choose the split tier by available width. For illustrated alternatives with substantial body copy, use P07's larger two-column cards instead.

## Assemble whole pages

These are **recommended sequences derived from the observed sections**. Use only sections supported by the content; a concise page may need three sections rather than seven.

| Page need | Suggested sequence |
| --- | --- |
| Service or treatment | P02 introduction → P06 benefits → P07 options if applicable → P09/P10 process → P17 supplied FAQs → P20 CTA |
| Expert or professional service | P02 with P04 summary → P05 explanation → P11 complementary considerations → P12 credentials → P10 process → P21 CTA |
| About | P02 introduction → P11 mission/philosophy or P21 statement → P13 profiles → P19 CTA |
| New patient or onboarding | P03 introduction → P15 tour/media beside explanation → P07 practical information → P21 policy/next step |
| Team | P01 page title → P13 repeated profiles → restrained P21 invitation |
| Resource or article | P01 title → P05 reading sections or P25 supplied directory, optionally P23 article sidebar → P19 supplied CTA |
| Testimonials | P02 or P01 introduction → P16 featured quotation → P16 collection → P21 CTA |
| Contact | P01/P02 orientation → P18 contact and hours; add a form only when separately authorized within a broader block scope |

A worked planning example: if the content document contains a service introduction, four short benefits, three stages, and a booking URL, map those to P02, P06, P09, and P20. If no suitable image is available, use P01 instead of inventing a photo requirement. If the benefit paragraphs are long, use P11 or P05 rather than shrinking the type to fit P06. All supplied sections should appear in a content-to-section checklist before the draft is called complete.

## Serialization and implementation

Sidekick's two blocks are dynamic. Their JavaScript save functions store **only their inner blocks**, and PHP creates the section/column wrappers, background layers, per-instance classes, and CSS. Never paste a rendered `<div class="wp-block-sgb-columns">` tree back into post content. Do not copy UUID classes, generated `<style>` elements, or frontend CSS variables into Gutenberg JSON.

The shortest valid illustration is a two-column row containing core text. This is real block-comment syntax, but it is a structural example rather than a finished page:

```html
<!-- wp:sgb/columns {"columns":2,"mobileGap":24,"mobilePadding":{"top":"40px","right":"20px","bottom":"40px","left":"20px"},"mobileMaxWidth":"var(--wp--style--global--wide-size)"} -->
<!-- wp:sgb/column {"width":100,"tabletWidth":50,"mobilePadding":{"top":"0px","right":"0px","bottom":"0px","left":"0px"}} -->
<!-- wp:heading -->
<h2 class="wp-block-heading">Section heading</h2>
<!-- /wp:heading -->
<!-- wp:paragraph {"style":{"spacing":{"margin":{"bottom":"0"}}}} -->
<p style="margin-bottom:0">Primary explanation.</p>
<!-- /wp:paragraph -->
<!-- /wp:sgb/column -->
<!-- wp:sgb/column {"width":100,"tabletWidth":50,"mobilePadding":{"top":"0px","right":"0px","bottom":"0px","left":"0px"}} -->
<!-- wp:paragraph {"style":{"spacing":{"margin":{"bottom":"0"}}}} -->
<p style="margin-bottom:0">Supporting explanation.</p>
<!-- /wp:paragraph -->
<!-- /wp:sgb/column -->
<!-- /wp:sgb/columns -->
```

Prefer the target site's `wp.blocks.createBlock` and `wp.blocks.serialize` when programmatic authoring is available. The following **construction example does not insert or publish anything**. It returns an editable P06 section and assumes a loaded Gutenberg registry with these block types. Use ordinary content data as text, not untrusted executable code.

```js
function buildSidekickBenefits(wp, content) {
  const { createBlock } = wp.blocks;
  const pad = (vertical, horizontal = vertical) => ({
    top: vertical, right: horizontal, bottom: vertical, left: horizontal,
  });
  const esc = (text) => String(text).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
  const heading = (text, level) => createBlock('core/heading', {
    content: esc(text), level,
  });
  // Every paragraph created here is the final text item in its column.
  const paragraph = (text) => createBlock('core/paragraph', {
    content: esc(text), style: { spacing: { margin: { bottom: '0' } } },
  });
  const column = (attrs, children) => createBlock('sgb/column', {
    width: 100, mobilePadding: pad('0px'), ...attrs,
  }, children);
  const row = (attrs, children) => createBlock('sgb/columns', {
    columns: children.length, mobileGap: 24,
    mobilePadding: pad('0px'), ...attrs,
  }, children);

  if (!Array.isArray(content.benefits) || !content.benefits.length) {
    throw new Error('Use a reading section when no benefit items are supplied.');
  }
  const cards = content.benefits.map((item) => column({
    tabletWidth: 100, desktopWidth: 50,
    mobilePadding: pad('24px'),
    backgroundColor: '#ffffff',
    border: { width: '1px', style: 'solid', color: '#d6dce2' },
    borderRadius: {
      topLeft: '10px', topRight: '10px',
      bottomRight: '10px', bottomLeft: '10px',
    },
  }, [heading(item.title, 3), paragraph(item.body)]));

  return row({
    mobilePadding: pad('40px', '20px'),
    tabletPadding: pad('60px', '30px'),
    padding: pad('80px', '40px'),
    mobileMaxWidth: 'var(--wp--style--global--wide-size)', backgroundColor: '#f7f8fa',
  }, [
    column({ tabletWidth: 50, innerMaxWidth: '600px', vAlign: 'center' }, [
      heading(content.title, 2), paragraph(content.introduction),
    ]),
    column({ tabletWidth: 50 }, [row({}, cards)]),
  ]);
}

// With supplied content and the site's loaded block registry:
// const section = buildSidekickBenefits(wp, suppliedContent);
// const serialized = wp.blocks.serialize([section]);
// Inspect serialized content before using the authorized save workflow.
```

The example deliberately keeps the inner cards full-width at tablet while the outer split starts there. Its outer row uses the site's wide-width variable; verify that variable or substitute the actual Full Site Editor wide width. Its neutral colors and gutters are placeholders for destination design tokens. It should be combined with a page H1 elsewhere, not promoted into an H1 for every section. Source-backed syntax checks do not substitute for a destination editor round trip.

Before saving generated content, recursively inspect the tree and any resolved synced references. Confirm that every `sgb/columns` has actual `sgb/column` children, that all descendants meet the allowlist, and that no placeholder copy, source-site media IDs, copied anchor IDs, or unresolved local references remain. Match each core Image's ID and URL to the destination media library, or use an appropriately supported URL-based image with verified dimensions and alternative text. Use registered core serializers for lists, images, embeds, and accordions rather than hand-building their internal HTML.

When working through the editor UI, build the outer section, set its layout, add the child columns, then add core content and purposeful nested sections using List View. The inspector's Mobile/Tablet/Desktop settings tab chooses which attributes to edit; it does not itself resize the preview. Verify the preview width separately.

### Native media and version-sensitive core markup

Use the destination's installed serializer for `core/embed`, `core/video`, images, tables, lists, and buttons, and compare a saved editor round trip. Valid browser HTML can still be invalid Gutenberg saved markup.

- **YouTube:** parse the supplied URL before constructing a canonical watch URL. For `/embed/VIDEO_ID?rel=0`, extract the eleven-character ID from the pathname; for watch links, read the `v` parameter. Do not encode `?rel=0` into the ID. Preserve an intentionally supplied start time through supported embed handling rather than accidentally discarding it. Use the native YouTube variation with responsive aspect ratio, then verify a real frontend player/iframe appears. A plain outbound URL is not successful embedding.
- **Native Video:** the Bell installation's `core/video` serializer omits default `preload="metadata"` from saved HTML. Including it manually caused editor validation errors despite working frontend playback. Its `src`, `poster`, `controls`, and `preload` are sourced from saved video markup; putting them only into a comment's JSON is insufficient. This behavior is version-sensitive: use the installed serializer instead of treating this detail as a permanent cross-version template.
- **Legacy presentation widgets:** do not carry source scripts into an HTML/Shortcode block. The surgery batch's supplied Wistia procedures became native locally hosted Video blocks; existing high-resolution link labels were preserved. A PBHS presentation with no supplied standalone playable source retained its supplied poster linking to the verified original presentation. This is a distinct legacy-media case, not permission to replace a supplied YouTube video with a thumbnail. Preserve the supplied caption/description only; do not write fallback instructions into the article.
- **Core styles belong on the serializer's element:** for example, the installed core Button saves its spacing styles on the anchor, not the outer button div; image radius requires the native image markup/classes. Update attributes and saved markup together through the native serializer, then reopen Gutenberg.

Long unbroken source headings must wrap within their existing column. In Bell's surgery collection, scoped `overflow-wrap:anywhere` fixes “Dentures/Bridgework” without changing the source words or only one row's shared 30/70 proportions. A wide comparison table can scroll inside its core Table figure on phones; the verified Anesthesia treatment uses a 40rem table within an `overflow-x:auto` figure. Scope such integration CSS to the affected template/article, and confirm it does not make the whole page scroll horizontally.

## Validation before delivery

Check the page in the real frontend and reopen its saved content in Gutenberg. For a new or changed page, verify the following:

- **Content:** only the chosen article subtree is present; all supplied visible copy is reproduced exactly. No invented or rewritten captions, headings, eyebrows, labels, explanations, CTA text, quotations, or claims appear. Compare current saved content and rendered text against the source, including table/list content and small media labels; account explicitly for verified destination remapping and WordPress typography.
- **Structure:** only allowed article block types occur recursively; referenced patterns are resolved; no invalid/recovery blocks appear after reopening the actual saved page; actual child count and `columns` agree. Template navigation is assessed separately. Compare the post-save block tree to the intended tree, not merely the unsaved builder output.
- **Section alignment:** ordinary section-level Columns use the live Full Site Editor wide width; their visible edges line up with the header after accounting for gutters and template constraints. Narrow reading measures belong inside child columns. Any different section width has an intentional layout purpose.
- **Repeated-pattern geometry:** compare actual DOM bounding rectangles for the labels, first body blocks, and wrapper insets of neighboring repeated sections at each tested width. Matching attributes, valid blocks, and absence of overflow do not prove alignment. Fix unintended differences in left edges, body starts, gaps, or chapter insets, and confirm the result visually.
- **Hierarchy:** one supplied page H1 in its first Sidekick section for the Bell workflow, no automatic template title, appropriate H2/H3 progression, semantic lists, supplied descriptive links, and useful image alternatives. Verify the H1 inset at every tested breakpoint.
- **Responsive layout:** inspect a small phone, a medium/tablet width, and desktop, plus immediately around any custom breakpoint. Confirm wrapping, gutters, readable nested cards, image crops, and no horizontal scroll. At each side-by-side tier, shorter text uses Middle vertical alignment beside taller media. A nested row still responds to viewport width.
- **Spacing:** verify computed margins on all four sides of core content and figure wrappers, plus supported structural-wrapper margins. The first item has zero top margin; terminal text has zero bottom margin, including before buttons; each Buttons wrapper has zero bottom margin and a deliberate top margin only when following content in the same column. Preserve the approved inter-block gap (16px on Bell) before a following table/media block instead of treating the preceding text as terminal. Check equal top/bottom visual insets and nested groups. No duplicate header offsets, accumulated nested padding, empty spacing paragraphs, or accidental Auto columns remain.
- **Behavior:** supplied YouTube videos are native embeds with real frontend players; native procedural videos load and their controls work. Check saved URLs, media readiness, image decoding, downloads, and destination links. Report any playback limitation without silently substituting a link. Core accordions and navigation toggles work by keyboard; meaningful source order is retained.
- **Presentation:** preserve the approved canvas and purposeful white/dark/mist contrast, 8px Bell panels, shared column guides, and content-led variety. Inspect long headings, local table scrolling, contrast, focus, and the complete article. Optional entrance effects must not hide essential content.
- **Collection shell:** every collection page has the correct section template and its separate menu. Check actual page IDs/URLs, hierarchy, current item and active-descendant contrast, Enter/Space toggles, and the approved responsive order/gutters. On Bell, verify article-first mobile order, 16px mobile menu margins, and menu/header alignment at 1024px and wide desktop. The wide cap remains while content-wrapper spacing stays zero.
- **Portability:** theme classes, fonts, colors, shadows, and button styles exist on the target site. Replace missing theme effects explicitly rather than assuming the plugin supplies them.

Use the user's publication instructions. Confirm the WordPress save succeeded, reread current saved content, reload the final frontend, and record only checks actually completed. Measure the real viewport, not merely a successful resize-tool response; the completed Bell batches used 390px, 1024px, 1280px, and 1800px checks. Inspect additional widths around intentional inner breakpoints such as 1200px. A final screenshot must show the saved final state, not an earlier draft. Label before-fix reports as historical evidence. If the editor canvas is unavailable, state that limitation instead of implying a visual editor check; serialization and frontend checks remain separate evidence. Distinguish prepared, saved, assigned, and published status for pages, menus, templates, CSS, and repository docs. Report the page URL, patterns used, and unresolved checks without calling staged artifacts live.

## Historical details to learn from without copying

The existing pages are a pattern library, not a collection of flawless templates. Some have repeated H1s, empty spacing paragraphs, inconsistent padding, very narrow saved mobile widths, or theme-specific fixed-header spacers. Preserve their useful compositions while correcting those details in newly authored pages.

EEFy's installed plugin header reports 1.0.5, and ATD's reports 1.0.4; the inspected source is 1.2.0. EEFy has much of the same attribute vocabulary but lacks some current fixes, including nested server breakpoint context and editor preview-width handling. ATD has examples where a saved custom tablet breakpoint or image-size setting does not match the installed output. Treat those as historical behavior, not requirements to reproduce. The block source files linked in the introduction are authoritative.

Advanced extension, translation, visual order, z-index, background video, and entrance animation are available in the source. Use them only when the composition needs them. The audited interiors achieve most of their variety through ordinary widths, content measure, nested surfaces, meaningful imagery, and typography; an overlap is not required to make a page feel custom.

## Prompt for a future agent

> Read `docs/SIDEKICK_PAGE_GUIDE.md` and the Sidekick block attribute files it links. Build the specified page or collection from the supplied article content using only `sgb/columns`, `sgb/column`, and core blocks in the body. Read current saved pages, the live theme/template, and any user-edited reference before editing. Extract only the article (`#contentMain` article subtree, narrowing to `#content` when present for the Bell source) and preserve exact supplied visible copy, links, lists, captions, and media. Choose varied, source-led layouts; do not manufacture copy to fill cards. Match the live FSE Wide cap and header guides, use the approved Bell/reference spacing and 8px corners when applicable, keep repeated geometry consistent, and put the supplied H1 in the first Sidekick section without a duplicate template title. Use native YouTube/Video blocks, center shorter text beside media, and apply terminal margins correctly. For a collection, use its own WordPress menu/template with article-first mobile order, correct active states, and zero content-wrapper spacing. Preserve existing live Additional CSS when merging changes. Resolve synced references and avoid custom widgets in the article. Follow my save/publication instructions, verify actual saved editor content and responsive frontend, and report the live/draft URL and any incomplete checks. Do not describe staged files as saved or published.

