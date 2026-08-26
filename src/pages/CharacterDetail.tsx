import { useMemo, useState } from "react";
import { ImageLayer } from "../components/ImageLayer";
import { EmptyState } from "../components/ListChrome";
import { PageHeader } from "../components/PageHeader";
import { buildCharacterDetail, type ChipListCard, type IdSpace } from "../data/detail";
import { href } from "../data/routes";
import { useApp, useDex } from "../store/AppProvider";
import styles from "./CharacterDetail.module.css";
import ui from "../components/ui.module.css";

/** Quantos chips aparecem antes do "+N restantes". */
const CHIP_LIMIT = 18;

export function CharacterDetail({ rawId, space }: { rawId: string; space: IdSpace }) {
  const dex = useDex();
  const { isFavorite, toggleFavorite, addToCompare } = useApp();

  const id = Number(rawId);
  const character = space === "beast" ? dex.tailedBeast(id) : dex.get(id);

  // Miniatura selecionada e chips expandidos: estado local, some ao trocar de ficha
  // (o Router remonta esta tela por `key`).
  const [imageIndex, setImageIndex] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const model = useMemo(
    () => (character ? buildCharacterDetail(dex, character, space) : null),
    [dex, character, space],
  );

  const back =
    space === "beast"
      ? { href: href.beasts, label: "Bestas com cauda" }
      : { href: href.characters, label: "Personagens" };

  if (!character || !model) {
    return (
      <div>
        <PageHeader title="Registro não encontrado" back={back} />
        <EmptyState
          title="Esse id não existe na API"
          hint="Volte para a lista e escolha um registro."
        />
      </div>
    );
  }

  const saved = model.favorable && isFavorite(model.id);
  const mainImage = model.images[imageIndex] ?? model.images[0] ?? "";

  return (
    <div>
      <a href={back.href} className={`${ui.backLink} ${styles.back}`}>
        ← {back.label}
      </a>

      <div className={styles.cols}>
        <div className={`${ui.card} ${styles.side}`}>
          <div className={styles.portrait}>
            <div className={styles.portraitMonogram} aria-hidden>
              {model.initials}
            </div>
            <ImageLayer url={mainImage} label={model.name} />
          </div>

          {model.images.length > 1 && (
            <div className={styles.gallery}>
              {model.images.map((src, i) => (
                <button
                  key={`${i}-${src}`}
                  type="button"
                  className={styles.thumb}
                  style={{ backgroundImage: `url("${src}")` }}
                  aria-current={i === imageIndex}
                  aria-label={`Imagem ${i + 1} de ${model.name}`}
                  onClick={() => setImageIndex(i)}
                />
              ))}
            </div>
          )}

          {model.favorable && (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.action}
                data-on={saved}
                aria-pressed={saved}
                onClick={() => toggleFavorite(model.id)}
              >
                {saved ? "★ Favorito" : "☆ Favoritar"}
              </button>
              <button
                type="button"
                className={styles.action}
                onClick={() => addToCompare(model.id)}
              >
                Comparar
              </button>
            </div>
          )}
        </div>

        <div className={styles.content}>
          <div className={`${ui.card} ${styles.headCard}`}>
            <h1 className={styles.name}>{model.name}</h1>
            <p className={styles.tagline}>{model.tagline}</p>
            <div className={styles.badges}>
              {model.badges.map((badge) => (
                <span key={badge.key} className={`${ui.badge} ${ui[badge.variant]}`}>
                  {badge.text}
                </span>
              ))}
            </div>
            <div className={styles.stats}>
              {model.stats.map((stat) => (
                <div key={stat.label}>
                  <div className={ui.fieldLabel}>{stat.label}</div>
                  <div className={styles.statValue}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {model.linkLists.map((list) => (
            <div key={list.key} className={`${ui.card} ${ui.cardClip}`}>
              <div className={ui.sectionHead}>{list.title}</div>
              <div className={`${ui.sectionBody} ${styles.linkBody}`}>
                {list.items.map((item) => (
                  <div key={item.key} className={styles.linkRow}>
                    <span className={styles.linkLabel}>{item.label}</span>
                    {item.href ? (
                      <a href={item.href} className={styles.linkText}>
                        {item.text}
                      </a>
                    ) : (
                      <span className={styles.linkPlain}>{item.text}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {model.chipLists.map((list) => (
            <ChipCard
              key={list.key}
              list={list}
              open={expanded[list.key] === true}
              onToggle={() =>
                setExpanded((prev) => ({ ...prev, [list.key]: !prev[list.key] }))
              }
            />
          ))}

          {model.related.length > 0 && (
            <div className={`${ui.card} ${ui.cardClip}`}>
              <div className={ui.sectionHead}>{model.relatedTitle}</div>
              <div className={`${ui.sectionBody} ${styles.relatedGrid}`}>
                {model.related.map((c) => (
                  <a key={c.id} href={c.href} className={styles.relatedItem}>
                    <span className={styles.relatedAvatar}>
                      <span className={styles.relatedInitials} aria-hidden>
                        {c.initials}
                      </span>
                      <ImageLayer url={c.image} />
                    </span>
                    <span className={styles.relatedName}>{c.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Naruto tem mais de 100 jutsu: os primeiros 18 aparecem, o resto expande. */
function ChipCard({
  list,
  open,
  onToggle,
}: {
  list: ChipListCard;
  open: boolean;
  onToggle: () => void;
}) {
  const visible = open ? list.items : list.items.slice(0, CHIP_LIMIT);
  const hidden = list.items.length - CHIP_LIMIT;

  return (
    <div className={`${ui.card} ${ui.cardClip}`}>
      <div className={`${ui.sectionHead} ${ui.sectionHeadRow}`}>
        <span>{list.title}</span>
        <span>{list.items.length}</span>
      </div>
      <div className={`${ui.sectionBody} ${ui.chipRow}`}>
        {visible.map((text, i) => (
          <span key={`${text}-${i}`} className={ui.chip}>
            {text}
          </span>
        ))}
        {hidden > 0 && (
          <button type="button" className={ui.btnLinkish} onClick={onToggle}>
            {open ? "mostrar menos" : `+ ${hidden} restantes`}
          </button>
        )}
      </div>
    </div>
  );
}
