
ALTER TABLE employer_inquiries
  DROP CONSTRAINT employer_inquiries_converted_to_employer_id_fkey;

ALTER TABLE employer_inquiries
  ADD CONSTRAINT employer_inquiries_converted_to_employer_id_fkey
  FOREIGN KEY (converted_to_employer_id) REFERENCES employers(id) ON DELETE SET NULL;
