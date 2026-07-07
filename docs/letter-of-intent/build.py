import base64, pathlib

ROOT = pathlib.Path("/home/user/Portfolio")
ASSETS = ROOT / "docs/letter-of-intent/assets"
OUT = ROOT / "docs/letter-of-intent/letter-of-intent-scott-milton.html"

def b64(p):
    return base64.b64encode(pathlib.Path(p).read_bytes()).decode()

logo = b64(ASSETS / "guil_logo.png")
sig  = b64(ASSETS / "assinatura.png")
font_bold = b64(ROOT / "public/fonts/NeueAugenblick-Bold.ttf")

html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Letter of Intent — Scott Milton</title>
<style>
  @font-face {{
    font-family: "Neueaugenblick";
    src: url("data:font/ttf;base64,{font_bold}") format("truetype");
    font-weight: 700; font-style: normal; font-display: swap;
  }}

  :root {{
    --ink:#0a0a0a; --body:#333333; --muted:#7e7e7e; --faint:#afafaf;
    --rule:#d8d8d8; --accent:#299c68;
  }}

  * {{ box-sizing: border-box; }}
  html, body {{ margin:0; padding:0; background:#e9e9e9; }}
  body {{
    font-family: -apple-system, "Segoe UI", "Helvetica Neue", Arial, "Liberation Sans", sans-serif;
    color: var(--body); -webkit-font-smoothing: antialiased;
  }}

  /* A4 sheet */
  .sheet {{
    width: 210mm; min-height: 297mm; margin: 24px auto; background:#fff;
    padding: 20mm 22mm 16mm; display:flex; flex-direction:column;
    box-shadow: 0 4px 40px rgba(0,0,0,.14);
  }}

  header {{ display:flex; align-items:flex-end; justify-content:space-between; }}
  header img.logo {{ height: 30px; width:auto; display:block; }}
  header .date {{ font-size: 10.5px; color: var(--muted); letter-spacing:.02em; }}
  .rule {{ height:1px; background: var(--accent); border:0; margin: 12px 0 0; }}

  main {{ flex: 1 1 auto; padding-top: 30px; }}

  h1 {{
    font-family: "Neueaugenblick", Georgia, serif; font-weight:700;
    color: var(--ink); font-size: 19px; line-height:1.3; margin: 0 0 26px;
    max-width: 34ch;
  }}

  p {{ font-size: 12.5px; line-height: 1.7; margin: 0 0 14px; }}
  ol {{ font-size: 12.5px; line-height: 1.7; margin: 0 0 14px; padding-left: 20px; }}
  ol li {{ margin: 2px 0; padding-left: 4px; }}
  .lead {{ margin-bottom: 16px; }}

  .sign {{ margin-top: 26px; }}
  .sign .kr {{ margin-bottom: 4px; }}
  .sign img.signature {{ height: 66px; width:auto; display:block; margin: 2px 0 -6px -4px; }}
  .sign .name {{ font-size: 13px; color: var(--ink); font-weight: 600; margin: 0; }}
  .sign .role {{ font-size: 11.5px; color: var(--muted); margin: 2px 0 0; }}

  footer {{
    margin-top: 28px; padding-top: 10px; border-top: 1px solid var(--rule);
    display:flex; justify-content:space-between; align-items:center; gap:16px;
    font-size: 10px; color: var(--muted); letter-spacing:.01em;
  }}
  footer .dot {{ color: var(--faint); padding: 0 6px; }}
  footer a {{ color: var(--muted); text-decoration:none; }}

  @page {{ size: A4; margin: 0; }}
  @media print {{
    html, body {{ background:#fff; }}
    .sheet {{ margin:0; box-shadow:none; width:auto; min-height:auto; }}
  }}
</style>
</head>
<body>
  <div class="sheet">
    <header>
      <img class="logo" src="data:image/png;base64,{logo}" alt="guil.is — Creative Director">
      <div class="date">7 July 2026</div>
    </header>
    <hr class="rule">

    <main>
      <h1>Letter of intent regarding the potential engagement of Scott Milton</h1>

      <p class="lead">Dear Sir or Madam,</p>

      <p>I hereby confirm my interest in engaging Scott Milton as a freelance Product
        Design Director &amp; Consultant, subject to his obtaining the appropriate
        freelance visa / work authorization in Germany.</p>

      <p>I have been in discussion with Scott regarding freelance support across product
        design, UX/UI, website design, product flows, and design systems. His background
        in product design leadership, digital product strategy, and brand-led product
        experiences makes him well suited to the work we have discussed.</p>

      <p>The anticipated scope may include:</p>
      <ol>
        <li>Product design and UX/UI support across product flows and digital experiences.</li>
        <li>Website and marketing page design.</li>
        <li>Design system development and interface quality.</li>
        <li>Product strategy, prototyping, and collaboration with product and engineering teams.</li>
      </ol>

      <p>The engagement would be freelance, project-based, and dependent on project needs,
        availability, and Scott obtaining the appropriate freelance authorization in Germany.
        Based on our discussions, I anticipate a part-time, flexible allocation of up to
        around 50% capacity for defined project periods, at an indicative rate of around
        &euro;125 per hour. Commercial terms would be agreed separately.</p>

      <p>This letter confirms my interest in exploring a freelance collaboration and does
        not constitute a binding employment contract or guaranteed commission.</p>

      <div class="sign">
        <p class="kr">Kind regards,</p>
        <img class="signature" src="data:image/png;base64,{sig}" alt="Guilherme Maueler">
        <p class="name">Guilherme Maueler</p>
        <p class="role">Creative Director &middot; Sole freelancer</p>
      </div>
    </main>

    <footer>
      <span>Guilherme Maueler &middot; Creative Director</span>
      <span>
        <a href="mailto:hello@guil.is">hello@guil.is</a>
        <span class="dot">&middot;</span>guil.is
        <span class="dot">&middot;</span>USt-IdNr DE308488034
      </span>
    </footer>
  </div>
</body>
</html>
"""

OUT.write_text(html, encoding="utf-8")
print("wrote", OUT, f"({len(html)//1024} KB)")
