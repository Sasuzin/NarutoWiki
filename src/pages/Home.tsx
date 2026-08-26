import { useMemo } from "react";
import { ImageLayer, SymbolLayer } from "../components/ImageLayer";
import {
  formatNumber,
  imgOf,
  initials,
  memberCount,
  plural,
  rankOf,
  symbolUrl,
} from "../data/normalize";
import { href } from "../data/routes";
import { useDex } from "../store/AppProvider";
import styles from "./Home.module.css";
import ui from "../components/ui.module.css";

/** As cinco grandes nacoes ninja, na ordem canonica. */
const GREAT_VILLAGES = ["Konohagakure", "Sunagakure", "Kirigakure", "Kumogakure", "Iwagakure"];
const TEAM_7 = ["Naruto Uzumaki", "Sasuke Uchiha", "Sakura Haruno", "Kakashi Hatake"];
const BAR_MAX = 90;
const BAR_MIN = 8;

export function Home() {
  const dex = useDex();

  const stats = [
    {
      key: "characters",
      label: "Personagens",
      value: dex.characters.length,
      hint: "elenco completo indexado",
      href: href.characters,
    },
    {
      key: "villages",
      label: "Vilas",
      value: dex.villages.length,
      hint: "aldeias e assentamentos",
      href: href.villages,
    },
    {
      key: "clans",
      label: "Clãs",
      value: dex.clans.length,
      hint: "linhagens registradas",
      href: href.clans,
    },
    {
      key: "teams",
      label: "Times",
      value: dex.teams.length,
      hint: "esquadrões e grupos",
      href: href.teams,
    },
  ];

  const greatVillages = useMemo(
    () =>
      GREAT_VILLAGES.map((name) => dex.villages.find((v) => v.name === name)).filter(
        (v): v is NonNullable<typeof v> => Boolean(v),
      ),
    [dex],
  );

  const featured = useMemo(
    () =>
      TEAM_7.map((name) => dex.findByName(name)).filter(
        (c): c is NonNullable<typeof c> => Boolean(c),
      ),
    [dex],
  );

  const topClans = useMemo(() => {
    const top = [...dex.clans].sort((a, b) => memberCount(b) - memberCount(a)).slice(0, 8);
    const max = memberCount(top[0] ?? { id: -1, name: "" }) || 1;
    return top.map((c) => ({
      clan: c,
      width: Math.max(BAR_MIN, Math.round((memberCount(c) / max) * BAR_MAX)),
    }));
  }, [dex]);

  return (
    <div>
      <div className={styles.head}>
        <div>
          <h1 className={ui.pageTitleLg}>Enciclopédia ninja</h1>
          <p className={ui.pageSubLg}>
            Tudo o que a API Dattebayo expõe — personagens, vilas, clãs, times e organizações — em um
            só painel.
          </p>
        </div>
        <a href={href.quiz} className={ui.btnPrimary}>
          Jogar o quiz
        </a>
      </div>

      <div className={styles.stats}>
        {stats.map((stat) => (
          <a
            key={stat.key}
            href={stat.href}
            className={`${ui.card} ${ui.hoverBrand} ${styles.stat}`}
          >
            <div className={ui.eyebrow}>{stat.label}</div>
            <div className={styles.statValue}>{formatNumber(stat.value)}</div>
            <div className={styles.statHint}>{stat.hint}</div>
          </a>
        ))}
      </div>

      <h2 className={`${ui.eyebrow} ${styles.sectionTitle}`}>As cinco grandes vilas</h2>
      <div className={styles.villages}>
        {greatVillages.map((v) => (
          <a
            key={v.id}
            href={href.village(v.id)}
            className={`${ui.card} ${ui.hoverBrand} ${styles.village}`}
          >
            <span className={styles.villageTile}>
              <span className={styles.villageInitials} aria-hidden>
                {initials(v.name)}
              </span>
              <SymbolLayer url={symbolUrl(v.name)} inset={7} />
            </span>
            <span className={styles.villageText}>
              <span className={styles.villageName}>{v.name}</span>
              <span className={styles.villageCount}>
                {plural(memberCount(v), "personagem", "personagens")}
              </span>
            </span>
          </a>
        ))}
      </div>

      <div className={styles.columns}>
        <div className={`${ui.card} ${ui.cardClip}`}>
          <div className={ui.sectionHead}>Em destaque · Time 7</div>
          <div className={styles.featuredBody}>
            {featured.map((c) => (
              <a key={c.id} href={href.character(c.id)} className={styles.featured}>
                <span className={styles.featuredThumb}>
                  <span className={styles.featuredMonogram} aria-hidden>
                    {initials(c.name)}
                  </span>
                  <ImageLayer url={imgOf(c)} label={c.name} />
                </span>
                <span className={styles.featuredName}>{c.name}</span>
                <span className={styles.featuredRank}>{rankOf(c) || "—"}</span>
              </a>
            ))}
          </div>
        </div>

        <div className={`${ui.card} ${ui.cardClip}`}>
          <div className={ui.sectionHead}>Clãs com mais membros</div>
          <div className={styles.clanBody}>
            {topClans.map(({ clan, width }) => (
              <a key={clan.id} href={href.clan(clan.id)} className={styles.clanRow}>
                <span className={styles.clanName}>{clan.name}</span>
                <span className={styles.clanBar} style={{ width: `${width}px` }} aria-hidden />
                <span className={styles.clanCount}>{memberCount(clan)}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
