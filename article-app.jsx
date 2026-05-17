// article-app.jsx
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "showJsonMapping": false,
  "accentColor": "#C2410C",
  "titleBandHue": "amber"
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  amber:   { accent: "#C2410C", accent2: "#E0530C" },
  emerald: { accent: "#0E7C5C", accent2: "#12996F" },
  cobalt:  { accent: "#1F4F8F", accent2: "#2A6BB3" },
  scarlet: { accent: "#B91C1C", accent2: "#DC2626" },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.body.classList.toggle("show-json", !!t.showJsonMapping);
  }, [t.showJsonMapping]);

  React.useEffect(() => {
    const preset = ACCENT_PRESETS[t.titleBandHue] || ACCENT_PRESETS.amber;
    document.documentElement.style.setProperty("--accent", preset.accent);
    document.documentElement.style.setProperty("--accent-2", preset.accent2);
    document.documentElement.style.setProperty("--tag", preset.accent);
  }, [t.titleBandHue]);

  const a = ARTICLE;

  return (
    <React.Fragment>
      <SiteHeader />
      <Breadcrumb crumbs={a.attributes.breadcrumb} />
      <HeroMedia media={a.hero} />
      <ArticleHero data={a} />
      <ArticleBody blocks={a.body} />
      <ContactBlock contact={a.contact} />
      <LegalNotes notes={a.legal} />
      <TagList tags={a.attributes.tags} />
      <SiteFooter />
      <FloatingUtils />

      <TweaksPanel title="Article Reference">
        <TweakSection label="Dev Reference" />
        <TweakToggle
          label="Show JSON mapping"
          value={t.showJsonMapping}
          onChange={(v) => setTweak("showJsonMapping", v)}
        />
        <TweakSection label="Title band" />
        <TweakRadio
          label="Accent"
          value={t.titleBandHue}
          options={["amber", "emerald", "cobalt", "scarlet"]}
          onChange={(v) => setTweak("titleBandHue", v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
