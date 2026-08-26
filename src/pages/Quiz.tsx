import { imgOf } from "../data/normalize";
import { useApp, useDex } from "../store/AppProvider";
import styles from "./Quiz.module.css";
import ui from "../components/ui.module.css";

export function Quiz() {
  const dex = useDex();
  const { quiz, answerQuiz, nextQuiz } = useApp();

  const target = quiz.question ? dex.get(quiz.question.targetId) : undefined;
  const options = (quiz.question?.optionIds ?? [])
    .map((id) => dex.get(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const answered = quiz.pick !== null;

  /** Estado visual de cada alternativa depois da resposta. */
  const optionState = (id: number): "right" | "wrong" | "dim" | undefined => {
    if (!answered || !target) return undefined;
    if (id === target.id) return "right";
    if (id === quiz.pick) return "wrong";
    return "dim";
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1 className={ui.pageTitle}>Quem é esse ninja?</h1>
          <p className={ui.pageSub}>Acerte o nome pela imagem.</p>
        </div>
        <div className={styles.score}>
          <div className={ui.fieldLabel}>Acertos</div>
          <div className={styles.scoreValue}>
            {quiz.ok} / {quiz.total}
          </div>
        </div>
      </div>

      {!target ? (
        <div className={`${ui.card} ${styles.empty}`}>
          A API não devolveu personagens suficientes com imagem para montar o quiz.
        </div>
      ) : (
        <div className={`${ui.card} ${ui.cardClip} ${styles.board}`}>
          <div className={styles.stage}>
            <span
              role="img"
              aria-label={answered ? target.name : "Personagem misterioso"}
              className={styles.figure}
              data-revealed={answered}
              style={{ backgroundImage: `url("${imgOf(target)}")` }}
            />
          </div>

          <div className={styles.options}>
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={styles.option}
                data-state={optionState(option.id)}
                disabled={answered}
                onClick={() => answerQuiz(option.id)}
              >
                {option.name}
              </button>
            ))}
          </div>

          <div className={styles.footer}>
            <div className={styles.feedback} role="status">
              {!answered
                ? "Escolha uma alternativa."
                : quiz.pick === target.id
                  ? `Certo — é ${target.name}.`
                  : `Era ${target.name}.`}
            </div>
            <button type="button" className={ui.btnPrimary} onClick={nextQuiz}>
              {answered ? "Próxima" : "Pular"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
