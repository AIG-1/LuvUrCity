# LuvUrCity — Deploy Steps (browser only)

## 1. GitHub
1. Create repo `AIG-1/LuvUrCity` (public or private).
2. Unzip on your computer. Drag the **contents** of the `luvurcity` folder into the empty repo page. Commit.
3. Check the root shows: `index.html`, `thanks.html`, `netlify.toml`, `admin/`, `css/`, `data/`, `images/`, `js/`.

## 2. Netlify
1. Add new site → Import from Git → pick the repo. Build command: blank. Publish directory: `.`
2. Site name: `luvurcity` (gives luvurcity.netlify.app).
3. Integrations → Identity → Enable. Registration: **Invite only**.
4. Identity → Services → **Enable Git Gateway**.
5. Identity → Invite users → your email (and Chasity's after purchase).
6. Accept the invite email → set password → you land on /admin.

## 3. Forms (Netlify Forms, free tier)
1. Forms → Enable form detection → redeploy once.
2. Forms → Form notifications → Add email notification for `newsletter` and `review`:
   - Concept phase: your email only, for test submissions.
   - After she approves: chasity.chapel@ia.combined.com + luvurcity1125@gmail.com (and yours until purchase).

## 4. Admin map (/admin)
| Admin item | Controls |
|---|---|
| Site Settings | Contact info, hero, why section, booking, signup, disclaimers, concept bar toggle |
| Ticker Banner | Scrolling links, order, speed |
| Flyer Carousel | Add / delete / reorder flyers, speed, screen-reader text |
| Services | Service cards and anchor IDs the ticker links to |
| Reviews | Real, approved reviews only |
| Blog Teasers | Homepage article cards |
| City Bot | Greeting, quick options, answers, buttons, avatar |

## 5. Before launch (after she approves)
- Remove `noindex` line in `index.html` and `X-Robots-Tag` line in `netlify.toml`.
- Turn off "Concept preview" bar in Site Settings.
- Fill the `[#]` numbers in the Medicare disclaimer (Site Settings and City Bot).
- Confirm license count via NIPR before changing "multiple states".
- Confirm Combined (Chubb) approves web use of the Combined flyer.
- Point her domain: Netlify → Domain management → add `luvurcitymyway.com` → give her the DNS records shown.
