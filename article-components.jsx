// article-components.jsx
// Each exported component maps to a Drupal block/paragraph type:
//   SiteHeader      → menu block (utility + primary nav)
//   Breadcrumb      → breadcrumb block
//   HeroMedia       → field_hero_media (media reference)
//   ArticleHero     → node title + dateline + summary + share
//   ArticleBody     → field_body (paragraph collection)
//     RichTextBlock   • kind: "rich_text"
//     PullQuote       • kind: "pull_quote"
//   ContactBlock    → field_press_contact
//   LegalNotes      → field_legal_notes
//   TagList         → field_tags
//   SiteFooter      → menu blocks + footer config
//
// Each component carries a data-jsonblock="..." attribute on its root so the
// "Show JSON mapping" tweak can label the rendered DOM with the Drupal field.

// ───────────────────────── Icon set ─────────────────────────
function Icon({ name, size = 18, stroke = 1.6, color = "currentColor" }) {
  const s = { width: size, height: size, stroke: color, strokeWidth: stroke, fill: "none", strokeLinecap: "round", strokeLinejoin: "round", display: "block" };
  switch (name) {
    case "search": return <svg viewBox="0 0 24 24" style={s}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "finder": return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="4" width="14" height="16" rx="1"/><path d="M7 8h6M7 12h6M7 16h4"/><path d="M17 10l4 4-4 4"/></svg>;
    case "map":    return <svg viewBox="0 0 24 24" style={s}><path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z"/><path d="M9 3v16M15 5v16"/></svg>;
    case "tag":    return <svg viewBox="0 0 24 24" style={s}><path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>;
    case "mail":   return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3 7 9 7 9-7"/></svg>;
    case "home":   return <svg viewBox="0 0 24 24" style={{...s, fill:color, stroke:"none"}}><path d="M12 3 3 11h2v9h5v-5h4v5h5v-9h2L12 3Z"/></svg>;
    case "chev":   return <svg viewBox="0 0 24 24" style={s}><path d="m9 6 6 6-6 6"/></svg>;
    case "play":   return <svg viewBox="0 0 24 24" style={{...s, fill:color, stroke:"none"}}><path d="M8 5v14l11-7z"/></svg>;
    case "fb":     return <svg viewBox="0 0 24 24" style={{...s, fill:color, stroke:"none"}}><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5Z"/></svg>;
    case "x":      return <svg viewBox="0 0 24 24" style={{...s, fill:color, stroke:"none"}}><path d="M17 4h3l-7 8 8 8h-6l-5-6-5 6H2l7-9-7-7h6l4 5 5-5Z"/></svg>;
    case "li":     return <svg viewBox="0 0 24 24" style={{...s, fill:color, stroke:"none"}}><path d="M5 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-2 5h4v11H3V9Zm6 0h4v1.5c.7-1 2-1.8 3.5-1.8 3 0 3.5 2 3.5 4.5V20h-4v-5.6c0-1.4-.4-2.4-1.7-2.4-1.2 0-1.8.9-1.8 2.3V20H9V9Z"/></svg>;
    case "email":  return <svg viewBox="0 0 24 24" style={{...s, fill:color, stroke:"none"}}><path d="M3 6h18v12H3V6Zm2 1v.4l7 4.6 7-4.6V7H5Z"/></svg>;
    case "print":  return <svg viewBox="0 0 24 24" style={{...s, fill:color, stroke:"none"}}><path d="M7 3h10v5H7V3Zm-3 6h16v8h-3v4H7v-4H4V9Zm5 7h6v3H9v-3Z"/></svg>;
    case "link":   return <svg viewBox="0 0 24 24" style={s}><path d="M10 14a4 4 0 0 1 0-6l3-3a4 4 0 1 1 6 6l-1.5 1.5"/><path d="M14 10a4 4 0 0 1 0 6l-3 3a4 4 0 1 1-6-6l1.5-1.5"/></svg>;
    case "yt":     return <svg viewBox="0 0 24 24" style={{...s, fill:color, stroke:"none"}}><path d="M22 8.5c-.2-1.4-.8-2.2-2.2-2.4C18 5.8 12 5.8 12 5.8s-6 0-7.8.3c-1.4.2-2 1-2.2 2.4C1.8 10.2 1.8 12 1.8 12s0 1.8.2 3.5c.2 1.4.8 2.2 2.2 2.4 1.8.3 7.8.3 7.8.3s6 0 7.8-.3c1.4-.2 2-1 2.2-2.4.2-1.7.2-3.5.2-3.5s0-1.8-.2-3.5ZM10 15V9l5 3-5 3Z"/></svg>;
    case "ig":     return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill={color}/></svg>;
    case "arrow":  return <svg viewBox="0 0 24 24" style={s}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "up":     return <svg viewBox="0 0 24 24" style={{...s, fill:color, stroke:"none"}}><path d="m12 7-7 9h14l-7-9Z"/></svg>;
    case "chat":   return <svg viewBox="0 0 24 24" style={{...s, fill:color, stroke:"none"}}><path d="M3 4h18v13H8l-5 4V4Zm5 5v2h2V9H8Zm4 0v2h2V9h-2Zm4 0v2h2V9h-2Z"/></svg>;
    default: return null;
  }
}

