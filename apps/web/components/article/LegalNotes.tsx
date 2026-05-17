// LegalNotes.tsx — field_legal_notes (string list)

import styles from "./LegalNotes.module.css";

export type LegalNotesProps = {
  notes: string[];
};

export function LegalNotes({ notes }: LegalNotesProps) {
  return (
    <section data-jsonblock="field_legal_notes" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.column}>
          {notes.map((n, i) => (
            <p key={i} className={styles.note}>
              {n}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LegalNotes;
