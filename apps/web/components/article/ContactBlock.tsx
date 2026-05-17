// ContactBlock.tsx — field_press_contact (entity reference)

import type { PressContact } from "@/types/article";

import styles from "./ContactBlock.module.css";

export type ContactBlockProps = {
  contact: PressContact;
};

export function ContactBlock({ contact }: ContactBlockProps) {
  return (
    <section data-jsonblock="field_press_contact" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.column}>
          <h3 className={styles.heading}>For Further Information</h3>
          <div className={styles.body}>
            <div>{contact.name}</div>
            <div>{contact.org}</div>
            <a href={`mailto:${contact.email}`} className={styles.email}>
              {contact.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactBlock;