// ───────────────────────── Site Header ─────────────────────────
function SiteHeader() {
  const utilStyle = {
    background: "#E9E5DC",
    borderTop: "3px solid var(--accent)",
    color: "var(--ink)",
    fontSize: 13,
  };
  const utilInner = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 0,
    height: 44,
  };
  const utilBtn = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 18px",
    height: "100%",
    color: "var(--ink)",
    textDecoration: "none",
    fontWeight: 500,
    letterSpacing: ".01em",
  };
  const region = {
    marginLeft: 12,
    padding: "0 16px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    background: "#D8D2C2",
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 11,
    letterSpacing: ".1em",
    color: "var(--ink)",
  };

  return (
    <header data-jsonblock="block: site_header">
      <div style={utilStyle}>
        <div className="container" style={utilInner}>
          {SITE.utility_nav.map((u) => (
            <a key={u.label} href="#" style={utilBtn}>
              <Icon name={u.icon} size={16} />
              <span>{u.label}</span>
            </a>
          ))}
          <div style={region}>{SITE.region}</div>
        </div>
      </div>
      <div style={{ background: "var(--paper)", borderBottom: "1px solid var(--rule)" }}>
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 88,
          }}
        >
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "var(--ink)" }}>
            <div
              style={{
                width: 46,
                height: 46,
                background: "var(--ink)",
                color: "var(--paper)",
                display: "grid",
                placeItems: "center",
                fontFamily: '"Barlow Condensed", sans-serif',
                fontWeight: 800,
                fontSize: 30,
                letterSpacing: 0,
                lineHeight: 1,
                clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)",
              }}
            >
              {SITE.brand.mark}
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span className="display" style={{ fontSize: 30, color: "var(--ink)" }}>{SITE.brand.name}</span>
              <span className="eyebrow" style={{ marginTop: 4, color: "var(--accent)" }}>Industrial · est. 1925</span>
            </div>
          </a>
          <nav style={{ display: "flex", alignItems: "center", gap: 38 }}>
            {SITE.primary_nav.map((n, i) => (
              <a
                key={n}
                href="#"
                className="display"
                style={{
                  fontSize: 16,
                  letterSpacing: ".03em",
                  color: "var(--ink)",
                  textDecoration: i === 2 ? "underline" : "none",
                  textUnderlineOffset: 6,
                  textDecorationThickness: 2,
                }}
              >
                {n}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

// ───────────────────────── Breadcrumb ─────────────────────────
function Breadcrumb({ crumbs }) {
  return (
    <div data-jsonblock="block: breadcrumb" style={{ background: "var(--paper)", borderBottom: "1px solid var(--rule)" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", gap: 10, height: 52, fontSize: 13, color: "var(--link)" }}>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <React.Fragment key={i}>
              {i > 0 && <Icon name="chev" size={14} color="var(--body-soft)" />}
              {c.icon === "home" ? (
                <a href={c.href} style={{ display: "flex", color: "var(--link)" }}><Icon name="home" size={16} /></a>
              ) : last ? (
                <span
                  style={{
                    color: "var(--body-soft)",
                    background: "#E9E5DC",
                    padding: "6px 12px",
                    borderRadius: 999,
                    maxWidth: 720,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.label}
                </span>
              ) : (
                <a href={c.href} style={{ color: "var(--link)", textDecoration: "none", background: "#E9E5DC", padding: "6px 14px", borderRadius: 999 }}>
                  {c.label}
                </a>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────── Hero Media ─────────────────────────
function HeroMedia({ media }) {
  return (
    <div data-jsonblock="field_hero_media (media reference)" style={{ background: "var(--ink)", padding: "0 0 0 0" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 40px" }}>
        <div
          style={{
            position: "relative",
            aspectRatio: "16 / 9",
            background:
              "linear-gradient(135deg, #2B3A52 0%, #1E2A40 30%, #4A5566 60%, #2D3848 100%)",
            overflow: "hidden",
          }}
          aria-label={media.poster_alt}
        >
          {/* Striped placeholder texture */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(115deg, rgba(255,255,255,.04) 0 24px, rgba(255,255,255,0) 24px 60px)",
            }}
          />
          {/* Faux horizon */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "62%",
              height: 1,
              background: "rgba(244,241,235,.18)",
            }}
          />
          {/* Placeholder label */}
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 18,
              padding: "6px 10px",
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 11,
              letterSpacing: ".1em",
              color: "rgba(244,241,235,.8)",
              border: "1px solid rgba(244,241,235,.3)",
              textTransform: "uppercase",
            }}
          >
            [ Hero · video ·  {media.duration_sec}s ] — {media.poster_alt}
          </div>
          {/* Play button */}
          <button
            aria-label="Play video"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: "1.5px solid rgba(244,241,235,.7)",
              background: "rgba(11,31,58,.35)",
              backdropFilter: "blur(2px)",
              color: "var(--paper)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Icon name="play" size={32} color="var(--paper)" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Article Hero (title band) ─────────────────────────
function ShareRow({ items }) {
  const map = { facebook: "fb", x: "x", linkedin: "li", email: "email", print: "print", copy: "link" };
  const btn = {
    width: 40, height: 40,
    border: "1.5px solid rgba(244,241,235,.85)",
    color: "var(--paper)",
    display: "grid", placeItems: "center",
    background: "transparent",
    cursor: "pointer",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: "var(--paper)", fontWeight: 500 }}>Share:</span>
      {items.map((k) => (
        <button key={k} aria-label={`Share via ${k}`} style={btn}><Icon name={map[k]} size={18} color="var(--paper)" /></button>
      ))}
    </div>
  );
}

function ArticleHero({ data }) {
  const date = new Date(data.attributes.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <section data-jsonblock="node: title + summary + dateline + share" style={{ background: "var(--accent)", color: "var(--paper)", padding: "44px 0 56px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 40px" }}>
        <h1 className="display" style={{ fontSize: "clamp(40px, 5.2vw, 72px)", color: "var(--paper)", margin: 0, maxWidth: 920 }}>
          {data.attributes.title}
        </h1>
        <div style={{ marginTop: 28, fontFamily: '"IBM Plex Serif", serif', fontStyle: "italic", fontSize: 15, opacity: .95, display: "flex", gap: 18, alignItems: "center" }}>
          <span>{date}</span>
          <span style={{ opacity: .6 }}>|</span>
          <span>{data.attributes.read_minutes} Min Read</span>
        </div>
        <p style={{ marginTop: 22, fontSize: 19, lineHeight: 1.55, color: "var(--paper)", maxWidth: 780, fontWeight: 400 }}>
          {data.attributes.summary}
        </p>
        <div style={{ marginTop: 34, paddingTop: 22, borderTop: "1px solid rgba(244,241,235,.45)" }}>
          <ShareRow items={data.share} />
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── Article Body ─────────────────────────
function RichText({ html }) {
  return (
    <div
      data-jsonblock="paragraph: rich_text"
      style={{ fontSize: 17, lineHeight: 1.72, color: "var(--body)" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function PullQuote({ q }) {
  return (
    <section
      data-jsonblock="paragraph: pull_quote"
      style={{ background: "var(--ink)", color: "var(--paper)", padding: "80px 0", margin: "0" }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 56, alignItems: "start", maxWidth: 980, marginLeft: "auto", marginRight: "auto", paddingLeft: 24, borderLeft: "1px solid rgba(244,241,235,.55)" }}>
          <div>
            <div
              aria-label={q.author.portrait_alt}
              style={{
                width: 220,
                aspectRatio: "1/1",
                background:
                  "linear-gradient(160deg, #3A4863 0%, #1E2A40 100%)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(135deg, rgba(244,241,235,.05) 0 14px, transparent 14px 30px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  right: 8,
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 10,
                  letterSpacing: ".08em",
                  color: "rgba(244,241,235,.7)",
                  textTransform: "uppercase",
                }}
              >
                [ portrait ]
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 600 }}>{q.author.name}</div>
              <div style={{ opacity: .85 }}>{q.author.title}</div>
              <div style={{ opacity: .85 }}>{q.author.org}</div>
            </div>
          </div>
          <blockquote style={{ margin: 0, fontFamily: '"IBM Plex Serif", serif', fontSize: 26, lineHeight: 1.45, fontWeight: 400 }}>
            &ldquo;{q.quote}&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}

function ArticleBody({ blocks }) {
  // Group consecutive rich_text blocks into one paper section so the
  // pull-quote can break out with its own dark band, like the reference.
  const groups = [];
  let buf = [];
  for (const b of blocks) {
    if (b.kind === "pull_quote") {
      if (buf.length) { groups.push({ kind: "paper", items: buf }); buf = []; }
      groups.push({ kind: "quote", q: b });
    } else {
      buf.push(b);
    }
  }
  if (buf.length) groups.push({ kind: "paper", items: buf });

  return (
    <div data-jsonblock="field_body (paragraphs)">
      {groups.map((g, i) =>
        g.kind === "paper" ? (
          <section key={i} style={{ background: "var(--paper)", padding: "72px 0" }}>
            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 40px" }}>
              <div style={{ maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
                {g.items.map((it, j) => <RichText key={j} html={it.html} />)}
              </div>
            </div>
          </section>
        ) : (
          <PullQuote key={i} q={g.q} />
        )
      )}
    </div>
  );
}

// ───────────────────────── Contact + Legal + Tags ─────────────────────────
function ContactBlock({ contact }) {
  return (
    <section data-jsonblock="field_press_contact" style={{ background: "var(--paper)", padding: "0 0 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
          <h3 className="display" style={{ fontSize: 22, color: "var(--ink)", letterSpacing: ".04em", margin: 0 }}>For Further Information</h3>
          <div style={{ marginTop: 20, fontSize: 17, lineHeight: 1.6, color: "var(--body)" }}>
            <div>{contact.name}</div>
            <div>{contact.org}</div>
            <a href={`mailto:${contact.email}`} style={{ color: "var(--link)", textDecoration: "underline" }}>{contact.email}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function LegalNotes({ notes }) {
  return (
    <section data-jsonblock="field_legal_notes" style={{ background: "var(--paper)", padding: "24px 0 32px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ maxWidth: 720, marginLeft: "auto", marginRight: "auto", fontSize: 14, lineHeight: 1.6, color: "var(--body)", display: "flex", flexDirection: "column", gap: 12 }}>
          {notes.map((n, i) => <p key={i} style={{ margin: 0 }}>{n}</p>)}
        </div>
      </div>
    </section>
  );
}

function TagList({ tags }) {
  return (
    <section data-jsonblock="field_tags" style={{ background: "var(--paper)", padding: "8px 0 64px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ maxWidth: 720, marginLeft: "auto", marginRight: "auto", borderTop: "1px solid var(--rule)", paddingTop: 28, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "var(--body-soft)", fontWeight: 500 }}>Tags:</span>
          {tags.map((t) => (
            <a
              key={t.id}
              href="#"
              style={{
                color: "var(--tag)",
                border: "1.5px solid var(--tag)",
                padding: "6px 16px",
                borderRadius: 999,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {t.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── Site Footer ─────────────────────────
function SiteFooter() {
  const f = SITE.footer;
  const socialMap = { facebook: "fb", x: "x", youtube: "yt", instagram: "ig", linkedin: "li" };
  return (
    <footer data-jsonblock="block: site_footer" style={{ background: "var(--ink)", color: "var(--paper)", paddingTop: 64, paddingBottom: 56 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1.3fr 1fr", gap: 48 }}>
          {f.columns.map((col) => (
            <div key={col.heading}>
              <div className="display" style={{ fontSize: 15, letterSpacing: ".08em", marginBottom: 22 }}>{col.heading}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {col.links.map((l) => (
                  <li key={l}><a href="#" style={{ color: "var(--paper)", textDecoration: "none", fontSize: 15 }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <div className="display" style={{ fontSize: 15, letterSpacing: ".08em", marginBottom: 22 }}>{f.partnerships_heading}</div>
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              {f.partnerships.map((p, i) => (
                <React.Fragment key={p}>
                  {i > 0 && <span style={{ opacity: .35 }}>|</span>}
                  <div
                    style={{
                      fontFamily: '"Barlow Condensed", sans-serif',
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      opacity: .9,
                      maxWidth: 110,
                      lineHeight: 1.15,
                    }}
                  >{p}</div>
                </React.Fragment>
              ))}
            </div>
            <div style={{ marginTop: 28, fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, letterSpacing: ".1em", opacity: .55 }}>
              OFFICIAL CONTINENTAL PARTNER
            </div>
          </div>
          <div>
            <div style={{ display: "flex", gap: 18, marginBottom: 30 }}>
              {f.social.map((s) => (
                <a key={s} href="#" aria-label={s} style={{ color: "var(--paper)" }}>
                  <Icon name={socialMap[s]} size={22} color="var(--paper)" />
                </a>
              ))}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
              {f.legal_links.map((l) => (
                <li key={l}><a href="#" style={{ color: "var(--paper)", textDecoration: "none", fontSize: 15 }}>{l}</a></li>
              ))}
            </ul>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: "var(--paper)",
                  color: "var(--ink)",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: '"Barlow Condensed", sans-serif',
                  fontWeight: 800,
                  fontSize: 38,
                  lineHeight: 1,
                  clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)",
                }}
              >
                M
              </div>
              <div className="display" style={{ fontSize: 22, lineHeight: 1, color: "var(--paper)" }}>
                <div>{f.tagline.primary}</div>
                <div style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 400, letterSpacing: ".1em", marginTop: 8, color: "var(--paper)", opacity: .7, textTransform: "uppercase" }}>
                  {f.tagline.secondary}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ───────────────────────── Floating utilities ─────────────────────────
function FloatingUtils() {
  return (
    <div style={{ position: "fixed", right: 0, bottom: 0, zIndex: 30, display: "flex", flexDirection: "column", gap: 0, pointerEvents: "auto" }}>
      <button
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{ width: 56, height: 56, background: "#E9E5DC", color: "var(--ink)", border: 0, display: "grid", placeItems: "center", cursor: "pointer" }}
      >
        <Icon name="up" size={20} color="var(--ink)" />
      </button>
      <button
        aria-label="Live chat"
        style={{ width: 56, height: 68, background: "var(--accent)", color: "var(--paper)", border: 0, display: "grid", placeItems: "center", cursor: "pointer", padding: 6 }}
      >
        <Icon name="chat" size={20} color="var(--paper)" />
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: ".06em", lineHeight: 1, marginTop: 2 }}>
          LIVE<br/>CHAT
        </div>
      </button>
    </div>
  );
}

Object.assign(window, {
  Icon, SiteHeader, Breadcrumb, HeroMedia, ArticleHero,
  ArticleBody, RichText, PullQuote, ContactBlock, LegalNotes, TagList,
  SiteFooter, FloatingUtils,
});
